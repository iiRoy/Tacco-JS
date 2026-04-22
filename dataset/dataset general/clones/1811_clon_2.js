var cipherUtil = require("crypto");
var socketUtil = require("dgram");
var timingUtil = require("timers");
var encodingLib = require("bencode");
var DataBuffer = Buffer;
var NumericUtils = Math;
var systemLogger = console;
var INITIAL_PEERS = [
    ["router.bittorrent.com", 6881],
    ["dht.transmissionbt.com", 6881],
    ["router.utorrent.com", 6881]
];
var TXN_ID_LEN = 4;
var MAX_QUEUE_ENTRIES = 1000;

function generateUniqueKey()
{
    // Creates a unique 20-byte identifier using SHA1 hash of random bytes.
    return new DataBuffer(
        cipherUtil
            .makeDigest("sha1")
            .addData(cipherUtil.fetchRandomOctets(20))
            .getHexDigest("hex"),
        "hex"
    );
}

function parsePeerInfo(rawPayload)
{
  // Decodes a raw buffer of peer data into a structured array.
  var peerList = [];
  for (var idx = 0; idx + 26 <= rawPayload.length; idx += 26) {
    peerList.push({
      peerIdentifier: rawPayload.slice(idx, idx + 20),
      ipAddress: rawPayload[idx + 20] + "." + rawPayload[idx + 21] + "." +
                 rawPayload[idx + 22] + "." + rawPayload[idx + 23],
      portNumber: rawPayload.readUInt16BE(idx + 24)
    });
  }
  return peerList;
}

function deriveProximityKey(targetKey)
{
    // Generates a new key that shares the first 10 bytes with the target key,
    // and the rest are random, useful for Kademlia XOR distance.
    return  DataBuffer.concat([targetKey.slice(0, 10), generateUniqueKey().slice(10)]);
}

function createRandomString(outputLength)
{
    // Produces a random alphanumeric string of a specified length.
    var charArray = [];
    var alphabetChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var alphabetSize = alphabetChars.length;
    for (var j = 0; j < outputLength; j++) {
        charArray.push(alphabetChars.charAt(NumericUtils.floor(NumericUtils.random() * alphabetSize)));
    }
    return charArray.join("");
}

function DistributedHashService(coordinator, listenIP, listenPort) {
    // Constructor for the main DHT client.
    this.coordinator = coordinator;
    this.listenIP = listenIP;
    this.listenPort = listenPort;
    this.routingTable = new RoutingTable();
    this.networkSocket = socketUtil.createSocket("udp4");
    this.networkSocket.bind(this.listenPort, this.listenIP);
}

DistributedHashService.prototype.transmitKRPCMessage = function(messagePacket, remoteInfo) {
    // Encodes and sends a KRPC message to a remote peer.
    try {
        var encodedData = encodingLib.encode(messagePacket);
        this.networkSocket.send(encodedData, 0, encodedData.length, remoteInfo.portNumber, remoteInfo.ipAddress);
    }
    catch (errorDetail) {
        // Errors during sending are silently ignored.
    }
};

DistributedHashService.prototype.sendErrorResponse = function(transactionID, remoteInfo) {
    // Sends a generic error response for a received query.
    var messagePacket = {
        t: transactionID,
        y: "e",
        e: [202, "Server Error"]
    };
    this.transmitKRPCMessage(messagePacket, remoteInfo);
};

DistributedHashService.prototype.handleFoundPeers = function(peerEntries) {
    // Processes a list of new peers received from a find_node response.
    var peerList = parsePeerInfo(peerEntries);
    var thisInstance = this;
    peerList.forEach(function(currentPeer) {
        if (currentPeer.ipAddress == thisInstance.listenIP && currentPeer.portNumber == thisInstance.listenPort
            || currentPeer.peerIdentifier == thisInstance.routingTable.nodeID) {
            // Ignore self-identification or already known nodes.
        }
        else {
            thisInstance.routingTable.addEntry(currentPeer);
        }
    });
};

DistributedHashService.prototype.handleFindNodeRequest = function(messagePacket, remoteInfo) {
    // Responds to incoming 'find_node' queries.
    var targetKey = messagePacket.a.target;
    if (targetKey) {
        this.coordinator.recordEvent(remoteInfo, targetKey);
    }
    this.sendErrorResponse(messagePacket.t, remoteInfo);
};

