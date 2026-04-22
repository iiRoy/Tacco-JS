const _crypto_module = require("crypto");
const _dgram_module = require("dgram");
const _timer_module = require("timers");

const _bencode_parser = require("bencode");

// Core D.H.T. bootstrap entry points
const INITIAL_PEER_SOURCES = [
    { host: "router.bittorrent.com", port: 6881, protocol: "udp" },
    { host: "dht.transmissionbt.com", port: 6881, protocol: "udp" },
    { host: "router.utorrent.com", port: 6881, protocol: "udp" }
];
// Length in bytes for transaction identifiers
const TRANSACTION_ID_BYTE_COUNT = 4;
// Maximum number of entries in the routing table's node list
const MAX_ROUTING_TABLE_ENTRIES = 1000;
// Represents an unknown or default network interface
const DEFAULT_LISTEN_ADDRESS = "0.0.0.0";
// Standard DHT port
const DEFAULT_LISTEN_PORT = 6881;

/**
 * Generates a cryptographically secure 20-byte Node ID.
 * @returns {Buffer} A Buffer containing the 20-byte node identifier.
 */
function craftUniqueId() {
    const hashAlgorithm = "sha1"; // SHA-1 is used for DHT NIDs
    const randomBytesLength = 20; // 20 bytes for SHA-1 input
    const encodingFormat = "hex"; // Hexadecimal representation for intermediate hash

    const hashGenerator = _crypto_module.createHash(hashAlgorithm);
    const randomData = _crypto_module.randomBytes(randomBytesLength);
    hashGenerator.update(randomData);

    const hexDigest = hashGenerator.digest(encodingFormat);
    return Buffer.from(hexDigest, encodingFormat);
}

/**
 * Parses a Buffer containing compact node information into an array of node objects.
 * Each node entry is 26 bytes: 20 bytes for NID, 4 for IP, 2 for Port.
 * @param {Buffer} compactDataBuffer - The Buffer containing encoded node data.
 * @returns {Array<Object>} An array of node objects, each with 'nid', 'address', and 'port'.
 */
function parseNodeListFromBuffer(compactDataBuffer) {
    const parsedNodes = [];
    const entrySize = 26; // NID (20) + IP (4) + Port (2)

    // Ensure the buffer length is a multiple of the entry size
    if (compactDataBuffer.length % entrySize !== 0) {
        console.warn("Received compact node data with invalid length. Skipping some entries.");
    }

    for (let currentOffset = 0;
         (currentOffset + entrySize) <= compactDataBuffer.length;
         currentOffset += entrySize)
    {
        const nodeIdentifier = compactDataBuffer.slice(currentOffset, currentOffset + 20);
        const ipAddressComponents = [
            compactDataBuffer[currentOffset + 20],
            compactDataBuffer[currentOffset + 21],
            compactDataBuffer[currentOffset + 22],
            compactDataBuffer[currentOffset + 23]
        ];
        const ipAddressString = ipAddressComponents.join(".");
        const nodePort = compactDataBuffer.readUInt16BE(currentOffset + 24);

        parsedNodes.push({
            nid: nodeIdentifier,
            address: ipAddressString,
            port: nodePort
        });
    }
    return parsedNodes;
}

/**
 * Creates a "neighbor" NID by combining parts of a target NID and a random NID.
 * This is used to ensure a new query NID is "close" to a target NID for routing.
 * @param {Buffer} referenceTargetId - The NID to derive proximity from.
 * @returns {Buffer} A new NID that shares the first 10 bytes with the target and the rest are random.
 */
function deriveProximityIdentifier(referenceTargetId) {
    // A target ID must be a Buffer and 20 bytes long
    if (!Buffer.isBuffer(referenceTargetId) || referenceTargetId.length !== 20) {
        console.error("Invalid reference target ID provided for proximity derivation.");
        // Fallback to a completely random ID if input is invalid
        return craftUniqueId();
    }
    const commonPrefix = referenceTargetId.slice(0, 10);
    const randomSuffix = craftUniqueId().slice(10);
    return Buffer.concat([commonPrefix, randomSuffix]);
}

/**
 * Generates a random alphanumeric string for use as a transaction ID.
 * This is not cryptographically secure and is primarily for identifying requests.
 * @param {number} desiredLength - The desired length of the transaction token.
 * @returns {string} A random alphanumeric string.
 */
