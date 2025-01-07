import * as net from 'net';
import logger from './logger';

const socketPath = '../../mathBoardAlgoMLFork/MathBoardAlgoML/build/socket';  // Path to the Unix socket
try {
    (async () => {
        const client = net.createConnection(socketPath, () => {
            console.log('Connected to server!');

            // Send a message to the server
        });
        
        client.write('Hello, Server!');

        client.on('error', (err) => {
            console.error(`Error: ${err.message}`);
        });

        client.on('close', () => { 
            console.log('Server closed the connection.');
        });

        client.on('data', (data) => {
            console.log(`Received from server: ${data.toString()}`);

            // Close the connection after receiving a response
            client.end();
        });
    })();
} catch (err) {
    logger.error("error during test", err);
}