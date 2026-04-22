require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// This module handles distributed network operations and data management.

// Import necessary external libraries for network connectivity and utilities.
const NetConnect = require('peerjs'); // Manages direct peer-to-peer connections.
const HashRing = require('webrtc-chord'); // Implements a distributed hash table (DHT).
const Utils = require('underscore'); // Provides utility functions for collections.

// --- Configuration Constants ---
const NETWORK_HOST = 'localhost';
const NETWORK_PORT = 9000;
const DEBUG_LEVEL = 3; // Verbosity level for network debugging.
const STUN_SERVER_ONE = 'stun:54.187.230.130';
const STUN_SERVER_TWO = 'stun:stun.l.google.com:19302';
const TURN_SERVER_URL = 'turn:gorst@54.187.230.130';
const TURN_SERVER_CREDENTIAL = 'hero';

// --- Helper Logging Function ---
/**
 * Logs a message to the console with a timestamp.
 * @param {string} message - The message to log.
 * @param {string} [type='info'] - The type of log (e.g., 'info', 'warn', 'error').
 */
const logActivity = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    switch (type) {
        case 'warn':
            console.warn(`[${timestamp}] WARN: ${message}`);
            break;
        case 'error':
            console.error(`[${timestamp}] ERROR: ${message}`);
            break;
        default:
            console.log(`[${timestamp}] INFO: ${message}`);
    }
};

// --- Callback Handlers for Network Operations ---

/**
 * Displays the newly assigned identifier for the local network node.
 * @param {string} agentIdentifier - The unique ID assigned to this node.
 */
const displayAssignedId = function(agentIdentifier) {
    logActivity(`Current node identifier: ${agentIdentifier}`);
};

/**
 * Handles and logs any errors encountered during network operations.
 * @param {Error|string} operationError - The error object or message.
 */
const handleOperationError = function(operationError) {
    if (operationError) {
        logActivity(`Network operation failed: ${operationError.message || operationError}`, 'error');
    }
};

/**
 * Callback executed upon successful creation of a new distributed network.
 * @param {string} assignedNodeId - The ID of the node that created the network.
 * @param {Error} [err] - An error object if creation failed.
 */
const onNetworkCreationComplete = function(assignedNodeId, err) {
    if (Boolean(err)) { // Explicit boolean check.
        handleOperationError(err);
    } else {
        displayAssignedId(assignedNodeId);
        logActivity('Successfully established a new distributed network ring.');
    }
};

/**
 * Callback executed upon successful joining of an existing distributed network.
 * @param {string} assignedNodeId - The ID of the node that joined the network.
 * @param {Error} [err] - An error object if joining failed.
 */
const onNetworkJoinComplete = function(assignedNodeId, err) {
    if (err) { // Using implicit truthiness for brevity here.
        handleOperationError(err);
    } else {
        displayAssignedId(assignedNodeId);
        logActivity('Node successfully connected to an existing network ring.');
    }
};

// --- Application-wide Configuration Object ---
// This object holds settings for both the PeerJS connection and the Chord DHT.
const appSettings = Object.freeze({ // Make settings immutable.
    networkAgentConfig: { // Configuration specifically for the NetConnect (PeerJS) instance.
        options: {
            host: NETWORK_HOST,
            port: NETWORK_PORT,
            debug: DEBUG_LEVEL,
            config: {
                iceServers: [
                    { url: STUN_SERVER_ONE },
                    { url: STUN_SERVER_TWO },
                    { url: TURN_SERVER_URL, credential: TURN_SERVER_CREDENTIAL }
                ]
            }
        }
    },
    hashRingParameters: { // Parameters for the HashRing (webrtc-chord) instance.
        successorListSize: 3, // Number of entries in the successor list.
        connectionPoolLimit: 10, // Max concurrent connections to maintain.
        connectionEstablishTimeoutMs: 30000, // Timeout for opening a connection.
        requestResponseTimeoutMs: 180000, // Timeout for DHT requests.
        stabilizationIntervalMs: 30000, // How often to run stabilization tasks.
        fingerTableUpdateIntervalMs: 30000, // How often to update finger table entries.
        predecessorCheckIntervalMs: 30000 // How often to check predecessor node status.
    }
});

