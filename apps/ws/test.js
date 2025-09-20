import WebSocket from 'ws';
import jwt from 'jsonwebtoken';

//valid JWT token for testing
const testToken = jwt.sign(
    { userId: 'test-user-123' }, 
    '123123',
    { expiresIn: '1h' }
);

console.log('Test token:', testToken);

const ws = new WebSocket(`ws://localhost:8080?token=${testToken}`);

ws.on('open', () => {
    console.log('Connected!');
    
    // Send a ping message first
    ws.send(JSON.stringify({ type: 'ping' }));
    
    // Send join room message
    setTimeout(() => {
        ws.send(JSON.stringify({
            type: 'join-room',
            roomId: '1'
        }));
    }, 1000);
});

ws.on('message', (data) => {
    console.log('Received:', JSON.parse(data.toString()));
});

ws.on('error', (error) => {
    console.error('Error:', error);
});

ws.on('close', () => {
    console.log('Disconnected');
});