function createTransactionToken(desiredLength) {
    const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const poolLength = characterPool.length;
    let tokenChars = [];

    // Ensure length is positive
    if (desiredLength <= 0) {
        return "";
    }

    for (let k = 0; k < desiredLength; k++) {
        const randomIndex = Math.floor(Math.random() * poolLength);
        tokenChars.push(characterPool.charAt(randomIndex));
    }
    return tokenChars.join("");
}

/**
 * Represents a Distributed Hash Table (DHT) node.
 * Manages network communication, routing table, and peer discovery.
 */
class DistributedRoutingEngine {
    /**
     * @param {NetworkHostManager} hostManagerInstance - An instance of the host manager for logging.
     * @param {string} listenAddress - The IP address to bind the UDP socket to.
     * @param {number} listenPort - The port to bind the UDP socket to.
     */
    constructor(hostManagerInstance, listenAddress, listenPort) {
        if (!hostManagerInstance || typeof hostManagerInstance.recordEvent !== 'function') {
            throw new Error("Invalid host manager provided to DistributedRoutingEngine.");
        }
        if (typeof listenPort !== 'number' || listenPort < 1 || listenPort > 65535) {
            console.warn(`Invalid or out-of-range listening port (${listenPort}). Using default ${DEFAULT_LISTEN_PORT}.`);
            listenPort = DEFAULT_LISTEN_PORT;
        }
        if (typeof listenAddress !== 'string' || !listenAddress.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
            console.warn(`Invalid listening address (${listenAddress}). Using default ${DEFAULT_LISTEN_ADDRESS}.`);
            listenAddress = DEFAULT_LISTEN_ADDRESS;
        }

        this.hostManager = hostManagerInstance;
        this.listeningAddress = listenAddress;
        this.listeningPort = listenPort;
        this.routingTable = new RoutingTable();
        this.udpSocket = _dgram_module.createSocket("udp4");

        // Bind the UDP socket to the specified address and port
        this.udpSocket.bind(this.listeningPort, this.listeningAddress, () => {
            this.hostManager.recordEvent(null, `DHT node bound to ${this.listeningAddress}:${this.listeningPort}`);
        });
    }

    /**
     * Dispatches a KRPC message over UDP to a remote peer.
     * @param {Object} messagePayload - The KRPC message object to encode and send.
     * @param {Object} remoteInfo - Object containing `port` and `address` of the recipient.
     */
    dispatchKRPCMessage(messagePayload, remoteInfo) {
        if (!remoteInfo || !remoteInfo.port || !remoteInfo.address) {
            this.hostManager.recordEvent(null, "Attempted to send KRPC to invalid remote info.", "error");
            return;
        }
        try {
            const encodedBuffer = _bencode_parser.encode(messagePayload);
            this.udpSocket.send(encodedBuffer, 0, encodedBuffer.length, remoteInfo.port, remoteInfo.address, (err) => {
                if (err) {
                    this.hostManager.recordEvent(remoteInfo, `Error sending KRPC: ${err.message}`, "error");
                }
            });
        } catch (encodingError) {
            this.hostManager.recordEvent(remoteInfo, `Failed to encode KRPC message: ${encodingError.message}`, "error");
            // Optionally, send an error response back if this was a response to a query
            if (messagePayload && messagePayload.y === 'r' && messagePayload.t) {
                this.sendErrorResponse(messagePayload.t, remoteInfo, 203, "Internal Encoding Error");
            }
        }
    }

    /**
     * Sends a generic error response for a KRPC query.
     * @param {Buffer|string} transactionId - The transaction ID of the original query.
     * @param {Object} remoteInfo - Object containing `port` and `address` of the sender.
     * @param {number} errorCode - The bencode error code (e.g., 202 for Server Error).
     * @param {string} errorMessage - A descriptive error message.
     */
    sendErrorResponse(transactionId, remoteInfo, errorCode = 202, errorMessage = "Server Error") {
        const errorMsg = {
            t: transactionId,
            y: "e",
            e: [errorCode, errorMessage]
        };
        this.dispatchKRPCMessage(errorMsg, remoteInfo);
        this.hostManager.recordEvent(remoteInfo, `Sent error response (TID: ${transactionId.toString()})`, "warning");
    }

