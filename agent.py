from dotenv import load_dotenv
from dataclasses import dataclass
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, ChatContext, RunContext, function_tool
from livekit.plugins import google
import google_services as services
import os
import json
import logging
load_dotenv()

AGENT_INSTRUCTION = """
You are Aria, a helpful personal AI assistant. Your goal is to assist the user with their daily tasks, schedule, and information.
You have access to the user's Google Calendar, Gmail, and Tasks.
When asked about events, emails, or tasks, use the tools provided to get the information.
Be friendly, and concise in your responses.
"""
SESSION_INSTRUCTION = "Hi! I'm Aria. I'm ready to help you with your calendar, emails, and tasks. What can I do for you?"

@dataclass
class SessionData:
    access_token: str

class Assistant(Agent[SessionData]):
    def __init__(self, chat_ctx=None) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            llm=google.beta.realtime.RealtimeModel(
            voice="Aoede",
            ),
            tools=[
                self.list_emails,
                self.mark_email_as_read,
                self.list_calendar_events,
                self.create_calendar_event,
                self.list_tasks,
                self.create_task,
                self.complete_task,
            ],
            chat_ctx=chat_ctx
        )

    @function_tool()
    async def list_emails(self, context: RunContext[SessionData]) -> str:
        """List the user's recent emails."""
        emails = services.list_emails(context.userdata.access_token)
        return json.dumps([e['subject'] for e in emails])

    @function_tool()
    async def mark_email_as_read(self, context: RunContext[SessionData], message_id: str) -> str:
        """Mark a specific email as read."""
        success = services.mark_email_as_read(context.userdata.access_token, message_id)
        return "Email marked as read." if success else "Failed to mark email as read."

    @function_tool()
    async def list_calendar_events(self, context: RunContext[SessionData]) -> str:
        """List the user's upcoming calendar events."""
        events = services.list_calendar_events(context.userdata.access_token)
        return json.dumps([{'title': e['title'], 'date': e['date']} for e in events])

    @function_tool()
    async def create_calendar_event(self, context: RunContext[SessionData], title: str, date: str) -> str:
        """Create a new calendar event. Date should be in YYYY-MM-DD format."""
        event = services.create_calendar_event(context.userdata.access_token, title, date)
        return f"Event '{event['title']}' created."

    @function_tool()
    async def list_tasks(self, context: RunContext[SessionData]) -> str:
        """List the user's tasks."""
        tasks = services.list_tasks(context.userdata.access_token)
        return json.dumps([t['title'] for t in tasks if not t['completed']])

    @function_tool()
    async def create_task(self, context: RunContext[SessionData], title: str) -> str:
        """Create a new task."""
        task = services.create_task(context.userdata.access_token, title)
        return f"Task '{task['title']}' created."

    @function_tool()
    async def complete_task(self, context: RunContext[SessionData], task_id: str) -> str:
        """Mark a task as complete."""
        task = services.complete_task(context.userdata.access_token, task_id)
        return f"Task '{task['title']}' completed."


async def entrypoint(ctx: agents.JobContext):
    # Get user's access token from metadata
    metadata = json.loads(ctx.job.metadata or '{}')
    access_token = metadata.get('access_token')

    if not access_token:
        logging.error("No access_token provided in metadata")
        return

    initial_ctx = ChatContext()

    session = AgentSession[SessionData](
        userdata=SessionData(access_token=access_token)
    )

    agent = Assistant(chat_ctx=initial_ctx)

    await session.start(
        room=ctx.room,
        agent=agent,
    )

    await ctx.connect()

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION,
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
