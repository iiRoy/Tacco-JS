const webService = require('http');
const addressing = require('path');
const kit = require('util');
const fsAccess = require('fs/promises');
const mimeTypes = require('mime-types');
const { WebSocketServer } = require('ws');
const network = require('net');

const entityIdentifier = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class InteractionCore {
    constructor() {
        this.activeParticipants = new Map(); // Stores { id -> { kind: 'ws'|'tcp', connection: WebSocket|net.Socket, label: string|null } }
        this.groupMemberships = new Map();  // Stores { groupName -> Set<participantId> }
        this.actionProcessors = [];        // Stores { pattern: RegExp, routine: Function }
        this.logUtility = kit; // Renamed util
    }

    // Equivalent to pubsub.listen(server)
    activate(httpConduit) {
        const wsConduit = new WebSocketServer({ server: httpConduit });

        wsConduit.on('connection', (socketObject) => {
            const participantId = entityIdentifier();
            this.activeParticipants.set(participantId, { kind: 'ws', connection: socketObject, label: null });

            socketObject.on('message', (incomingStream) => {
                this.processIncoming(participantId, incomingStream.toString());
            });

            socketObject.on('close', () => {
                this.deregisterParticipant(participantId);
            });

            socketObject.on('error', (err) => {
                console.error("WS Participant Error:", err);
                this.deregisterParticipant(participantId);
            });
        });
    }

    // Equivalent to pubsub.listen_tcp(port, host)
    activateRaw(portNum, hostAddress) {
        const rawConduit = network.createServer((socketObject) => {
            const participantId = entityIdentifier();
            this.activeParticipants.set(participantId, { kind: 'tcp', connection: socketObject, label: null });

            socketObject.on('data', (incomingStream) => {
                this.processIncoming(participantId, incomingStream.toString());
            });

            socketObject.on('close', () => {
                this.deregisterParticipant(participantId);
            });

            socketObject.on('error', (err) => {
                console.error("TCP Participant Error:", err);
                this.deregisterParticipant(participantId);
            });
        });

        rawConduit.listen(portNum, hostAddress, () => {
            console.log(`Raw TCP Conduit active on ${hostAddress}:${portNum}`);
        });
    }

    // Equivalent to pubsub.add_handler(channel, callback)
    attachProcessor(channelPattern, routine) {
        this.actionProcessors.push({ pattern: channelPattern, routine: routine });
    }

    // Equivalent to pubsub.users_in_room(room)
    fetchGroupMembers(groupName) {
        const members = this.groupMemberships.get(groupName);
        if (!members) {
            return [];
        }
        const memberLabels = [];
        for (const participantId of members) {
            const participantData = this.activeParticipants.get(participantId);
            if (participantData && participantData.label) {
                memberLabels.push(participantData.label);
            }
        }
        return memberLabels;
    }

    // Equivalent to pubsub.client_in_room(room, client)
    isMemberOfGroup(groupName, participantReference) {
        const members = this.groupMemberships.get(groupName);
        return members ? members.has(participantReference.id) : false;
    }

    // Equivalent to pubsub.broadcast_room(room, message)
    sendToGroup(groupName, messageContent) {
        const members = this.groupMemberships.get(groupName);
        if (!members) {
            return;
        }
        const serializedContent = JSON.stringify(messageContent);
        for (const participantId of members) {
            const participantData = this.activeParticipants.get(participantId);
            if (participantData && participantData.connection) {
                try {
                    if (participantData.kind === 'ws' && participantData.connection.readyState === WebSocket.OPEN) {
                        participantData.connection.send(serializedContent);
                    } else if (participantData.kind === 'tcp') {
                        participantData.connection.write(serializedContent + '\n');
                    }
                } catch (e) {
                    console.error(`Error transmitting to participant ${participantId} in group ${groupName}:`, e);
                }
            }
        }
    }

    // Internal method to process messages from WS or TCP
    processIncoming(participantId, rawInput) {
        let messageEnvelope;
        try {
            messageEnvelope = JSON.parse(rawInput);
        } catch (e) {
            console.error("Invalid JSON input:", rawInput, e);
            return;
        }

        const currentParticipant = this.activeParticipants.get(participantId);
        if (!currentParticipant) {
            console.warn(`Participant ${participantId} not found for incoming message.`);
            return;
        }

        // Update participant's label if provided in the message payload
        if (messageEnvelope.payload && messageEnvelope.payload.label) {
            currentParticipant.label = messageEnvelope.payload.label;
        }

        // Add participant to the group if they send a message to it
        const targetChannel = messageEnvelope.channel;
        if (targetChannel) {
            if (!this.groupMemberships.has(targetChannel)) {
                this.groupMemberships.set(targetChannel, new Set());
            }
            this.groupMemberships.get(targetChannel).add(participantId);
        }

        // Create a participant object for the handler, mimicking pubsubcore's client parameter
        const participantReference = {
            id: participantId,
            transmit: (responsePayload) => {
                const serializedResponse = JSON.stringify(responsePayload);
                try {
                    if (currentParticipant.kind === 'ws' && currentParticipant.connection.readyState === WebSocket.OPEN) {
                        currentParticipant.connection.send(serializedResponse);
                    } else if (currentParticipant.kind === 'tcp') {
                        currentParticipant.connection.write(serializedResponse + '\n');
                    }
                } catch (e) {
                    console.error(`Error sending response to participant ${participantId}:`, e);
                }
            }
        };

        for (const processor of this.actionProcessors) {
            if (processor.pattern instanceof RegExp) {
                if (processor.pattern.test(messageEnvelope.channel)) {
                    processor.routine(participantReference, {
                        channel: messageEnvelope.channel,
                        payload: messageEnvelope.payload
                    });
                    return;
                }
            } else if (typeof processor.pattern === 'string' && processor.pattern === messageEnvelope.channel) {
                processor.routine(participantReference, {
                    channel: messageEnvelope.channel,
                    payload: messageEnvelope.payload
                });
                return;
            }
        }
        console.warn(`No routine found for channel: ${messageEnvelope.channel}`);
    }

    deregisterParticipant(participantId) {
        const participantData = this.activeParticipants.get(participantId);
        if (participantData) {
            this.activeParticipants.delete(participantId);
            // Remove participant from all groups
            for (const [groupName, members] of this.groupMemberships.entries()) {
                if (members.has(participantId)) {
                    members.delete(participantId);
                    if (members.size === 0) {
                        this.groupMemberships.delete(groupName);
                    }
                }
            }
        }
    }
}