    /**
     * Processes 'find_node' responses containing a list of nodes.
     * Adds valid new nodes to the routing table.
     * @param {Buffer} receivedNodeData - The compact node data buffer from the response.
     */
    handleNodeDiscoveryResponse(receivedNodeData) {
        if (!receivedNodeData || receivedNodeData.length === 0) {
            this.hostManager.recordEvent(null, "Received empty node data in find_node response.", "info");
            return;
        }

        const discoveredPeers = parseNodeListFromBuffer(receivedNodeData);
        for (const peer of discoveredPeers) {
            // Avoid adding self or nodes with invalid NID/address/port
            if (peer.nid && peer.address && peer.port &&
                !(peer.address === this.listeningAddress && peer.port === this.listeningPort) &&
                !Buffer.compare(peer.nid, this.routingTable.nodeId) === 0)
            {
                this.routingTable.addPeerEntry(peer);
            } else {
                this.hostManager.recordEvent(peer, "Skipping invalid or self-referencing peer from discovery response.", "debug");
            }
        }
        this.hostManager.recordEvent(null, `Processed ${discoveredPeers.length} nodes from discovery response.`, "info");
    }

    /**
     * Handles an incoming 'find_node' query.
     * Currently responds with an error, as this implementation doesn't serve nodes.
     * @param {Object} queryMessage - The decoded KRPC query message.
     * @param {Object} remoteInfo - Object containing `port` and `address` of the sender.
     */
    handleFindNodeRequest(queryMessage, remoteInfo) {
        const targetIdentifier = queryMessage?.a?.target;
        if (targetIdentifier && Buffer.isBuffer(targetIdentifier)) {
            this.hostManager.recordEvent(remoteInfo, `Received find_node for target: ${targetIdentifier.toString("hex")}`, "request");
        } else {
            this.hostManager.recordEvent(remoteInfo, "Received find_node request with missing or invalid target.", "warning");
            this.sendErrorResponse(queryMessage.t, remoteInfo, 203, "Bad Argument: Target ID missing");
            return;
        }
        // In a full DHT, this would return k-nodes closest to the target.
        // For this Type III clone, we just acknowledge and error out.
        this.sendErrorResponse(queryMessage.t, remoteInfo);
    }

    /**
     * Handles an incoming 'get_peers' query.
     * Currently responds with an error, as this implementation doesn't serve peers.
     * @param {Object} queryMessage - The decoded KRPC query message.
     * @param {Object} remoteInfo - Object containing `port` and `address` of the sender.
     */
    handleGetPeersRequest(queryMessage, remoteInfo) {
        const infoHash = queryMessage?.a?.info_hash;
        if (infoHash && Buffer.isBuffer(infoHash)) {
            this.hostManager.recordEvent(remoteInfo, `Received get_peers for infohash: ${infoHash.toString("hex")}`, "request");
        } else {
            this.hostManager.recordEvent(remoteInfo, "Received get_peers request with missing or invalid infohash.", "warning");
            this.sendErrorResponse(queryMessage.t, remoteInfo, 203, "Bad Argument: InfoHash missing");
            return;
        }
        // In a full DHT, this would return peers or nodes for the infohash.
        // For this Type III clone, we just acknowledge and error out.
        this.sendErrorResponse(queryMessage.t, remoteInfo);
    }

    /**
     * Initiates a 'find_node' query to a remote peer.
     * @param {Object} destinationInfo - Object containing `address` and `port` of the recipient.
     * @param {Buffer} [neighborId] - Optional NID to use for proximity. If not provided, a random one is generated.
     */
    initiateNodeLookup(destinationInfo, neighborId) {
        let queryNodeId;
        if (Buffer.isBuffer(neighborId) && neighborId.length === 20) {
            // If a valid neighborId is provided, derive a proximity ID
            queryNodeId = deriveProximityIdentifier(neighborId);
        } else {
            // Otherwise, use a completely random ID for the query
            queryNodeId = craftUniqueId();
        }

        const lookupMessage = {
            t: createTransactionToken(TRANSACTION_ID_BYTE_COUNT), // Transaction ID
            y: "q", // Query type
            q: "find_node", // Query method
            a: {
                id: queryNodeId, // Our node ID for the query
                target: craftUniqueId() // A random target ID to find nodes near
            }
        };
        this.dispatchKRPCMessage(lookupMessage, destinationInfo);
        this.hostManager.recordEvent(destinationInfo, `Initiated find_node query (TID: ${lookupMessage.t})`, "outgoing");
    }

    /**
     * Sends 'find_node' queries to initial bootstrap nodes to join the DHT network.
     */
    bootstrapNetwork() {
        this.hostManager.recordEvent(null, "Bootstrapping network using initial peer sources...", "info");
        for (const source of INITIAL_PEER_SOURCES) {
            if (source.protocol === "udp") { // Ensure we only use UDP sources
                this.initiateNodeLookup({ address: source.host, port: source.port });
            } else {
                this.hostManager.recordEvent(source, `Skipping non-UDP bootstrap source: ${source.host}`, "debug");
            }
        }
    }

