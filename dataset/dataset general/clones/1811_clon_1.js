/*
 * This file implements a basic Kademlia Distributed Hash Table (DHT) node
 * in JavaScript. It utilizes the 'bencode' library for message serialization
 * and standard Node.js modules for networking and cryptography.
 *
 * This implementation focuses on the discovery and routing aspects of a DHT,
 * serving as a foundation for more complex peer-to-peer applications.
 */

var crypto = require ( "crypto" ) ;  // Node.js built-in module for cryptographic functions.
var dgram = require ( "dgram" ) ;    // Node.js built-in module for UDP datagram sockets.
var timers = require ( "timers" ) ;  // Node.js built-in module for timer functions like setInterval.

var bencode = require ( "bencode" ) ; // External library for Bencode encoding/decoding, common in BitTorrent.

// Default list of bootstrap nodes to join the DHT network.
// Each entry is an array: [hostname_or_ip, port].
var BOOTSTRAP_NODES =
[
  [ "router.bittorrent.com" , 6881 ] ,
  [ "dht.transmissionbt.com" , 6881 ] ,
  [ "router.utorrent.com" , 6881 ]
] ;

var TID_LENGTH = 4 ;       // The length in bytes for Transaction IDs (TID) in KRPC messages.
var MAX_QNODE_SIZE = 1000 ;  // Maximum number of nodes to store in the KTable for discovery.

/**
 * Generates a random 20-byte Node ID (NID) for the DHT.
 * NIDs are used to identify nodes uniquely within the Kademlia network.
 *
 * @returns {Buffer} A 20-byte Buffer representing the random Node ID.
 */
function randomID ( )
{
    return new Buffer (
        crypto . createHash ( "sha1" )           // Use SHA-1 hashing algorithm.
            . update ( crypto . randomBytes ( 20 ) ) // Hash 20 random bytes to ensure uniqueness.
            . digest ( "hex" ) ,                 // Get the hash output as a hexadecimal string.
        "hex"                                    // Specify that the input string is hex-encoded.
    ) ;
}

/**
 * Decodes a buffer containing a list of compact node info.
 * Each node entry is 26 bytes: 20-byte NID, 4-byte IP, 2-byte Port.
 *
 * @param {Buffer} data - The buffer containing encoded node information.
 * @returns {Array<Object>} An array of node objects, each with nid, address, and port.
 */
function decodeNodes ( data )
{
  var nodes = [ ] ; // Initialize an empty array to store the decoded node objects.

  // Iterate through the buffer, processing 26 bytes at a time for each node.
  for ( var i = 0 ; i + 26 <= data . length ; i += 26 )
  {
    nodes . push (
      {
        nid : data . slice ( i , i + 20 ) , // Extract the 20-byte Node ID.
        address : data [ i + 20 ] + "." + data [ i + 21 ] + "." + // Construct the IPv4 address string.
                   data [ i + 22 ] + "." + data [ i + 23 ] ,
        port : data . readUInt16BE ( i + 24 ) // Read the 2-byte port number (Big Endian).
      }
    ) ;
  }

  return nodes ; // Return the array of parsed node objects.
}

/**
 * Generates a "neighbor" Node ID for a given target NID.
 * This is done by taking the first 10 bytes of the target NID and
 * concatenating them with 10 random bytes. This creates an NID
 * that is numerically "close" to the target in the DHT keyspace.
 *
 * @param {Buffer} target - The target Node ID (20-byte Buffer).
 * @returns {Buffer} A 20-byte Buffer representing a neighbor Node ID.
 */
function getNeighbor ( target )
{
    return Buffer . concat ( [ target . slice ( 0 , 10 ) , randomID ( ) . slice ( 10 ) ] ) ;
}

/**
 * Generates a random alphanumeric string of a specified length.
 * This is typically used for generating Transaction IDs (TIDs) in KRPC messages.
 *
 * @param {number} len - The desired length of the random string.
 * @returns {string} A random alphanumeric string.
 */
