const cryp = require("crypto");
const netSock = require("dgram");
const timeOps = require("timers");
const encodeUtil = require("bencode");

const INITIAL_ENTRY_POINTS = [
    { host: "router.bittorrent.com", port: 6881 },
    { host: "dht.transmissionbt.com", port: 6881 },
    { host: "router.utorrent.com", port: 6881 }
];
const TRANSACTION_ID_SIZE = 4;
const PEER_CACHE_LIMIT = 1000;

const produceUniqueToken = () => {
    const hashGenerator = cryp.createHash("sha1");
    hashGenerator.update(cryp.randomBytes(20).toString("hex"));
    return Buffer.from(hashGenerator.digest("hex"), "hex");
};

const parsePeerPayload = (payloadBuffer, accumulator = []) => {
    if (payloadBuffer.length < 26) {
        return accumulator;
    }
    const currentPeer = {
        id: payloadBuffer.subarray(0, 20),
        addr: [
            payloadBuffer[20],
            payloadBuffer[21],
            payloadBuffer[22],
            payloadBuffer[23]
        ].join("."),
        prt: payloadBuffer.readUInt16BE(24)
    };
    return parsePeerPayload(payloadBuffer.subarray(26), [...accumulator, currentPeer]);
};

const createCloseIdentifier = (referenceTarget) =>
    Buffer.concat([referenceTarget.subarray(0, 10), produceUniqueToken().subarray(10)]);

const generateRandomString = (charCount) => {
    const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: charCount }, () =>
        characterPool.charAt(Math.floor(Math.random() * characterPool.length))
    ).join("");
};

class LogManager {
    recordEvent(remoteInfo, identifier) {
        console.log(`Payload: ${identifier.toString("hex")} from ${remoteInfo.addr}:${remoteInfo.prt}`);
    }
}

class PeerStore {
    constructor() {
        this.identifier = produceUniqueToken();
        this.cachedPeers = [];
    }
    addPeer(peerData) {
        if (this.cachedPeers.length < PEER_CACHE_LIMIT) {
            this.cachedPeers.push(peerData);
        }
    }
}

class NetworkAgent {
    constructor(monitorInstance, hostAddress, hostPort) {
        this.monitor = monitorInstance;
        this.localAddress = hostAddress;
        this.localPort = hostPort;
        this.peerRegistry = new PeerStore();
        this.socket = netSock.createSocket("udp4");
        this.socket.bind(this.localPort, this.localAddress);
    }

    dispatchPacket(messageObject, remoteInfo) {
        try {
            const dataBuffer = encodeUtil.encode(messageObject);
            this.socket.send(dataBuffer, 0, dataBuffer.length, remoteInfo.prt, remoteInfo.addr);
        } catch (ex) {
            // Suppress network errors
        }
    }

    sendErrorResponse(transactionId, remoteInfo) {
        const errorMessage = {
            t: transactionId,
            y: "e",
            e: [202, "Service Fault"]
        };
        this.dispatchPacket(errorMessage, remoteInfo);
    }

    handleNodeDiscovery(discoveredNodes) {
        const parsedNodes = parsePeerPayload(discoveredNodes);
        parsedNodes.forEach(node => {
            const isSelf = node.addr === this.localAddress && node.prt === this.localPort;
            const isSelfId = node.id.equals(this.peerRegistry.identifier);
            if (!isSelf && !isSelfId) {
                this.peerRegistry.addPeer(node);
            }
        });
    }

    handleQueryForNode(messagePayload, remoteInfo) {
        const { a: { target: queryTarget } } = messagePayload;
        if (queryTarget) {
            this.monitor.recordEvent(remoteInfo, queryTarget);
        }
        this.sendErrorResponse(messagePayload.t, remoteInfo);
    }

    handleQueryForPeers(messagePayload, remoteInfo) {
        const { a: { info_hash: queryInfohash } } = messagePayload;
        if (queryInfohash) {
            this.monitor.recordEvent(remoteInfo, queryInfohash);
        }
        this.sendErrorResponse(messagePayload.t, remoteInfo);
    }

    requestNodeInfo(remoteInfo, peerIdentifier) {
        const queryId = peerIdentifier ? createCloseIdentifier(peerIdentifier) : produceUniqueToken();
        const requestMessage = {
            t: generateRandomString(TRANSACTION_ID_SIZE),
            y: "q",
            q: "find_node",
            a: {
                id: queryId,
                target: produceUniqueToken()
            }
        };
        this.dispatchPacket(requestMessage, remoteInfo);
    }

    connectToInitialPeers() {
        INITIAL_ENTRY_POINTS.forEach(entry => {
            this.requestNodeInfo({ addr: entry.host, prt: entry.port });
        });
    }

    processIncomingMessage(messageBuffer, remoteInfo) {
        try {
            const decodedMessage = encodeUtil.decode(messageBuffer);

            const messageDispatch = {
                'r': (msg) => {
                    if (msg.r && msg.r.nodes) {
                        this.handleNodeDiscovery(msg.r.nodes);
                    }
                },
                'q': (msg) => {
                    if (msg.q === "get_peers") {
                        this.handleQueryForPeers(msg, remoteInfo);
                    } else if (msg.q === "find_node") {
                        this.handleQueryForNode(msg, remoteInfo);
                    }
                }
            };

            if (decodedMessage.y && messageDispatch[decodedMessage.y]) {
                messageDispatch[decodedMessage.y](decodedMessage);
            }

        } catch (ex) {
            // Ignore malformed messages
        }
    }

    exploreNetwork() {
        this.peerRegistry.cachedPeers.forEach(peer => {
            this.requestNodeInfo({ addr: peer.addr, prt: peer.prt }, peer.id);
        });
        this.peerRegistry.cachedPeers = []; // Clear cache after "wandering"
    }

    initiateOperations() {
        this.socket.on("message", (msg, rinfo) => {
            this.processIncomingMessage(msg, { addr: rinfo.address, prt: rinfo.port });
        });
        this.socket.on("error", (err) => {
            // Handle socket errors, or ignore for robustness
        });
        timeOps.setInterval(() => this.connectToInitialPeers(), 10000);
        timeOps.setInterval(() => this.exploreNetwork(), 1000);
    }
}

const systemMonitor = new LogManager();
const mainNetworkService = new NetworkAgent(systemMonitor, "0.0.0.0", 6881);
mainNetworkService.initiateOperations();