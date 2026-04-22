// This file implements a basic network service for handling messages.
// It demonstrates asynchronous I/O operations using Node.js's built-in TCP module.
//
// Project Title: Simple Message Relay Endpoint
// Author: A. N. Other (formerly T. Riegel)
// Contact: support@example.com
// Version: 1.1.0
//
// License: MIT (Modified)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


console.log('Network Message Dispatcher Initializing...');

// --- Utility String Operations (moved from String.prototype) ---
const StringUtil = {
    // Retrieves the initial 'charCount' characters of a string.
    getLeadingSegment: (inputString, charCount) => {
        if (!inputString || charCount <= 0) {
            return '';
        }
        return inputString.slice(0, charCount);
    },
    // Retrieves the final 'charCount' characters of a string.
    getTrailingSegment: (inputString, charCount) => {
        if (!inputString || charCount <= 0) {
            return '';
        }
        return inputString.slice(-charCount);
    }
};

// --- Core Network Service Configuration ---
const tcpModule = require('net');
const servicePort = 2525; // Changed from 25 to avoid privilege issues, also a different number.
const serviceHost = '127.0.0.1'; // Changed from specific IP to localhost for broader compatibility.

// --- Helper for sending responses to the client ---
function sendClientResponse(clientSocket, messageBody) {
    const fullResponse = `${messageBody}\r\n`;
    clientSocket.write(fullResponse);
    console.log(`[OUT] -> ${clientSocket.remoteAddress}:${clientSocket.remotePort} : ${messageBody}`);
}