function entropy ( len )
{
    var text = [ ] ; // Array to accumulate random characters.
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZab" // Define the set of allowed characters.
        + "cdefghijklmnopqrstuvwxyz0123456789" ;

    var length = chars . length ; // Cache the length of the character set.

    // Loop to generate 'len' random characters.
    for ( var i = 0 ; i < len ; i ++ )
    {
        text . push ( chars . charAt ( Math . floor ( Math . random ( ) * length ) ) ) ;
    }

    return text . join ( "" ) ; // Join the characters array into a single string.
}

/**
 * Constructor for the DHT (Distributed Hash Table) node.
 * Initializes the node with its network configuration and Kademlia routing table.
 *
 * @param {Master} master - An instance of the Master object for logging.
 * @param {string} bindIP - The IP address to bind the UDP socket to.
 * @param {number} bindPort - The port number to bind the UDP socket to.
 */
function DHT ( master , bindIP , bindPort )
{
    this . master = master ;     // Reference to a master object, primarily for logging.
    this . bindIP = bindIP ;     // The IP address this DHT node will listen on.
    this . bindPort = bindPort ; // The UDP port this DHT node will listen on.

    this . ktable = new KTable ( ) ; // Initialize the Kademlia routing table.

    this . udp = dgram . createSocket ( "udp4" ) ; // Create a new UDPv4 socket.

    // Bind the UDP socket to the specified IP address and port.
    this . udp . bind ( this . bindPort , this . bindIP ) ;
}

/**
 * Sends a KRPC (Kademlia Remote Procedure Call) message over UDP.
 * The message is first bencoded before being sent.
 *
 * @param {Object} msg - The KRPC message object to send.
 * @param {Object} rinfo - Remote information object containing {address, port}.
 */
DHT . prototype . sendKRPC = function ( msg , rinfo )
{
    try
    {
        var buf = bencode . encode ( msg ) ; // Encode the JavaScript object into a bencoded buffer.

        // Send the bencoded message buffer to the target remote host.
        this . udp . send ( buf , 0 , buf . length , rinfo . port , rinfo . address ) ;
    }
    catch ( ex )
    {
        // If bencoding or sending fails, we simply ignore the error.
        // This makes the DHT more resilient to malformed messages or network issues.
        // In a production environment, logging the error might be appropriate.
    }
} ;

/**
 * Sends an error response to a KRPC query.
 * This function is used when the DHT node does not support a particular query
 * or encounters an internal error.
 *
 * @param {string} tid - The Transaction ID of the original query.
 * @param {Object} rinfo - Remote information of the querying node.
 */
DHT . prototype . playDead = function ( tid , rinfo )
{
    // Construct a standard KRPC error message.
    // 'y': "e" signifies an error.
    // 'e': [error_code, error_message].
    var msg =
    {
        t : tid , // Echo back the original Transaction ID.
        y : "e" ,
        e : [ 202 , "Server Error" ] // Common Kademlia error code for generic server issues.
    } ;

    this . sendKRPC ( msg , rinfo ) ; // Send the error message.
} ;

/**
 * Processes a 'find_node' response that contains a list of nodes.
 * It decodes the nodes and adds them to the KTable, filtering out self.
 *
 * @param {Buffer} nodesBuffer - The raw buffer containing bencoded node information.
 */
DHT . prototype . processFindNodeReceived = function ( nodesBuffer )
{
    var nodes = decodeNodes ( nodesBuffer ) ; // Decode the compact node information from the buffer.

    var self = this ; // Capture 'this' context for use within the forEach callback.

    // Iterate through each discovered node.
    nodes . forEach ( function ( node )
    {
        // Check if the discovered node is this DHT instance itself.
        // This prevents adding self to the routing table.
        if ( ( node . address == self . bindIP && node . port == self . bindPort )
            || node . nid == self . ktable . nid )
        {
            // If it's this node, do nothing; skip adding to the KTable.
            // This is a self-preservation mechanism.
        }
        else
        {
            self . ktable . push ( node ) ; // Add the valid, distinct node to the KTable.
        }
    } ) ;
} ;

/**
 * Processes an incoming 'find_node' query.
 * In this basic implementation, it logs the target and sends an error response.
 *
 * @param {Object} msg - The decoded KRPC 'find_node' query message.
 * @param {Object} rinfo - Remote information of the querying node.
 */
