import os
import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def list_emails(access_token: str):
    """
    Lists the 20 most recent emails from the user's inbox.
    """
    credentials = Credentials(token=access_token)
    service = build('gmail', 'v1', credentials=credentials)

    # Call the Gmail API
    results = service.users().messages().list(userId='me', maxResults=20).execute()
    messages = results.get('messages', [])

    emails = []
    if not messages:
        print("No messages found.")
    else:
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id'], format='metadata', metadataHeaders=['Subject', 'From']).execute()

            headers = msg['payload']['headers']
            subject = next((i['value'] for i in headers if i['name'] == 'Subject'), 'No Subject')
            sender = next((i['value'] for i in headers if i['name'] == 'From'), 'Unknown Sender')

            # Extract name from "Name <email@example.com>" format
            if '<' in sender:
                sender = sender.split('<')[0].strip()

            emails.append({
                'id': msg['id'],
                'sender': sender,
                'subject': subject,
                'body': msg['snippet'],
                'read': 'UNREAD' not in msg['labelIds']
            })
    return emails

def mark_email_as_read(access_token: str, message_id: str):
    """
    Marks a specific email as read by removing the 'UNREAD' label.
    """
    credentials = Credentials(token=access_token)
    service = build('gmail', 'v1', credentials=credentials)

    body = {'removeLabelIds': ['UNREAD']}
    try:
        service.users().messages().modify(userId='me', id=message_id, body=body).execute()
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def list_calendar_events(access_token: str):
    """
    Fetches calendar events from the user's primary calendar for the next year.
    """
    credentials = Credentials(token=access_token)
    service = build('calendar', 'v3', credentials=credentials)

    now = f'{datetime.datetime.now(datetime.timezone.utc).isoformat()}Z'
    one_year_from_now = f'{(datetime.datetime.utcnow() + datetime.timedelta(days=365)).isoformat()}Z'

    events_result = service.events().list(
        calendarId='primary', timeMin=now, timeMax=one_year_from_now,
        maxResults=250, singleEvents=True,
        orderBy='startTime'
    ).execute()
    events = events_result.get('items', [])

    calendar_events = []
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        calendar_events.append({
            'id': event['id'],
            'title': event['summary'],
            'date': start
        })
    return calendar_events

def create_calendar_event(access_token: str, title: str, date: str):
    """
    Creates a new all-day event in the user's primary calendar.
    Date should be in 'YYYY-MM-DD' format.
    """
    credentials = Credentials(token=access_token)
    service = build('calendar', 'v3', credentials=credentials)

    event = {
        'summary': title,
        'start': {
            'date': date,
        },
        'end': {
            'date': date,
        },
    }

    created_event = service.events().insert(calendarId='primary', body=event).execute()
    return {
        'id': created_event['id'],
        'title': created_event['summary'],
        'date': created_event['start'].get('date')
    }

def list_tasks(access_token: str):
    """
    Lists all tasks from the user's primary task list.
    """
    credentials = Credentials(token=access_token)
    service = build('tasks', 'v1', credentials=credentials)

    tasklists = service.tasklists().list(maxResults=1).execute()
    if not tasklists.get('items'):
        return []

    task_list_id = tasklists['items'][0]['id']
    results = service.tasks().list(tasklist=task_list_id).execute()
    items = results.get('items', [])

    return [
        {
            'id': item['id'],
            'title': item['title'],
            'completed': item['status'] == 'completed'
        } for item in items
    ]

def create_task(access_token: str, title: str):
    """
    Creates a new task in the user's primary task list.
    """
    credentials = Credentials(token=access_token)
    service = build('tasks', 'v1', credentials=credentials)

    tasklists = service.tasklists().list(maxResults=1).execute()
    if not tasklists.get('items'):
        raise ValueError("No task list found.")

    task_list_id = tasklists['items'][0]['id']
    task = {'title': title}
    result = service.tasks().insert(tasklist=task_list_id, body=task).execute()
    return {
        'id': result['id'],
        'title': result['title'],
        'completed': result.get('status') == 'completed'
    }

def complete_task(access_token: str, task_id: str):
    """
    Marks a task as complete.
    """
    credentials = Credentials(token=access_token)
    service = build('tasks', 'v1', credentials=credentials)

    tasklists = service.tasklists().list(maxResults=1).execute()
    if not tasklists.get('items'):
        raise ValueError("No task list found.")

    task_list_id = tasklists['items'][0]['id']

    task = service.tasks().get(tasklist=task_list_id, task=task_id).execute()
    task['status'] = 'completed'

    result = service.tasks().update(tasklist=task_list_id, task=task_id, body=task).execute()
    return {
        'id': result['id'],
        'title': result['title'],
        'completed': result.get('status') == 'completed'
    }