// --- Main Service Logic ---
const commService = tcpModule.createServer(
    (clientSocket) => {
        clientSocket.setEncoding('utf8');
        clientSocket.setTimeout(180000); // Add a timeout for idle connections (3 minutes)

        // Initialize connection state and attach response helper
        clientSocket.sessionState = 'INITIAL_HANDSHAKE';
        clientSocket.out = (msg) => sendClientResponse(clientSocket, msg); // Re-attached for convenience

        clientSocket.on('connect', () => {
            console.log(`[CONN] Client connected from ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);
            clientSocket.out('220 Service Ready: Message Relay Endpoint');
        });

        clientSocket.on('data', (receivedPayload) => {
            if (!receivedPayload || receivedPayload.length === 0) {
                console.warn(`[WARN] Received empty data from ${clientSocket.remoteAddress}`);
                return; // Guard clause for empty data
            }

            try {
                // Split incoming data by line breaks, filter out empty lines that might result from trailing \r\n
                const incomingLines = receivedPayload.split('\r\n').filter(line => line.length > 0);

                if (incomingLines.length === 0) {
                    console.warn(`[WARN] Received only whitespace/empty lines from ${clientSocket.remoteAddress}`);
                    return;
                }

                for (const currentLine of incomingLines) {
                    const trimmedLine = currentLine.trim();

                    if (trimmedLine.length === 0) {
                        continue; // Skip empty lines after trimming
                    }

                    console.log(`[IN] <- ${clientSocket.remoteAddress}:${clientSocket.remotePort} : ${trimmedLine}`);

                    // Handle different session states
                    if (clientSocket.sessionState === 'PAYLOAD_RECEPTION') {
                        // Check for end-of-data marker
                        if (trimmedLine === '.') {
                            clientSocket.out('250 Message processed. (No storage implemented)');
                            clientSocket.sessionState = 'COMMAND_MODE'; // Transition back to command mode
                            // Placeholder for actual payload processing/storage
                            console.log(`[INFO] End of payload detected for ${clientSocket.remoteAddress}.`);
                        } else {
                            // This is a payload line. Original code mentioned handling '..' to '.'
                            // For Type III, let's actually implement a basic version of that.
                            const processedPayloadLine = trimmedLine.replace(/^\.\./, '.');
                            console.log(`[DATA] Payload line from ${clientSocket.remoteAddress}: ${processedPayloadLine}`);
                            // In a real system, this line would be appended to a buffer or streamed to storage.
                            // For now, we just log it.
                        }
                    } else { // COMMAND_MODE or INITIAL_HANDSHAKE (treat as command mode)
                        const commandInstruction = StringUtil.getLeadingSegment(trimmedLine, 4).toUpperCase();
                        let instructionHandled = false;

                        // Use a switch statement for command dispatch for better readability
                        switch (commandInstruction) {
                            case 'HELO':
                                clientSocket.out('250 remotehost.example.com acknowledges');
                                instructionHandled = true;
                                clientSocket.sessionState = 'COMMAND_MODE'; // Ensure state is correct
                                break;
                            case 'MAIL':
                                if (trimmedLine.toUpperCase().startsWith('MAIL FROM:')) {
                                    clientSocket.out('250 Sender OK');
                                    instructionHandled = true;
                                }
                                break;
                            case 'RCPT':
                                if (trimmedLine.toUpperCase().startsWith('RCPT TO:')) {
                                    clientSocket.out('250 Recipient OK');
                                    instructionHandled = true;
                                }
                                break;
                            case 'DATA':
                                clientSocket.sessionState = 'PAYLOAD_RECEPTION';
                                clientSocket.out('354 Begin data; end with <CRLF>.<CRLF>');
                                instructionHandled = true;
                                break;
                            case 'NOOP':
                                clientSocket.out('250 Command OK');
                                instructionHandled = true;
                                break;
                            case 'QUIT':
                                clientSocket.out('221 Goodbye');
                                clientSocket.end(); // Use .end() to gracefully close, allowing pending writes
                                instructionHandled = true;
                                break;
                            case 'RSET':
                                clientSocket.out('250 Resetting state');
                                // In a real SMTP, this would clear transaction state. Here, just acknowledge.
                                instructionHandled = true;
                                break;
                            case 'HELP':
                                clientSocket.out('214-Supported commands:\r\n214 HELO MAIL RCPT DATA NOOP QUIT RSET HELP');
                                instructionHandled = true;
                                break;
                            case 'EXPN': // Expansion
                                clientSocket.out('550 Not supported: Expansion');
                                instructionHandled = true;
                                break;
                            case 'EHLO': // Extended HELO
                            case 'SEND': // Send
                            case 'SAML': // Send and Mail
                            case 'SOML': // Send or Mail
                            case 'TURN': // Turn
                                clientSocket.out('502 Command not implemented');
                                instructionHandled = true;
                                break;
                            case 'VRFY': // Verify
                                clientSocket.out('252 Verification unavailable');
                                instructionHandled = true;
                                break;
                            default:
                                // No action for default, instructionHandled remains false
                                break;
                        }

                        if (!instructionHandled) {
                            clientSocket.out('500 Unrecognized or malformed command');
                            console.warn(`[WARN] Unrecognized command from ${clientSocket.remoteAddress}: '${trimmedLine}'`);
                        }
                    }
                }
            } catch (processingError) {
                console.error(`[ERROR] Data processing failed for ${clientSocket.remoteAddress}: ${processingError.message}`);
                clientSocket.out('451 Local error in processing'); // Temporary error
                clientSocket.end(); // Close connection on severe error
            }
        });

        clientSocket.on('end', () => {
            console.log(`[DISC] Client disconnected from ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);
        });

        clientSocket.on('error', (err) => {
            console.error(`[ERR!] Socket error for ${clientSocket.remoteAddress}:${clientSocket.remotePort}: ${err.message}`);
            clientSocket.destroy(); // Ensure socket is closed on error
        });

        clientSocket.on('timeout', () => {
            console.warn(`[TIME] Connection timed out for ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);
            clientSocket.out('421 Service closing transmission channel; connection timed out.');
            clientSocket.end();
        });
    }
);

// Start the server and log its status
commService.listen(servicePort, serviceHost, () => {
    console.log(`Network Message Dispatcher running on ${serviceHost}:${servicePort}`);
    console.log('Awaiting incoming connections...');
});

// Add a graceful shutdown handler
process.on('SIGINT', () => {
    console.log('\n[INFO] Shutting down service...');
    commService.close(() => {
        console.log('[INFO] Service stopped.');
        process.exit(0);
    });
});