DHT . prototype . processFindNode = function ( msg , rinfo )
{
    var target = msg . a . target ; // Extract the 'target' NID from the query arguments.

    if ( target )
    {
        this . master . log ( rinfo , target ) ; // Log the target NID and the source of the query.
    }

    // For simplicity, this node does not actively respond to 'find_node' queries
    // with its own known nodes. It just sends an error.
    this . playDead ( msg . t , rinfo ) ;
} ;

/**
 * Processes an incoming 'get_peers' query.
 * In this basic implementation, it logs the infohash and sends an error response.
 *
 * @param {Object} msg - The decoded KRPC 'get_peers' query message.
 * @param {Object} rinfo - Remote information of the querying node.
 */
DHT . prototype . processGetPeers = function ( msg , rinfo )
{
    var infohash = msg . a . info_hash ; // Extract the 'info_hash' from the query arguments.

    if ( infohash )
    {
        this . master . log ( infohash ) ; // Log the requested infohash.
    }

    // This node does not store or serve peer information, so it responds with an error.
    this . playDead ( msg . t , rinfo ) ;
} ;

/**
 * Sends a 'find_node' query to a remote node.
 * This query is used to discover other nodes in the DHT network.
 *
 * @param {Object} rinfo - Remote information of the node to query.
 * @param {Buffer} [nid] - Optional. A Node ID to use as a basis for the target NID.
 *                         If provided, a "neighbor" NID is generated; otherwise, a random NID.
 */
DHT . prototype . sendFindNode = function ( rinfo , nid )
{
    // Determine the Node ID to use for the query's 'id' field.
    // If a specific NID is passed, generate a 'neighbor' NID.
    // Otherwise, generate a completely random NID.
    if ( typeof nid != "undefined" )
    {
        var nid = getNeighbor ( nid ) ; // Create a NID that is numerically close to the given 'nid'.
    }
    else
    {
        var nid = randomID ( ) ; // Use a completely random NID for broad discovery.
    }

    // Construct the KRPC 'find_node' query message.
    // 't': Transaction ID.
    // 'y': "q" for query.
    // 'q': "find_node" for the query type.
    // 'a': Arguments dictionary, including our ID and a target NID to search for.
    var msg =
    {
        t : entropy ( TID_LENGTH ) , // Generate a random transaction ID for this query.
        y : "q" ,
        q : "find_node" ,
        a :
        {
            id : nid ,         // Our node's ID.
            target : randomID ( ) // The target NID we are looking for.
        }
    } ;

    this . sendKRPC ( msg , rinfo ) ; // Send the constructed 'find_node' query message.
} ;

/**
 * Initiates the process of joining the DHT network.
 * It sends 'find_node' queries to the predefined bootstrap nodes.
 */
DHT . prototype . joinDHT = function ( )
{
    var self = this ; // Cache 'this' for use inside the forEach callback.

    // Iterate through the list of bootstrap nodes.
    BOOTSTRAP_NODES . forEach ( function ( node )
    {
        // For each bootstrap node, send a 'find_node' query to discover other nodes.
        self . sendFindNode ( { address : node [ 0 ] , port : node [ 1 ] } ) ;
    } ) ;
} ;

/**
 * Handles incoming UDP messages, decoding them and routing them to appropriate processors.
 *
 * @param {Buffer} msgBuffer - The raw buffer of the received UDP message.
 * @param {Object} rinfo - Remote information of the sender ({address, port}).
 */
DHT . prototype . dataReceived = function ( msgBuffer , rinfo )
{
    try
    {
        var msg = bencode . decode ( msgBuffer ) ; // Attempt to decode the bencoded message.

        // Check if it's a response ('r') and contains 'nodes' (typically from a 'find_node' response).
        if ( msg . y == "r" && msg . r . nodes )
        {
            this . processFindNodeReceived ( msg . r . nodes ) ; // Process the received node list.
        }
        // Check if it's a query ('q') for 'get_peers'.
        else if ( msg . y == "q" && msg . q == "get_peers" )
        {
            this . processGetPeers ( msg , rinfo ) ; // Process the 'get_peers' query.
        }
        // Check if it's a query ('q') for 'find_node'.
        else if ( msg . y == "q" && msg . q == "find_node" )
        {
            this . processFindNode ( msg , rinfo ) ; // Process the 'find_node' query.
        }
    }
    catch ( ex )
    {
        // If decoding fails (e.g., malformed bencode), silently ignore the message.
        // This prevents crashes from invalid network traffic.
    }
} ;

