from dotenv import load_dotenv
from dataclasses import dataclass
from livekit import agents
from livekit.agents import Agent, AgentSession, ChatContext, RunContext, function_tool
from livekit.protocol import ChatMessage
from livekit.plugins import google
import google_services as services
from memori import Memori, create_memory_tool
import os
import json
import logging
import time

load_dotenv()

# Agent Definitions
AGENT_INSTRUCTION = """
You are Aria, an advanced personal assistant with a conscious memory.
Your capabilities:
1. **Google Integration**: You have access to the user's Google Calendar, Gmail, and Tasks.
2. **Persistent Memory**: You remember everything from our conversations to learn about the user's preferences, projects, and goals.
3. **Proactive Memory**: You can use memory tools to find specific information when needed.
Guidelines:
- Be helpful, friendly, and increasingly personalized.
- Use your tools to interact with Google services and your memory.
"""
SESSION_INSTRUCTION = "Hi! I'm Aria, your personal AI assistant. I'm ready to help you with your calendar, emails, and tasks, and I'll remember our conversations to provide better assistance in the future. What can I do for you today?"

# Data Structures
@dataclass
class SessionData:
    access_token: str
    user_id: str

# Memory Management
user_memories: dict[str, dict] = {}

def get_or_create_user_memory(user_id: str) -> Memori:
    now = time.time()
    if user_id not in user_memories:
        logging.info(f"Creating new memory for user: {user_id}")
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable not set.")
        user_memory = Memori(
            database_connect=database_url,
            namespace=f"livekit_user_{user_id}",
            conscious_ingest=True,
        )
        user_memory.enable()
        user_memories[user_id] = {"memory": user_memory, "last_access": now}
    else:
        user_memories[user_id]["last_access"] = now
    return user_memories[user_id]["memory"]

def cleanup_inactive_user_memories(timeout_seconds=3600):
    now = time.time()
    inactive_users = [
        user_id for user_id, data in user_memories.items()
        if now - data.get("last_access", 0) > timeout_seconds
    ]
    for user_id in inactive_users:
        logging.info(f"Cleaning up inactive memory for user: {user_id}")
        del user_memories[user_id]

# Agent Tools
@function_tool()
async def search_memory(context: RunContext[SessionData], query: str, category: str = None) -> str:
    memori = get_or_create_user_memory(context.userdata.user_id)
    try:
        if category:
            results = memori.search_memories_by_category(category, limit=5)
            relevant = [r for r in results if query.lower() in str(r).lower()]
            return json.dumps(relevant[:3], indent=2) if relevant else "No relevant memories found"
        else:
            memory_tool = create_memory_tool(memori)
            result = memory_tool.execute(query=query)
            return result if result is not None else "No relevant memories found"
    except Exception as e:
        return f"Memory search error: {str(e)}"

@function_tool()
async def get_essential_info(context: RunContext[SessionData]) -> str:
    memori = get_or_create_user_memory(context.userdata.user_id)
    try:
        if essential := memori.get_essential_conversations(limit=10):
            info = [f"- {conv.get('summary', conv.get('content', ''))}" for conv in essential if isinstance(conv, dict) and conv.get('summary', conv.get('content', ''))]
            return "Essential information about you:\\n" + "\\n".join(info[:5])
        return "No essential information available yet."
    except Exception as e:
        return f"Error getting essential info: {str(e)}"

@function_tool()
async def list_emails(context: RunContext[SessionData]) -> str:
    return json.dumps([e['subject'] for e in services.list_emails(context.userdata.access_token)])

@function_tool()
async def mark_email_as_read(context: RunContext[SessionData], message_id: str) -> str:
    return "Email marked as read." if services.mark_email_as_read(context.userdata.access_token, message_id) else "Failed to mark email as read."

@function_tool()
async def list_calendar_events(context: RunContext[SessionData]) -> str:
    events = services.list_calendar_events(context.userdata.access_token)
    return json.dumps([{'title': e['title'], 'date': e['date']} for e in events])

@function_tool()
async def create_calendar_event(context: RunContext[SessionData], title: str, date: str) -> str:
    event = services.create_calendar_event(context.userdata.access_token, title, date)
    return f"Event '{event['title']}' created."

@function_tool()
async def list_tasks(context: RunContext[SessionData]) -> str:
    tasks = services.list_tasks(context.userdata.access_token)
    return json.dumps([t['title'] for t in tasks if not t['completed']])

@function_tool()
async def create_task(context: RunContext[SessionData], title: str) -> str:
    task = services.create_task(context.userdata.access_token, title)
    return f"Task '{task['title']}' created."

@function_tool()
async def complete_task(context: RunContext[SessionData], task_id: str) -> str:
    task = services.complete_task(context.userdata.access_token, task_id)
    return f"Task '{task['title']}' completed."


class Assistant(Agent[SessionData]):
    async def on_chat_message(self, message: 'ChatMessage') -> None:
        # Add user message to chat history
        self.chat_ctx.add_message(role='user', content=message.message)

        # Generate a reply
        await self.session.generate_reply()


async def entrypoint(ctx: agents.JobContext):
    metadata = json.loads(ctx.job.metadata or '{}')
    access_token = metadata.get('access_token')
    user_id = metadata.get('user_id')

    if not access_token or not user_id:
        logging.error("No access_token or user_id provided in metadata")
        return

    cleanup_inactive_user_memories()
    get_or_create_user_memory(user_id)

    agent = Assistant(
        instructions=AGENT_INSTRUCTION,
        tools=[
            list_emails,
            mark_email_as_read,
            list_calendar_events,
            create_calendar_event,
            list_tasks,
            create_task,
            complete_task,
            search_memory,
            get_essential_info,
        ],
    )

    session = AgentSession[SessionData](
        userdata=SessionData(access_token=access_token, user_id=user_id)
    )

    try:
        await session.start(room=ctx.room, agent=agent)
        await ctx.connect()
    except Exception as e:
        logging.error(f"Error starting agent session: {e}")
        return
    # The agent will now wait for user messages instead of starting the conversation
    # await session.generate_reply(instructions=SESSION_INSTRUCTION)

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
