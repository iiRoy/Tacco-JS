require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(getModule,exportsModule,myExports){
'use strict';

var NetworkPeer = getModule('peerjs');
var RingNetwork = getModule('webrtc-chord');


var UtilityTool = getModule('underscore');

var displayNetworkId = function(nodeId) {
    console.log('My network node identifier: ' + nodeId);
};

var processError = function(issue) {
    if (issue) {
        console.log('Operation failed: ' + issue);
    }
};

var initializeNode = function(nodeId, issue) {
    if (issue) {
        processError(issue);
    } else {
        displayNetworkId(nodeId);
    }
};

var connectToNode = function(nodeId, issue) {
    if (issue) {
        processError(issue);
    } else {
        displayNetworkId(nodeId);
    }
};

var systemParameters = {
    peerConnection: { 
        settings: {
            host: 'localhost',
            port: 9000,
            debug: 3,
            configuration: {
                iceServers: [
                    {url: 'stun:54.187.230.130'},
                    {url: 'stun:stun.l.google.com:19302'},
                    {url: 'turn:gorst@54.187.230.130', credential: 'hero'}
                ]
            }
        }
    },
    successorListSize: 3,
    connectionPoolCapacity: 10,
    connectionEstablishmentTimeout: 30000,
    requestOperationTimeout: 180000,
    stabilizationProcessInterval: 30000,
    fingerTableFixInterval: 30000,
    predecessorCheckInterval: 30000
};



// Initialize a new distributed hash table instance
var dhtInstance = new RingNetwork(systemParameters);

var peerService = new NetworkPeer({
    host: 'localhost',
    port: 9000,
    debug: 3,
    config: {
        iceServers: [
            {url: 'stun:54.187.230.130'},
            {url: 'stun:stun.l.google.com:19302'},
            {url: 'turn:gorst@54.187.230.130', credential: 'hero'}
        ]
    }
});

peerService.on('open', function(uniqueIdentifier) {
    var availablePeers = [];
    peerService.listAllPeers(function (identifiers) {
        identifiers.map(function(individualId) {
            if(individualId !== uniqueIdentifier && individualId !== dhtInstance.getPeerId()) {
                console.log('Available peer: ' + individualId);
                availablePeers.push(individualId);
            }
        });

        // Check for the first available peer
        if(availablePeers[0]) {
            // Attempt to join an existing distributed hash table network
            console.log('Attempting to join network via: ', availablePeers[0]);
            dhtInstance.join(availablePeers[0], connectToNode);
        } else {
            // Create a brand new distributed hash table network
            console.log('Creating a new distributed hash table network');
            dhtInstance.create(initializeNode);
        }
    });
    peerService.destroy();
});

function findData(searchQuery) {
    // Break down the query into individual terms
    var searchTerms = searchQuery.split(' ');

    // Retrieve data records
    var allRecords = [];
    var searchResults = [];
    UtilityTool.each(searchTerms, function (term) {
        dhtInstance.retrieve(term, function(dataEntries, issue) {
            if (issue) {
                console.log('Failed to retrieve data entries: ' + issue);
            }
            allRecords.push(UtilityTool.flatten(dataEntries));
            if(term === UtilityTool.last(searchTerms)) {
                searchResults = UtilityTool.intersection.apply(null, allRecords);
                console.log(searchResults);
            }
        });
    });
}

window.onunload = window.onbeforeunload = function() {
    if (!!peerService && !peerService.destroyed) {
        peerService.destroy();
    }
    dhtInstance.leave();
};

exportsModule.dht = dhtInstance;
exportsModule.get_data = dhtInstance.retrieve;
exportsModule.put_data = dhtInstance.put;
exportsModule.remove_data = dhtInstance.remove;
exportsModule.find_data = findData;
},{"peerjs":"MVWM4L","underscore":6,"webrtc-chord":"rzYpuO"}],"MVWM4L":[function(getModule,exportsModule,myExports){
(function (globalScope){
;__browserify_shim_require__=getModule;(function browserifyShim(moduleExports, exports, getModule, define, browserify_shim__define__module__export__) {
/*! peerjs.js build:0.3.8, development. Copyright(c) 2013 Michelle Bu <michelle@michellebu.com> */
(function(exportedFunctions){
var binaryCapabilities = {};
binaryCapabilities.useBlobBuilder = (function(){
  try {
    new Blob([]);
    return false;
  } catch (err) {
    return true;
  }
})();

binaryCapabilities.useArrayBufferView = !binaryCapabilities.useBlobBuilder && (function(){
  try {
    return (new Blob([new Uint8Array([])])).size === 0;
  } catch (err) {
    return true;
  }
})();

exportedFunctions.binaryFeatures = binaryCapabilities;
exportedFunctions.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;

function DataBufferBuilder(){
  this._segments = [];
  this._components = [];
}

DataBufferBuilder.prototype.append = function(inputData) {
  if(typeof inputData === 'number') {
    this._segments.push(inputData);
  } else {
    this.processSegments();
    this._components.push(inputData);
  }
};

DataBufferBuilder.prototype.processSegments = function() {
  if (this._segments.length > 0) {
    var byteBuffer = new Uint8Array(this._segments);
    if(!binaryCapabilities.useArrayBufferView) {
      byteBuffer = byteBuffer.buffer;
    }
    this._components.push(byteBuffer);
    this._segments = [];
  }
};

DataBufferBuilder.prototype.getBuffer = function() {
  this.processSegments();
  if(binaryCapabilities.useBlobBuilder) {
    var builderInstance = new exportedFunctions.BlobBuilder();
    for(var i = 0, count = this._components.length; i < count; i++) {
      builderInstance.append(this._components[i]);
    }
    return builderInstance.getBlob();
  } else {
    return new Blob(this._components);
  }
};
exportedFunctions.BinaryPack = {
  unpack: function(inputData){
    var dataUnpacker = new DataUnpacker(inputData);
    return dataUnpacker.unpack();
  },
  pack: function(inputData){
    var dataPacker = new DataPacker();
    dataPacker.pack(inputData);
    var resultBuffer = dataPacker.getBuffer();
    return resultBuffer;
  }
};

function DataUnpacker (inputData){
  // Input data is an ArrayBuffer
  this.currentOffset = 0;
  this.rawDataBuffer = inputData;
  this.dataByteView = new Uint8Array(this.rawDataBuffer);
  this.bufferLength = this.rawDataBuffer.byteLength;
}


DataUnpacker.prototype.unpack = function(){
  var dataType = this.unpack_uint8();
  if (dataType < 0x80){
    var positiveFixedNum = dataType;
    return positiveFixedNum;
  } else if ((dataType ^ 0xe0) < 0x20){
    var negativeFixedNum = (dataType ^ 0xe0) - 0x20;
    return negativeFixedNum;
  }
  var dataSize;
  if ((dataSize = dataType ^ 0xa0) <= 0x0f){
    return this.unpack_raw(dataSize);
  } else if ((dataSize = dataType ^ 0xb0) <= 0x0f){
    return this.unpack_string(dataSize);
  } else if ((dataSize = dataType ^ 0x90) <= 0x0f){
    return this.unpack_array(dataSize);
  } else if ((dataSize = dataType ^ 0x80) <= 0x0f){
    return this.unpack_map(dataSize);
  }
  switch(dataType){
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
      dataSize = this.unpack_uint16();
      return this.unpack_string(dataSize);
    case 0xd9:
      dataSize = this.unpack_uint32();
      return this.unpack_string(dataSize);
    case 0xda:
      dataSize = this.unpack_uint16();
      return this.unpack_raw(dataSize);
    case 0xdb:
      dataSize = this.unpack_uint32();
      return this.unpack_raw(dataSize);
    case 0xdc:
      dataSize = this.unpack_uint16();
      return this.unpack_array(dataSize);
    case 0xdd:
      dataSize = this.unpack_uint32();
      return this.unpack_array(dataSize);
    case 0xde:
      dataSize = this.unpack_uint16();
      return this.unpack_map(dataSize);
    case 0xdf:
      dataSize = this.unpack_uint32();
      return this.unpack_map(dataSize);
  }
}

DataUnpacker.prototype.unpack_uint8 = function(){
  var singleByte = this.dataByteView[this.currentOffset] & 0xff;
  this.currentOffset++;
  return singleByte;
};

DataUnpacker.prototype.unpack_uint16 = function(){
  var twoBytes = this.read(2);
  var unsignedInt16 =
    ((twoBytes[0] & 0xff) * 256) + (twoBytes[1] & 0xff);
  this.currentOffset += 2;
  return unsignedInt16;
}

DataUnpacker.prototype.unpack_uint32 = function(){
  var fourBytes = this.read(4);
  var unsignedInt32 =
     ((fourBytes[0]  * 256 +
       fourBytes[1]) * 256 +
       fourBytes[2]) * 256 +
       fourBytes[3];
  this.currentOffset += 4;
  return unsignedInt32;
}

DataUnpacker.prototype.unpack_uint64 = function(){
  var eightBytes = this.read(8);
  var unsignedInt64 =
   ((((((eightBytes[0]  * 256 +
       eightBytes[1]) * 256 +
       eightBytes[2]) * 256 +
       eightBytes[3]) * 256 +
       eightBytes[4]) * 256 +
       eightBytes[5]) * 256 +
       eightBytes[6]) * 256 +
       eightBytes[7];
  this.currentOffset += 8;
  return unsignedInt64;
}


DataUnpacker.prototype.unpack_int8 = function(){
  var unsigned8Bit = this.unpack_uint8();
  return (unsigned8Bit < 0x80 ) ? unsigned8Bit : unsigned8Bit - (1 << 8);
};

DataUnpacker.prototype.unpack_int16 = function(){
  var unsigned16Bit = this.unpack_uint16();
  return (unsigned16Bit < 0x8000 ) ? unsigned16Bit : unsigned16Bit - (1 << 16);
}

DataUnpacker.prototype.unpack_int32 = function(){
  var unsigned32Bit = this.unpack_uint32();
  return (unsigned32Bit < Math.pow(2, 31) ) ? unsigned32Bit :
    unsigned32Bit - Math.pow(2, 32);
}

DataUnpacker.prototype.unpack_int64 = function(){
  var unsigned64Bit = this.unpack_uint64();
  return (unsigned64Bit < Math.pow(2, 63) ) ? unsigned64Bit :
    unsigned64Bit - Math.pow(2, 64);
}

DataUnpacker.prototype.unpack_raw = function(dataSize){
  if ( this.bufferLength < this.currentOffset + dataSize){
    throw new Error('BinaryPackFailure: offset is out of range'
      + ' ' + this.currentOffset + ' ' + dataSize + ' ' + this.bufferLength);
  }
  var bufferSegment = this.rawDataBuffer.slice(this.currentOffset, this.currentOffset + dataSize);
  this.currentOffset += dataSize;

    //bufferSegment = util.bufferToString(bufferSegment);

  return bufferSegment;
}

DataUnpacker.prototype.unpack_string = function(dataSize){
  var byteSequence = this.read(dataSize);
  var i = 0, charString = '', characterCode, unicodeCode;
  while(i < dataSize){
    characterCode = byteSequence[i];
    if ( characterCode < 128){
      charString += String.fromCharCode(characterCode);
      i++;
    } else if ((characterCode ^ 0xc0) < 32){
      unicodeCode = ((characterCode ^ 0xc0) << 6) | (byteSequence[i+1] & 63);
      charString += String.fromCharCode(unicodeCode);
      i += 2;
    } else {
      unicodeCode = ((characterCode & 15) << 12) | ((byteSequence[i+1] & 63) << 6) |
        (byteSequence[i+2] & 63);
      charString += String.fromCharCode(unicodeCode);
      i += 3;
    }
  }
  this.currentOffset += dataSize;
  return charString;
}

DataUnpacker.prototype.unpack_array = function(dataSize){
  var dataObjects = new Array(dataSize);
  for(var i = 0; i < dataSize ; i++){
    dataObjects[i] = this.unpack();
  }
  return dataObjects;
}

DataUnpacker.prototype.unpack_map = function(dataSize){
  var dataMap = {};
  for(var i = 0; i < dataSize ; i++){
    var dataKey  = this.unpack();
    var dataValue = this.unpack();
    dataMap[dataKey] = dataValue;
  }
  return dataMap;
}

DataUnpacker.prototype.unpack_float = function(){
  var unsigned32Bit = this.unpack_uint32();
  var signBit = unsigned32Bit >> 31;
  var exponent  = ((unsigned32Bit >> 23) & 0xff) - 127;
  var fractionalPart = ( unsigned32Bit & 0x7fffff ) | 0x800000;
  return (signBit == 0 ? 1 : -1) *
    fractionalPart * Math.pow(2, exponent - 23);
}

DataUnpacker.prototype.unpack_double = function(){
  var high32Bits = this.unpack_uint32();
  var low32Bits = this.unpack_uint32();
  var signBit = high32Bits >> 31;
  var exponent  = ((high32Bits >> 20) & 0x7ff) - 1023;
  var highFraction = ( high32Bits & 0xfffff ) | 0x100000;
  var combinedFraction = highFraction * Math.pow(2, exponent - 20) +
    low32Bits   * Math.pow(2, exponent - 52);
  return (signBit == 0 ? 1 : -1) * combinedFraction;
}

DataUnpacker.prototype.read = function(byteLength){
  var startOffset = this.currentOffset;
  if (startOffset + byteLength <= this.bufferLength) {
    return this.dataByteView.subarray(startOffset, startOffset + byteLength);
  } else {
    throw new Error('BinaryPackFailure: read offset out of range');
  }
}

function DataPacker(){
  this.bufferBuilder = new DataBufferBuilder();
}

DataPacker.prototype.getBuffer = function(){
  return this.bufferBuilder.getBuffer();
}

DataPacker.prototype.pack = function(inputVal){
  var valueType = typeof(inputVal);
  if (valueType == 'string'){
    this.pack_string(inputVal);
  } else if (valueType == 'number'){
    if (Math.floor(inputVal) === inputVal){
      this.pack_integer(inputVal);
    } else{
      this.pack_double(inputVal);
    }
  } else if (valueType == 'boolean'){
    if (inputVal === true){
      this.bufferBuilder.append(0xc3);
    } else if (inputVal === false){
      this.bufferBuilder.append(0xc2);
    }
  } else if (valueType == 'undefined'){
    this.bufferBuilder.append(0xc0);
  } else if (valueType == 'object'){
    if (inputVal === null){
      this.bufferBuilder.append(0xc0);
    } else {
      var objectConstructor = inputVal.constructor;
      if (objectConstructor == Array){
        this.pack_array(inputVal);
      } else if (objectConstructor == Blob || objectConstructor == File) {
        this.pack_bin(inputVal);
      } else if (objectConstructor == ArrayBuffer) {
        if(binaryCapabilities.useArrayBufferView) {
          this.pack_bin(new Uint8Array(inputVal));
        } else {
          this.pack_bin(inputVal);
        }
      } else if ('BYTES_PER_ELEMENT' in inputVal){
        if(binaryCapabilities.useArrayBufferView) {
          this.pack_bin(new Uint8Array(inputVal.buffer));
        } else {
          this.pack_bin(inputVal.buffer);
        }
      } else if (objectConstructor == Object){
        this.pack_object(inputVal);
      } else if (objectConstructor == Date){
        this.pack_string(inputVal.toString());
      } else if (typeof inputVal.toBinaryPack == 'function'){