/**
 * Periodically "wanders" the network by sending 'find_node' queries to
 * all known nodes in the KTable, and then clears the KTable.
 * This is a simplistic approach to keep discovering new nodes.
 */
DHT . prototype . wander = function ( )
{
    var self = this ; // Cache 'this' for use inside the forEach callback.

    // Iterate through each node currently stored in the KTable.
    this . ktable . nodes . forEach ( function ( node )
    {
        // Send a 'find_node' query to each known node.
        self . sendFindNode ( { address : node . address , port : node . port } , node . nid ) ;
    } ) ;

    // After querying all known nodes, clear the KTable.
    // This forces continuous discovery and prevents stale nodes from accumulating
    // indefinitely in this basic implementation.
    this . ktable . nodes = [ ] ;
} ;

/**
 * Starts the DHT node's operations: listening for messages and initiating
 * periodic network activities like joining and wandering.
 */
DHT . prototype . start = function ( )
{
    var self = this ; // Cache 'this' for event listener callbacks.

    // Set up an event listener for incoming UDP messages.
    this . udp . on ( "message" , function ( msg , rinfo )
    {
        self . dataReceived ( msg , rinfo ) ; // Delegate message processing.
    } ) ;

    // Set up an event listener for UDP socket errors.
    this . udp . on ( "error" , function ( err )
    {
        // In this basic version, errors are silently ignored to keep the process running.
        // In a robust application, these errors should be logged or handled appropriately.
        // console.error("UDP socket error:", err);
    } ) ;

    // Set a timer to periodically join the DHT (query bootstrap nodes).
    timers . setInterval ( function ( ) { self . joinDHT ( ) } , 10000 ) ; // Every 10 seconds.

    // Set a timer to periodically "wander" the network (query known nodes).
    timers . setInterval ( function ( ) { self . wander ( ) } , 1000 ) ; // Every 1 second.
} ;

/**
 * Constructor for a simple Master object, primarily used for logging.
 * In a larger system, this could manage multiple DHT instances or other components.
 */
function Master ( ) { }

/**
 * Logs information, typically about discovered infohashes or queries.
 *
 * @param {Object} rinfo - Remote information of the source.
 * @param {Buffer} infohash - The infohash (or target NID) Buffer to log.
 */
Master . prototype . log = function ( rinfo , infohash )
{
    console . log ( "%s from %s:%s" , infohash . toString ( "hex" ) , rinfo . address , rinfo . port ) ;
} ;

/**
 * Constructor for the KTable (Kademlia Routing Table).
 * Stores discovered nodes. In a full Kademlia implementation, this would be
 * structured into K-buckets. Here, it's a simple flat list.
 */
function KTable ( )
{
    this . nid = randomID ( ) ; // Generate a Node ID for this KTable instance.
    this . nodes = [ ] ;        // Initialize an empty array to store discovered nodes.
}

/**
 * Adds a new node to the KTable, if the table is not full.
 *
 * @param {Object} node - The node object to add, containing nid, address, and port.
 */
KTable . prototype . push = function ( node )
{
    // Check if the KTable has reached its maximum allowed size.
    if ( this . nodes . length >= MAX_QNODE_SIZE )
    {
        return ; // If full, do not add more nodes (in this simplistic implementation).
    }

    this . nodes . push ( node ) ; // Add the new node to the end of the list.
} ;

// Main execution block:
// Create a new DHT instance, bound to all network interfaces (0.0.0.0) on port 6881,
// and immediately start its operations.
new DHT ( new Master ( ) , "0.0.0.0" , 6881 ) . start ( ) ;