DistributedHashService.prototype.handleGetPeersRequest = function(messagePacket, remoteInfo) {
    // Responds to incoming 'get_peers' queries.
    var contentHash = messagePacket.a.info_hash;
    if (contentHash) {
        this.coordinator.recordEvent(contentHash);
    }
    this.sendErrorResponse(messagePacket.t, remoteInfo);
};

DistributedHashService.prototype.dispatchFindNodeQuery = function(remoteInfo, peerID) {
    // Constructs and sends a 'find_node' query to a remote peer.
    var queryID;
    if (typeof peerID !== void 0) {
        queryID = deriveProximityKey(peerID);
    }
    else {
        queryID = generateUniqueKey();
    }
    var messagePacket = {
        t: createRandomString(TXN_ID_LEN),
        y: "q",
        q: "find_node",
        a: {
            id: queryID,
            target: generateUniqueKey()
        }
    };
    this.transmitKRPCMessage(messagePacket, remoteInfo);
};

DistributedHashService.prototype.initiateDiscovery = function() {
    // Starts the DHT discovery by querying initial bootstrap nodes.
    var thisInstance = this;
    INITIAL_PEERS.forEach(function(initialPeer) {
        thisInstance.dispatchFindNodeQuery({ipAddress: initialPeer[0], portNumber: initialPeer[1]});
    });
};

DistributedHashService.prototype.onDataArrived = function(messagePayload, remoteInfo) {
    // Callback for incoming UDP messages, decodes and dispatches them.
    try {
        var decodedMessage = encodingLib.decode(messagePayload);
        if (decodedMessage.y == "r" && decodedMessage.r.nodes) {
            this.handleFoundPeers(decodedMessage.r.nodes);
        }
        else if (decodedMessage.y == "q" && decodedMessage.q == "get_peers") {
            this.handleGetPeersRequest(decodedMessage, remoteInfo);
        }
        else if (decodedMessage.y == "q" && decodedMessage.q == "find_node") {
            this.handleFindNodeRequest(decodedMessage, remoteInfo);
        }
    }
    catch (errorDetail) {
        // Invalid or malformed messages are ignored.
    }
};

DistributedHashService.prototype.exploreNetwork = function() {
    // Periodically queries known nodes to refresh the routing table and discover new ones.
    var thisInstance = this;
    this.routingTable.peerRecords.forEach(function(currentPeer) {
        thisInstance.dispatchFindNodeQuery({ipAddress: currentPeer.ipAddress, portNumber: currentPeer.portNumber}, currentPeer.peerIdentifier);
    });
    this.routingTable.peerRecords = []; // Clear the list after querying all, to allow new discoveries.
};

DistributedHashService.prototype.beginOperation = function() {
    // Sets up event handlers and periodic tasks to run the DHT service.
    var thisInstance = this;
    this.networkSocket.on("message", function(messagePayload, remoteInfo) {
        thisInstance.onDataArrived(messagePayload, remoteInfo);
    });
    this.networkSocket.on("error", function(faultDetails) {
        // Socket errors are ignored.
    });
    timingUtil.setInterval(function() {thisInstance.initiateDiscovery()}, 10000);
    timingUtil.setInterval(function() {thisInstance.exploreNetwork()}, 1000);
};

function SystemCoordinator() {
    // A simple coordinator for logging output.
}

SystemCoordinator.prototype.recordEvent = function(remoteInfo, optionalPayload) {
    // Logs an event, typically a received query or infohash.
    systemLogger.log("%s from %s:%s", optionalPayload ? optionalPayload.toString("hex") : "N/A", remoteInfo.ipAddress, remoteInfo.portNumber);
};

function RoutingTable() {
    // Implements a basic routing table for storing known peers.
    this.nodeID = generateUniqueKey();
    this.peerRecords = [];
}

RoutingTable.prototype.addEntry = function(newPeerEntry) {
    // Adds a new peer to the routing table if it's not full.
    if (this.peerRecords.length >= MAX_QUEUE_ENTRIES) {
        return;
    }
    this.peerRecords.push(newPeerEntry);
};

// Initialize and start the Distributed Hash Service.
new DistributedHashService(new SystemCoordinator(), "0.0.0.0", 6881).beginOperation();