// --- Core Network Service Instances ---
// Initialize the distributed hash table (DHT) service.
const ringService = new HashRing(appSettings.hashRingParameters);

// Initialize the peer-to-peer connectivity agent.
const connectivityAgent = new NetConnect(appSettings.networkAgentConfig.options);

// --- Network Initialization Logic ---
let isNetworkActionInitiated = false; // Flag to prevent multiple network actions.

// Listen for the 'open' event from the connectivity agent, indicating it's ready.
connectivityAgent.on('open', function(assignedAgentId) {
    logActivity(`Connectivity agent opened with ID: ${assignedAgentId}. Attempting to discover/join network...`);
    console.time('NetworkDiscovery'); // Start performance timer.

    // A small delay to allow the agent to fully initialize before listing peers.
    setTimeout(() => {
        connectivityAgent.listAllPeers(function(allAgentKeys) {
            if (!Array.isArray(allAgentKeys)) {
                logActivity('Received invalid peer list from connectivity agent.', 'error');
                return;
            }

            const knownAgents = allAgentKeys.filter(agentKey =>
                agentKey !== assignedAgentId && agentKey !== ringService.getPeerId()
            );

            // Determine whether to join an existing network or create a new one.
            if (knownAgents.length > 0) {
                const targetAgent = knownAgents[0]; // Attempt to join the first available peer.
                logActivity(`Attempting to join existing network via agent: ${targetAgent}`);
                try {
                    ringService.join(targetAgent, onNetworkJoinComplete);
                    isNetworkActionInitiated = true;
                } catch (e) {
                    handleOperationError(`Failed to initiate join operation: ${e.message}`);
                }
            } else {
                logActivity('No existing network agents found. Creating a new network...');
                try {
                    ringService.create(onNetworkCreationComplete);
                    isNetworkActionInitiated = true;
                } catch (e) {
                    handleOperationError(`Failed to initiate network creation: ${e.message}`);
                }
            }
            console.timeEnd('NetworkDiscovery'); // End performance timer.
        });
    }, 100); // Wait 100ms.

    // Important: Destroy the temporary connectivity agent once its purpose (listing/joining) is served.
    // This assumes the HashRing manages its own PeerJS instance internally.
    // Adding a guard for already destroyed state.
    if (connectivityAgent && !connectivityAgent.destroyed) {
        connectivityAgent.destroy();
        logActivity('Temporary connectivity agent destroyed.');
    }
});

// --- Distributed Search Functionality ---

/**
 * Searches the distributed hash ring for data associated with given terms.
 * @param {string} searchQueryString - The string containing search terms, separated by spaces.
 * @returns {Promise<Array>} A promise that resolves with an array of matching entries.
 */
async function performDistributedSearch(searchQueryString) {
    if (!searchQueryString || searchQueryString.trim().length === 0) {
        logActivity('Search query is empty. No search performed.', 'warn');
        return Promise.resolve([]); // Return an empty array for no query.
    }

    const parsedTerms = searchQueryString.split(/\s+/).filter(term => term.length > 0); // Split by one or more spaces, filter empty.
    if (parsedTerms.length === 0) {
        logActivity('No valid search terms extracted from query.', 'warn');
        return Promise.resolve([]);
    }

    logActivity(`Initiating distributed search for terms: [${parsedTerms.join(', ')}] at ${Date.now()}`);

    const collectedResultsPerTerm = [];
    const searchPromises = parsedTerms.map(currentTerm => {
        return new Promise((resolve) => {
            ringService.retrieve(currentTerm, (retrievedItems, retrievalError) => {
                if (retrievalError) {
                    logActivity(`Failed to retrieve entries for term '${currentTerm}': ${retrievalError.message || retrievalError}`, 'error');
                    resolve([]); // Resolve with empty array on error for this term.
                } else {
                    // Ensure retrievedItems is an array before flattening.
                    collectedResultsPerTerm.push(Utils.flatten(Array.isArray(retrievedItems) ? retrievedItems : [retrievedItems]));
                    resolve(); // Indicate completion for this term.
                }
            });
        });
    });

    await Promise.all(searchPromises); // Wait for all retrieval operations to complete.

    let finalMatchingEntries = [];
    if (collectedResultsPerTerm.length > 0) {
        // Find the intersection of all result sets.
        // Guard against single-term searches or empty result sets to avoid errors in apply.
        if (collectedResultsPerTerm.length === 1) {
            finalMatchingEntries = collectedResultsPerTerm[0];
        } else {
            finalMatchingEntries = Utils.intersection.apply(null, collectedResultsPerTerm);
        }
    }

    logActivity(`Distributed search completed. Found ${finalMatchingEntries.length} matching entries.`);
    return finalMatchingEntries;
}


