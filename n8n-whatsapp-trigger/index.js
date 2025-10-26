const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

// --- Configuration ---
// PASTE THE TEST WEBHOOK URL FROM YOUR n8n WORKFLOW HERE
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
if (!N8N_WEBHOOK_URL) {
  console.error('Missing N8N_WEBHOOK_URL. Copy .env.example to .env and set your production webhook URL.');
  process.exit(1);
}

// --- WhatsApp Client Initialization ---
const client = new Client({
    authStrategy: new LocalAuth()
});

console.log('Initializing WhatsApp client...');

client.on('qr', (qr) => {
    console.log('QR Code generated. Scan it with your phone.');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    console.log('Listening for messages you send to yourself...');
});

// --- Listen for messages sent BY YOU ---
client.on('message_create', async (msg) => {
    // The 'fromMe' property is true if you sent the message.
    if (msg.fromMe) {
        console.log(`[Message Sent by Me] To: ${msg.to} | Body: ${msg.body}`);

        // We assume a "message to self" is where the 'to' is your own number.
        // WhatsApp formats your own number ID like `[country_code][number]@c.us`
        // We can check if 'to' and 'from' parts are the same after formatting.
        const myId = client.info.wid._serialized;
        
        if (msg.to === myId) {
             console.log(`-> It's a message to myself! Forwarding to n8n...`);

            try {
                const payload = {
                    from: msg.from,
                    to: msg.to,
                    timestamp: msg.timestamp
                };

                if (msg.type === 'ptt') {
                    console.log('-> It\'s a voice message!');
                    const media = await msg.downloadMedia();
                    payload.message = media.data;
                    payload.mimetype = media.mimetype;
                    payload.type = 'voice';
                } else if (msg.type === 'image') {
                    console.log('-> It\'s an image message!');
                    const media = await msg.downloadMedia();
                    payload.message = media.data;
                    payload.mimetype = media.mimetype;
                    payload.type = 'image';
                } else {
                    console.log('-> It\'s a text message!');
                    payload.message = msg.body;
                    payload.type = 'text';
                }

                // Send the message data to the n8n webhook
                await axios.post(N8N_WEBHOOK_URL, payload);
                console.log('-> Successfully sent to n8n.');

            } catch (error) {
                console.error('Error sending message to n8n:', error.message);
            }
        }
    }
});

client.initialize();