    /**
     * Callback for when a UDP packet is received by the socket.
     * Decodes the message and dispatches it to the appropriate handler.
     * @param {Buffer} rawMessageBuffer - The raw UDP message buffer.
     * @param {Object} senderInfo - Object containing `port` and `address` of the sender.
     */
    onPacketReceived(rawMessageBuffer, senderInfo) {
        if (!rawMessageBuffer || rawMessageBuffer.length === 0) {
            this.hostManager.recordEvent(senderInfo, "Received empty UDP packet.", "debug");
            return;
        }

        let decodedMessage;
        try {
            decodedMessage = _bencode_parser.decode(rawMessageBuffer);
            this.hostManager.recordEvent(senderInfo, `Received KRPC message (Type: ${decodedMessage?.y}, Query: ${decodedMessage?.q || 'N/A'})`, "incoming");
        } catch (decodingError) {
            this.hostManager.recordEvent(senderInfo, `Failed to decode KRPC message: ${decodingError.message}`, "error");
            // Cannot respond with error if transaction ID is unknown due to decoding failure
            return;
        }

        // Dispatch logic based on message type ('y') and query ('q')
        const messageType = decodedMessage?.y;
        const queryType = decodedMessage?.q;

        if (messageType === "r" && decodedMessage.r?.nodes) {
            // Response to a 'find_node' query
            this.handleNodeDiscoveryResponse(decodedMessage.r.nodes);
        } else if (messageType === "q") {
            // A query message
            switch (queryType) {
                case "get_peers":
                    this.handleGetPeersRequest(decodedMessage, senderInfo);
                    break;
                case "find_node":
                    this.handleFindNodeRequest(decodedMessage, senderInfo);
                    break;
                // Add more query handlers here for other DHT methods (e.g., 'announce_peer')
                default:
                    this.hostManager.recordEvent(senderInfo, `Received unknown KRPC query: ${queryType}`, "warning");
                    this.sendErrorResponse(decodedMessage.t, senderInfo, 204, `Unknown method: ${queryType}`);
                    break;
            }
        } else if (messageType === "e") {
            // An error response from a remote peer
            const [errorCode, errorMessage] = decodedMessage.e || [0, "Unknown Error"];
            this.hostManager.recordEvent(senderInfo, `Received KRPC error: [${errorCode}] ${errorMessage}`, "error");
        } else {
            this.hostManager.recordEvent(senderInfo, `Received unrecognized KRPC message type: ${messageType}`, "warning");
        }
    }

    /**
     * Periodically explores the network by sending 'find_node' queries to known peers.
     * Clears the routing table's `knownPeers` array after each exploration round.
     */
    periodicallyExploreNetwork() {
        if (this.routingTable.knownPeers.length === 0) {
            this.hostManager.recordEvent(null, "Routing table is empty. Skipping network exploration.", "debug");
            // If table is empty, try to re-bootstrap
            this.bootstrapNetwork();
            return;
        }

        this.hostManager.recordEvent(null, `Initiating network exploration with ${this.routingTable.knownPeers.length} known peers.`, "info");
        // Create a copy of the array to iterate over, as we'll clear the original
        const peersToQuery = [...this.routingTable.knownPeers];

        for (const peer of peersToQuery) {
            // Ensure peer has necessary info before querying
            if (peer.address && peer.port && peer.nid) {
                this.initiateNodeLookup({ address: peer.address, port: peer.port }, peer.nid);
            } else {
                this.hostManager.recordEvent(peer, "Skipping malformed peer entry during exploration.", "debug");
            }
        }
        // Clear the current list of known peers after querying them
        // This simulates a "refresh" of active nodes in a simple manner.
        this.routingTable.knownPeers = [];
    }