// --- Global Cleanup on Window Unload ---
window.addEventListener('beforeunload', function() {
    logActivity('Window is closing. Initiating network cleanup.');
    // Ensure the connectivity agent is destroyed if it somehow wasn't earlier.
    if (connectivityAgent && !connectivityAgent.destroyed) {
        connectivityAgent.destroy();
        logActivity('Connectivity agent explicitly destroyed during unload.');
    }
    // Instruct the hash ring service to gracefully leave the network.
    ringService.leave();
    logActivity('Hash ring service has left the network.');
});

// --- Module Exports ---
// Expose core functionalities for external use.
module.exports.hashRingService = ringService; // The DHT instance.
module.exports.getData = ringService.retrieve; // Alias for data retrieval.
module.exports.storeData = ringService.put; // Alias for data storage.
module.exports.removeData = ringService.remove; // Alias for data removal.
module.exports.performSearch = performDistributedSearch; // The enhanced search function.
},{"peerjs":"MVWM4L","underscore":6,"webrtc-chord":"rzYpuO"}],"MVWM4L":[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
/*! peerjs.js build:0.3.8, development. Copyright(c) 2013 Michelle Bu <michelle@michellebu.com> */
(function(exports){
var binaryFeatures = {};
binaryFeatures.useBlobBuilder = (function(){
  try {
    new Blob([]);
    return false;
  } catch (e) {
    return true;
  }
})();

binaryFeatures.useArrayBufferView = !binaryFeatures.useBlobBuilder && (function(){
  try {
    return (new Blob([new Uint8Array([])])).size === 0;
  } catch (e) {
    return true;
  }
})();

exports.binaryFeatures = binaryFeatures;
exports.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

function BufferBuilder(){
  this._pieces = [];
  this._parts = [];
}

BufferBuilder.prototype.append = function(data) {
  if(typeof data === 'number') {
    this._pieces.push(data);
  } else {
    this.flush();
    this._parts.push(data);
  }
};

BufferBuilder.prototype.flush = function() {
  if (this._pieces.length > 0) {
    var buf = new Uint8Array(this._pieces);
    if(!binaryFeatures.useArrayBufferView) {
      buf = buf.buffer;
    }
    this._parts.push(buf);
    this._pieces = [];
  }
};

BufferBuilder.prototype.getBuffer = function() {
  this.flush();
  if(binaryFeatures.useBlobBuilder) {
    var builder = new BlobBuilder();
    for(var i = 0, ii = this._parts.length; i < ii; i++) {
      builder.append(this._parts[i]);
    }
    return builder.getBlob();
  } else {
    return new Blob(this._parts);
  }
};
exports.BinaryPack = {
  unpack: function(data){
    var unpacker = new Unpacker(data);
    return unpacker.unpack();
  },
  pack: function(data){
    var packer = new Packer();
    packer.pack(data);
    var buffer = packer.getBuffer();
    return buffer;
  }
};

function Unpacker (data){
  // Data is ArrayBuffer
  this.index = 0;
  this.dataBuffer = data;
  this.dataView = new Uint8Array(this.dataBuffer);
  this.length = this.dataBuffer.byteLength;
}


Unpacker.prototype.unpack = function(){
  var type = this.unpack_uint8();
  if (type < 0x80){
    var positive_fixnum = type;
    return positive_fixnum;
  } else if ((type ^ 0xe0) < 0x20){
    var negative_fixnum = (type ^ 0xe0) - 0x20;
    return negative_fixnum;
  }
  var size;
  if ((size = type ^ 0xa0) <= 0x0f){
    return this.unpack_raw(size);
  } else if ((size = type ^ 0xb0) <= 0x0f){
    return this.unpack_string(size);
  } else if ((size = type ^ 0x90) <= 0x0f){
    return this.unpack_array(size);
  } else if ((size = type ^ 0x80) <= 0x0f){
    return this.unpack_map(size);
  }
  switch(type){
    case 0xc0:
      return null;
    case 0xc1:
      return undefined;
    case 0xc2:
      return false;
    case 0xc3:
      return true;
    case 0xca:
      return this.unpack_float();
    case 0xcb:
      return this.unpack_double();
    case 0xcc:
      return this.unpack_uint8();
    case 0xcd:
      return this.unpack_uint16();
    case 0xce:
      return this.unpack_uint32();
    case 0xcf:
      return this.unpack_uint64();
    case 0xd0:
      return this.unpack_int8();
    case 0xd1:
      return this.unpack_int16();
    case 0xd2:
      return this.unpack_int32();
    case 0xd3:
      return this.unpack_int64();
    case 0xd4:
      return undefined;
    case 0xd5:
      return undefined;
    case 0xd6:
      return undefined;
    case 0xd7:
      return undefined;
    case 0xd8:
      size = this.unpack_uint16();
      return this.unpack_string(size);
    case 0xd9:
      size = this.unpack_uint32();
      return this.unpack_string(size);
    case 0xda:
      size = this.unpack_uint16();
      return this.unpack_raw(size);
    case 0xdb:
      size = this.unpack_uint32();
      return this.unpack_raw(size);
    case 0xdc:
      size = this.unpack_uint16();
      return this.unpack_array(size);
    case 0xdd:
      size = this.unpack_uint32();
      return this.unpack_array(size);
    case 0xde:
      size = this.unpack_uint16();
      return this.unpack_map(size);
    case 0xdf:
      size = this.unpack_uint32();
      return this.unpack_map(size);
  }
}

Unpacker.prototype.unpack_uint8 = function(){
  var byte = this.dataView[this.index] & 0xff;
  this.index++;
  return byte;
};

Unpacker.prototype.unpack_uint16 = function(){
  var bytes = this.read(2);
  var uint16 =
    ((bytes[0] & 0xff) * 256) + (bytes[1] & 0xff);
  this.index += 2;
  return uint16;
}

Unpacker.prototype.unpack_uint32 = function(){
  var bytes = this.read(4);
  var uint32 =
     ((bytes[0]  * 256 +
       bytes[1]) * 256 +
       bytes[2]) * 256 +
       bytes[3];
  this.index += 4;
  return uint32;
}

Unpacker.prototype.unpack_uint64 = function(){
  var bytes = this.read(8);
  var uint64 =
   ((((((bytes[0]  * 256 +
       bytes[1]) * 256 +
       bytes[2]) * 256 +
       bytes[3]) * 256 +
       bytes[4]) * 256 +
       bytes[5]) * 256 +
       bytes[6]) * 256 +
       bytes[7];
  this.index += 8;
  return uint64;
}


Unpacker.prototype.unpack_int8 = function(){
  var uint8 = this.unpack_uint8();
  return (uint8 < 0x80 ) ? uint8 : uint8 - (1 << 8);
};

Unpacker.prototype.unpack_int16 = function(){
  var uint16 = this.unpack_uint16();
  return (uint16 < 0x8000 ) ? uint16 : uint16 - (1 << 16);
}

Unpacker.prototype.unpack_int32 = function(){
  var uint32 = this.unpack_uint32();
  return (uint32 < Math.pow(2, 31) ) ? uint32 :
    uint32 - Math.pow(2, 32);
}

Unpacker.prototype.unpack_int64 = function(){
  var uint64 = this.unpack_uint64();
  return (uint64 < Math.pow(2, 63) ) ? uint64 :
    uint64 - Math.pow(2, 64);
}

Unpacker.prototype.unpack_raw = function(size){
  if ( this.length < this.index + size){
    throw new Error('BinaryPackFailure: index is out of range'
      + ' ' + this.index + ' ' + size + ' ' + this.length);
  }
  var buf = this.dataBuffer.slice(this.index, this.index + size);
  this.index += size;

    //buf = util.bufferToString(buf);

  return buf;
}

Unpacker.prototype.unpack_string = function(size){
  var bytes = this.read(size);
  var i = 0, str = '', c, code;
  while(i < size){
    c = bytes[i];
    if ( c < 128){
      str += String.fromCharCode(c);
      i++;
    } else if ((c ^ 0xc0) < 32){
      code = ((c ^ 0xc0) << 6) | (bytes[i+1] & 63);
      str += String.fromCharCode(code);
      i += 2;
    } else {
      code = ((c & 15) << 12) | ((bytes[i+1] & 63) << 6) |
        (bytes[i+2] & 63);
      str += String.fromCharCode(code);
      i += 3;
    }
  }
  this.index += size;
  return str;
}

Unpacker.prototype.unpack_array = function(size){
  var objects = new Array(size);
  for(var i = 0; i < size ; i++){
    objects[i] = this.unpack();
  }
  return objects;
}

Unpacker.prototype.unpack_map = function(size){
  var map = {};
  for(var i = 0; i < size ; i++){
    var key  = this.unpack();
    var value = this.unpack();
    map[key] = value;
  }
  return map;
}

Unpacker.prototype.unpack_float = function(){
  var uint32 = this.unpack_uint32();
  var sign = uint32 >> 31;
  var exp  = ((uint32 >> 23) & 0xff) - 127;
  var fraction = ( uint32 & 0x7fffff ) | 0x800000;
  return (sign == 0 ? 1 : -1) *
    fraction * Math.pow(2, exp - 23);
}

Unpacker.prototype.unpack_double = function(){
  var h32 = this.unpack_uint32();
  var l32 = this.unpack_uint32();
  var sign = h32 >> 31;
  var exp  = ((h32 >> 20) & 0x7ff) - 1023;
  var hfrac = ( h32 & 0xfffff ) | 0x100000;
  var frac = hfrac * Math.pow(2, exp - 20) +
    l32   * Math.pow(2, exp - 52);
  return (sign == 0 ? 1 : -1) * frac;
}

Unpacker.prototype.read = function(length){
  var j = this.index;
  if (j + length <= this.length) {
    return this.dataView.subarray(j, j + length);
  } else {
    throw new Error('BinaryPackFailure: read index out of range');
  }
}

function Packer(){
  this.bufferBuilder = new BufferBuilder();
}

Packer.prototype.getBuffer = function(){
  return this.bufferBuilder.getBuffer();
}

Packer.prototype.pack = function(value){
  var type = typeof(value);
  if (type == 'string'){
    this.pack_string(value);
  } else if (type == 'number'){
    if (Math.floor(value) === value){
      this.pack_integer(value);
    } else{
      this.pack_double(value);
    }
  } else if (type == 'boolean'){
    if (value === true){
      this.bufferBuilder.append(0xc3);
    } else if (value === false){
      this.bufferBuilder.append(0xc2);
    }
  } else if (type == 'undefined'){
    this.bufferBuilder.append(0xc0);
  } else if (type == 'object'){
    if (value === null){
      this.bufferBuilder.append(0xc0);
    } else {
      var constructor = value.constructor;
      if (constructor == Array){
        this.pack_array(value);
      } else if (constructor == Blob || constructor == File) {
        this.pack_bin(value);
      } else if (constructor == ArrayBuffer) {
        if(binaryFeatures.useArrayBufferView) {
          this.pack_bin(new Uint8Array(value));
        } else {
          this.pack_bin(value);
        }
      } else if ('BYTES_PER_ELEMENT' in value){
        if(binaryFeatures.useArrayBufferView) {
          this.pack_bin(new Uint8Array(value.buffer));
        } else {
          this.pack_bin(value.buffer);
        }
      } else if (constructor == Object){
        this.pack_object(value);
      } else if (constructor == Date){
        this.pack_string(value.toString());
      } else if (typeof value.toBinaryPack == 'function'){