// Serve static files out of ./webroot/
const ASSET_DIRECTORY = addressing.join(addressing.dirname(require.main.filename), 'webroot');

const serverGateway = webService.createServer(async (inquiry, feedback) => {
    let filePath = addressing.join(ASSET_DIRECTORY, inquiry.url === '/' ? 'index.html' : inquiry.url);

    // Basic security: prevent directory traversal
    if (!filePath.startsWith(ASSET_DIRECTORY)) {
        feedback.writeHead(403, { 'Content-Type': 'text/plain' });
        feedback.end('Forbidden');
        return;
    }

    try {
        const fileStat = await fsAccess.stat(filePath);
        if (fileStat.isDirectory()) {
            filePath = addressing.join(filePath, 'index.html'); // Serve index.html for directories
            await fsAccess.stat(filePath); // Check if index.html exists
        }

        const fileContent = await fsAccess.readFile(filePath);
        const contentType = mimeTypes.lookup(filePath) || 'application/octet-stream';

        feedback.writeHead(200, { 'Content-Type': contentType });
        feedback.end(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            feedback.writeHead(404, { 'Content-Type': 'text/plain' });
            feedback.end('Not Found');
        } else {
            feedback.writeHead(500, { 'Content-Type': 'text/plain' });
            feedback.end('Internal Server Error');
            console.error('Static file serving error:', error);
        }
    }
});

// Attach InteractionCore to the HTTP server.
const commsHub = new InteractionCore();
commsHub.activate(serverGateway);

// Requests to the channel "/command/list" return username lists.
commsHub.attachProcessor('/command/list', (participant, dispatchEnvelope) => {
    const monikerList = commsHub.fetchGroupMembers(dispatchEnvelope.payload.space);
    console.log("Occupants in " + dispatchEnvelope.payload.space + ":", commsHub.logUtility.inspect(monikerList));
    participant.transmit({ members: monikerList, channel: '/command/list' });
});

// Requests to any other channel are treated as chat messages.
commsHub.attachProcessor(/.*/, (participant, dispatchEnvelope) => {
    console.log("MSG RECEIVED:", commsHub.logUtility.inspect(dispatchEnvelope));
    // Treat the channel name as the group name. Turn away messages
    // from participants who aren't in the group.
    if (commsHub.isMemberOfGroup(dispatchEnvelope.channel, participant))
        commsHub.sendToGroup(dispatchEnvelope.channel, {
            channel: dispatchEnvelope.channel,
            payload: {
                label: dispatchEnvelope.payload.label,
                content: dispatchEnvelope.payload.content
            }
        });
});

// Start the HTTP server on port 8124, as well as a raw TCP server on
// port 9199.
serverGateway.listen(8124, () => {
    console.log('Web Socket Interface active at http://127.0.0.1:8124/');
});
commsHub.activateRaw(9199, '127.0.0.1');
console.log('Raw TCP Interface active at 127.0.0.1:9199');