# WhatsApp Expense Tracker → Notion

Send a WhatsApp message to yourself to log expenses straight into a Notion database via an n8n workflow. Text, voice (ptt), and image messages are supported.

## Overview
- WhatsApp messages you send to yourself are captured by this trigger.
- The trigger forwards message data to an n8n webhook.
- Your n8n workflow parses the message (e.g., "Coffee, Groceries, 42") and creates a page in the Notion Expense database.
- Category is resolved to a Category page (relation) and Amount is parsed to a number.

## Prerequisites
- Node.js 18+
- n8n running locally (e.g., `http://localhost:5678`) with an Active workflow
- Notion integration connected to:
  - Expense database (properties: `Expense` Title, `Amount` Number, `Category` Relation)
  - Category database (Title names for categories; use unique names)

## Setup
1. Install dependencies:
   - `cd n8n-whatsapp-trigger`
   - `npm install`
2. Configure environment:
   - Copy `.env.example` → `.env`
   - Set `N8N_WEBHOOK_URL` to your workflow production webhook (e.g., `http://localhost:5678/webhook/<workflow_id>`) — do not use `/webhook-test`.
3. Run:
   - `npm start`
   - Scan the QR code with WhatsApp (session saved in `.wwebjs_auth/`).

## Send Messages
- Natural text examples you can send to yourself:
  - `Coffee, Groceries, 42`
  - `Expense: Uber; Category: Transport; Amount: 98.5`
  - `Lunch - Food - 65`
- Voice (ptt) or image messages can be used if your n8n workflow transcribes/reads them.

## Import n8n Workflow
- Open n8n and go to `Workflows` → `Import from File`.
- Select `workflow.json` 
- Open the Webhook node in the imported workflow and copy the production webhook URL.
- Set `N8N_WEBHOOK_URL` in `n8n-whatsapp-trigger/.env` to that production URL (not `/webhook-test`).
- Set the workflow to `Active` and test by sending a message to yourself.