    /**
     * Initializes event listeners and starts periodic tasks for the DHT node.
     */
    commenceOperations() {
        this.hostManager.recordEvent(null, "Commencing DHT node operations...", "info");

        // Set up UDP socket event handlers
        this.udpSocket.on("message", (msg, rinfo) => this.onPacketReceived(msg, rinfo));
        this.udpSocket.on("error", (err) => {
            this.hostManager.recordEvent(null, `UDP Socket Error: ${err.message}`, "critical");
            // Potentially re-bind or exit process here, depending on error severity
        });
        this.udpSocket.on("listening", () => {
            const address = this.udpSocket.address();
            this.hostManager.recordEvent(null, `UDP Socket listening on ${address.address}:${address.port}`, "info");
        });
        this.udpSocket.on("close", () => {
            this.hostManager.recordEvent(null, "UDP Socket closed.", "info");
        });

        // Start periodic tasks
        // Bootstrap the network initially
        this.bootstrapNetwork();
        // Periodically refresh the routing table by re-joining the network
        _timer_module.setInterval(() => this.bootstrapNetwork(), 60 * 1000); // Every 1 minute
        // Periodically explore the network using known nodes
        _timer_module.setInterval(() => this.periodicallyExploreNetwork(), 10 * 1000); // Every 10 seconds
    }
}

/**
 * Manages logging and high-level events for the DHT application.
 */
class NetworkHostManager {
    /**
     * Logs an event to the console.
     * @param {Object|null} associatedEntity - An object (e.g., rinfo, peer) associated with the event, or null.
     * @param {string} message - The main log message.
     * @param {string} level - The log level (e.g., "info", "warning", "error", "debug", "request", "outgoing", "incoming", "critical").
     */
    recordEvent(associatedEntity, message, level = "info") {
        const timestamp = new Date().toISOString();
        let prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        let entityInfo = "";

        if (associatedEntity) {
            if (associatedEntity.address && associatedEntity.port) {
                entityInfo = ` <${associatedEntity.address}:${associatedEntity.port}>`;
            } else if (associatedEntity.host && associatedEntity.port) {
                 entityInfo = ` <${associatedEntity.host}:${associatedEntity.port}>`;
            } else if (associatedEntity.nid) {
                entityInfo = ` <NID: ${associatedEntity.nid.toString("hex").substring(0, 8)}...> `;
            }
        }

        // Use console methods corresponding to log levels for better output in some environments
        switch (level) {
            case "error":
            case "critical":
                console.error(`${prefix}${entityInfo} ${message}`);
                break;
            case "warning":
                console.warn(`${prefix}${entityInfo} ${message}`);
                break;
            case "debug":
                console.debug(`${prefix}${entityInfo} ${message}`);
                break;
            default:
                console.info(`${prefix}${entityInfo} ${message}`);
        }
    }
}

/**
 * Manages the local node's routing table (K-bucket concept simplified).
 * Stores a list of known peer nodes.
 */
class RoutingTable {
    constructor() {
        this.nodeId = craftUniqueId(); // This node's unique identifier
        this.knownPeers = []; // List of discovered peer nodes
        console.log(`Local DHT Node ID: ${this.nodeId.toString("hex")}`);
    }

    /**
     * Adds a new peer node entry to the routing table, if capacity allows.
     * Performs basic validation and deduplication.
     * @param {Object} peerNode - The peer node object to add (must have nid, address, port).
     */
    addPeerEntry(peerNode) {
        if (!peerNode || !peerNode.nid || !peerNode.address || !peerNode.port) {
            console.warn("Attempted to add an invalid peer node to routing table.");
            return;
        }

        // Check if the peer already exists in the table to avoid duplicates
        const alreadyExists = this.knownPeers.some(existingPeer =>
            Buffer.compare(existingPeer.nid, peerNode.nid) === 0
            // Optionally check address/port too, but NID is primary identifier
        );

        if (alreadyExists) {
            // console.debug(`Peer ${peerNode.nid.toString("hex").substring(0, 8)}... already in routing table.`);
            return;
        }

        if (this.knownPeers.length >= MAX_ROUTING_TABLE_ENTRIES) {
            console.warn(`Routing table full. Cannot add new peer ${peerNode.address}:${peerNode.port}.`);
            // In a real K-bucket, one would evict the oldest/bad peer.
            return;
        }

        this.knownPeers.push(peerNode);
        // console.log(`Added peer ${peerNode.address}:${peerNode.port} (NID: ${peerNode.nid.toString("hex").substring(0, 8)}...) to routing table. Total: ${this.knownPeers.length}`);
    }
}


// --- Main Application Entry Point ---
// Create an instance of the Network Host Manager
const appHost = new NetworkHostManager();

// Create and start the Distributed Routing Engine (DHT node)
const dhtNode = new DistributedRoutingEngine(appHost, DEFAULT_LISTEN_ADDRESS, DEFAULT_LISTEN_PORT);

// Initiate the DHT node's operations
dhtNode.commenceOperations();