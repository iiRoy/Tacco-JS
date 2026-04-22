!function(globalScope){
    if ("object" === typeof globalScope.exports && "undefined" !== typeof globalScope.module) globalScope.module.exports = globalScope();
    else if ("function" === typeof globalScope.define && globalScope.define.amd) globalScope.define([], globalScope);
    else {
        var globalReference;
        "undefined" !== typeof window ? globalReference = window : "undefined" !== typeof global ? globalReference = global : "undefined" !== typeof self && (globalReference = self);
        globalReference.AudVis = globalScope();
    }
}(function(){
    var amdDefine, currentModuleRef, moduleExportsRef;
    return (function libraryLoader(moduleDefinitions, loadedModulesCache, entryPoints){
        function acquireModule(moduleIdentifier, isRootModule){
            if (!loadedModulesCache[moduleIdentifier]){
                if (!moduleDefinitions[moduleIdentifier]){
                    var requireFunc = typeof require === "function" && require;
                    if (!isRootModule && requireFunc) return requireFunc(moduleIdentifier, !0);
                    if (cachedRequire) return cachedRequire(moduleIdentifier, !0);
                    throw new Error("Cannot locate module '" + moduleIdentifier + "'");
                }
                var moduleObject = loadedModulesCache[moduleIdentifier] = {exports:{}};
                moduleDefinitions[moduleIdentifier][0].call(moduleObject.exports, function(dependencyPath){
                    var resolvedDependency = moduleDefinitions[moduleIdentifier][1][dependencyPath];
                    return acquireModule(resolvedDependency ? resolvedDependency : dependencyPath);
                }, moduleObject, moduleObject.exports, moduleDefinitions, loadedModulesCache, entryPoints);
            }
            return loadedModulesCache[moduleIdentifier].exports;
        }
        var cachedRequire = typeof require === "function" && require;
        for (var entryIndex = 0; entryIndex < entryPoints.length; entryIndex++) acquireModule(entryPoints[entryIndex]);
        return acquireModule(entryPoints[0]);
    })({1:[function(reqDependency, currentModule, moduleExports){
        var propKey, propValue, sourceObject;

        sourceObject = reqDependency('./src/aurora');
        for (propKey in sourceObject) {
            propValue = sourceObject[propKey];
            moduleExports[propKey] = propValue;
        }

        reqDependency('./src/devices/webaudio');

        reqDependency('./src/devices/mozilla');


    },{'./src/aurora':3,'./src/devices/mozilla':22,'./src/devices/webaudio':24}],2:[function(reqDependency, currentModule, moduleExports){
        var MediaResource, MemoryBufferSource, AudioDecoder, ContainerDemuxer, EventDispatcher, LocalFileSource, NetworkHTTPSource,
            bindMethod = function(func, context){ return function(){ return func.apply(context, arguments); }; },
            hasOwnPropertyRef = {}.hasOwnProperty,
            inheritProto = function(childClass, parentClass) { for (var propName in parentClass) { if (hasOwnPropertyRef.call(parentClass, propName)) childClass[propName] = parentClass[propName]; } function constructorProxy() { this.constructor = childClass; } constructorProxy.prototype = parentClass.prototype; childClass.prototype = new constructorProxy(); childClass.__super__ = parentClass.prototype; return childClass; };

        EventDispatcher = reqDependency('./core/events');

        NetworkHTTPSource = reqDependency('./sources/node/http');

        LocalFileSource = reqDependency('./sources/node/file');

        MemoryBufferSource = reqDependency('./sources/buffer');

        ContainerDemuxer = reqDependency('./demuxer');

        AudioDecoder = reqDependency('./decoder');

        MediaResource = (function(parentEventDispatcher) {
            inheritProto(MediaResource, parentEventDispatcher);

            function MediaResource(mediaSourceInput) {
                this.mediaSource = mediaSourceInput;
                this.initiateDecoding = bindMethod(this.initiateDecoding, this);
                this.locateSuitableDecoder = bindMethod(this.locateSuitableDecoder, this);
                this.inspectChunk = bindMethod(this.inspectChunk, this);
                this.dataBufferedPercentage = 0;
                this.mediaDuration = null;
                this.mediaFormat = null;
                this.mediaMetadata = null;
                this.isProcessingActive = false;
                this.activeDemuxer = null;
                this.activeDecoder = null;
                this.mediaSource.once('data', this.inspectChunk);
                this.mediaSource.on('error', (function(selfReference) {
                    return function(errorObject) {
                        selfReference.emit('error', errorObject);
                        return selfReference.pauseProcessing();
                    };
                })(this));
                this.mediaSource.on('progress', (function(selfReference) {
                    return function(currentBuffered) {
                        selfReference.dataBufferedPercentage = currentBuffered;
                        return selfReference.emit('buffer', selfReference.dataBufferedPercentage);
                    };
                })(this));
            }

            MediaResource.fromURL = function(resourceURL) {
                return new MediaResource(new NetworkHTTPSource(resourceURL));
            };

            MediaResource.fromFile = function(filePath) {
                return new MediaResource(new LocalFileSource(filePath));
            };

            MediaResource.fromBuffer = function(inputBuffer) {
                return new MediaResource(new MemoryBufferSource(inputBuffer));
            };

            MediaResource.prototype.startProcessing = function(shouldPerformDecode) {
                if (this.isProcessingActive) {
                    return;
                }
                if (shouldPerformDecode != null) {
                    this.decodingRequested = shouldPerformDecode;
                }
                if (this.decodingRequested == null) {
                    this.decodingRequested = true;
                }
                this.isProcessingActive = true;
                this.mediaSource.start();
                if (this.activeDecoder && this.decodingRequested) {
                    return this.initiateDecoding();
                }
            };

            MediaResource.prototype.pauseProcessing = function() {
                if (!this.isProcessingActive) {
                    return;
                }
                this.isProcessingActive = false;
                return this.mediaSource.pause();
            };

            MediaResource.prototype.retrieveProperty = function(propertyName, completionCallback) {
                if (propertyName !== 'format' && propertyName !== 'duration' && propertyName !== 'metadata') {
                    return;
                }
                if (this[propertyName] != null) {
                    return completionCallback(this[propertyName]);
                } else {
                    this.once(propertyName, (function(selfReference) {
                        return function(eventValue) {
                            selfReference.pauseProcessing();
                            return completionCallback(eventValue);
                        };
                    })(this));
                    return this.startProcessing();
                }
            };

            MediaResource.prototype.processAudioPacket = function() {
                return this.activeDecoder.decode();
            };

            MediaResource.prototype.decodeToSingleBuffer = function(completionCallback) {
                var audioChunks, chunkDataHandler, totalLength;
                totalLength = 0;
                audioChunks = [];
                this.on('data', chunkDataHandler = function(dataPacket) {
                    totalLength += dataPacket.length;
                    return audioChunks.push(dataPacket);
                });
                this.once('end', function() {
                    var outputBuffer, currentChunk, bufferOffset, idx, totalCount;
                    outputBuffer = new Float32Array(totalLength);
                    bufferOffset = 0;
                    for (idx = 0, totalCount = audioChunks.length; idx < totalCount; idx++) {
                        currentChunk = audioChunks[idx];
                        outputBuffer.set(currentChunk, bufferOffset);
                        bufferOffset += currentChunk.length;
                    }
                    this.off('data', chunkDataHandler);
                    return completionCallback(outputBuffer);
                });
                return this.startProcessing();
            };

            MediaResource.prototype.inspectChunk = function(dataPacket) {
                var detectedDemuxer;
                if (!this.isProcessingActive) {
                    return;
                }
                detectedDemuxer = ContainerDemuxer.find(dataPacket);
                if (!detectedDemuxer) {
                    return this.emit('error', 'A demuxer for this container was not found.');
                }
                this.activeDemuxer = new detectedDemuxer(this.mediaSource, dataPacket);
                this.activeDemuxer.on('format', this.locateSuitableDecoder);
                this.activeDemuxer.on('duration', (function(selfReference) {
                    return function(mediaDuration) {
                        selfReference.mediaDuration = mediaDuration;
                        return selfReference.emit('duration', selfReference.mediaDuration);
                    };
                })(this));
                this.activeDemuxer.on('metadata', (function(selfReference) {
                    return function(mediaMetadata) {
                        selfReference.mediaMetadata = mediaMetadata;
                        return selfReference.emit('metadata', selfReference.mediaMetadata);
                    };
                })(this));
                return this.activeDemuxer.on('error', (function(selfReference) {
                    return function(errorObject) {
                        selfReference.emit('error', errorObject);
                        return selfReference.pauseProcessing();
                    };
                })(this));
            };

            MediaResource.prototype.locateSuitableDecoder = function(mediaFormat) {
                var foundDecoder, divisorFactor;
                this.mediaFormat = mediaFormat;
                if (!this.isProcessingActive) {
                    return;
                }
                this.emit('format', this.mediaFormat);
                foundDecoder = AudioDecoder.find(this.mediaFormat.formatID);
                if (!foundDecoder) {
                    return this.emit('error', "A decoder for " + this.mediaFormat.formatID + " was not found.");
                }
                this.activeDecoder = new foundDecoder(this.activeDemuxer, this.mediaFormat);
                if (this.mediaFormat.floatingPoint) {
                    this.activeDecoder.on('data', (function(selfReference) {
                        return function(dataBuffer) {
                            return selfReference.emit('data', dataBuffer);
                        };
                    })(this));
                } else {
                    divisorFactor = Math.pow(2, this.mediaFormat.bitsPerChannel - 1);
                    this.activeDecoder.on('data', (function(selfReference) {
                        return function(inputBuffer) {
                            var outputBuffer, idx, totalCount, audioSample;
                            outputBuffer = new Float32Array(inputBuffer.length);
                            for (idx = 0, totalCount = inputBuffer.length; idx < totalCount; idx++) {
                                audioSample = inputBuffer[idx];
                                outputBuffer[idx] = audioSample / divisorFactor;
                            }
                            return selfReference.emit('data', outputBuffer);
                        };
                    })(this));
                }
                this.activeDecoder.on('error', (function(selfReference) {
                    return function(errorObject) {
                        selfReference.emit('error', errorObject);
                        return selfReference.pauseProcessing();
                    };
                })(this));
                this.activeDecoder.on('end', (function(selfReference) {
                    return function() {
                        return selfReference.emit('end');
                    };
                })(this));
                this.emit('decodeStart');
                if (this.decodingRequested) {
                    return this.initiateDecoding();
                }
            };

            MediaResource.prototype.initiateDecoding = function() {
                while (this.activeDecoder.decode() && this.isProcessingActive) {
                    continue;
                }
                if (this.isProcessingActive) {
                    return this.activeDecoder.once('data', this.initiateDecoding);
                }
            };

            return MediaResource;

        })(EventDispatcher);

        moduleExports = MediaResource;


    },{'./core/events':9,'./decoder':12,'./demuxer':15,'./sources/buffer':32,'./sources/node/file':30,'./sources/node/http':31}],3:[function(reqDependency, currentModule, moduleExports){
        var propKey, propValue, sourceObject;

        sourceObject = reqDependency('./aurora_base');
        for (propKey in sourceObject) {
            propValue = sourceObject[propKey];
            moduleExports[propKey] = propValue;
        }

        reqDependency('./demuxers/caf');

        reqDependency('./demuxers/m4a');

        reqDependency('./demuxers/aiff');

        reqDependency('./demuxers/wave');

        reqDependency('./demuxers/au');

        reqDependency('./decoders/lpcm');

        reqDependency('./decoders/xlaw');


    },{'./aurora_base':4,'./decoders/lpcm':13,'./decoders/xlaw':14,'./demuxers/aiff':16,'./demuxers/au':17,'./demuxers/caf':18,'./demuxers/m4a':19,'./demuxers/wave':20}],4:[function(reqDependency, currentModule, moduleExports){
        moduleExports.CoreObject = reqDependency('./core/base');

        moduleExports.AudioBuffer = reqDependency('./core/buffer');

        moduleExports.BufferSequence = reqDependency('./core/bufferlist');

        moduleExports.DataStream = reqDependency('./core/stream');

        moduleExports.BitReader = reqDependency('./core/bitstream');

        moduleExports.EventDispatcher = reqDependency('./core/events');

        moduleExports.DataUnderflowError = reqDependency('./core/underflow');

        moduleExports.NetworkHTTPSource = reqDependency('./sources/node/http');

        moduleExports.LocalFileSource = reqDependency('./sources/node/file');

        moduleExports.MemoryBufferSource = reqDependency('./sources/buffer');

        moduleExports.ContainerDemuxer = reqDependency('./demuxer');

        moduleExports.AudioDecoder = reqDependency('./decoder');

        moduleExports.PlaybackDevice = reqDependency('./device');

        moduleExports.MediaResource = reqDependency('./asset');

        moduleExports.AudioPlayer = reqDependency('./player');

        moduleExports.AudioFilter = reqDependency('./filter');

        moduleExports.VolumeControlFilter = reqDependency('./filters/volume');

        moduleExports.BalanceControlFilter = reqDependency('./filters/balance');


    },{'./asset':2,'./core/base':5,'./core/bitstream':6,'./core/buffer':7,'./core/bufferlist':8,'./core/events':9,'./core/stream':10,'./core/underflow':11,'./decoder':12,'./demuxer':15,'./device':21,'./filter':25,'./filters/balance':26,'./filters/volume':27,'./player':28,'./sources/buffer':32,'./sources/node/file':30,'./sources/node/http':31}],5:[function(reqDependency, currentModule, moduleExports){
        var CoreObject,
            hasOwnPropertyRef = {}.hasOwnProperty,
            inheritProto = function(childClass, parentClass) { for (var propName in parentClass) { if (hasOwnPropertyRef.call(parentClass, propName)) childClass[propName] = parentClass[propName]; } function constructorProxy() { this.constructor = childClass; } constructorProxy.prototype = parentClass.prototype; childClass.prototype = new constructorProxy(); childClass.__super__ = parentClass.prototype; return childClass; },
            indexOfPolyfill = [].indexOf || function(itemToCheck) { for (var idx = 0, totalLen = this.length; idx < totalLen; idx++) { if (idx in this && this[idx] === itemToCheck) return idx; } return -1; };

        CoreObject = (function() {
            var methodTestRegex;

            function CoreObject() {}

            methodTestRegex = /\b_super\b/;

            CoreObject.extend = function(propertiesObj) {
                var DerivedClass, classMethod, originalKeys, parentPrototype, _refForProperties;
                DerivedClass = (function(parentPrototype) {
                    inheritProto(DerivedClass, parentPrototype);

                    function DerivedClass() {
                        return DerivedClass.__super__.constructor.apply(this, arguments);
                    }

                    return DerivedClass;

                })(this);
                if (typeof propertiesObj === 'function') {
                    originalKeys = Object.keys(DerivedClass.prototype);
                    propertiesObj.call(DerivedClass, DerivedClass);
                    propertiesObj = {};
                    _refForProperties = DerivedClass.prototype;
                    for (propKey in _refForProperties) {
                        classMethod = _refForProperties[propKey];
                        if (indexOfPolyfill.call(originalKeys, propKey) < 0) {
                            propertiesObj[propKey] = classMethod;
                        }
                    }
                }
                parentPrototype = DerivedClass.__super__;
                for (propKey in propertiesObj) {
                    classMethod = propertiesObj[propKey];
                    if (typeof classMethod === 'function' && methodTestRegex.test(classMethod)) {
                        (function(methodName, methodFunc) {
                            return DerivedClass.prototype[methodName] = function() {
                                var returnValue, tempSuper;
                                tempSuper = this._super;
                                this._super = parentPrototype[methodName];
                                returnValue = methodFunc.apply(this, arguments);
                                this._super = tempSuper;
                                return returnValue;
                            };
                        })(propKey, classMethod);
                    } else {
                        DerivedClass.prototype[propKey] = classMethod;
                    }
                }
                return DerivedClass;
            };

            return CoreObject;

        })();

        moduleExports = CoreObject;


    },{}],6:[function(reqDependency, currentModule, moduleExports){
        var BinaryBitStream;

        BinaryBitStream = (function() {
            function BinaryBitStream(underlyingStreamInput) {
                this.underlyingStream = underlyingStreamInput;
                this.currentBitPosition = 0;
            }

            BinaryBitStream.prototype.createCopy = function() {
                var clonedStream;
                clonedStream = new BinaryBitStream(this.underlyingStream.createCopy());
                clonedStream.currentBitPosition = this.currentBitPosition;
                return clonedStream;
            };

            BinaryBitStream.prototype.currentOffset = function() {
                return 8 * this.underlyingStream.currentOffset + this.currentBitPosition;
            };

            BinaryBitStream.prototype.canRead = function(bitsToRead) {
                return this.underlyingStream.canRead((bitsToRead + 8 - this.currentBitPosition) / 8);
            };

            BinaryBitStream.prototype.advanceBits = function(bitsToMove) {
                var newPosition;
                newPosition = this.currentBitPosition + bitsToMove;
                this.underlyingStream.advanceBytes(newPosition >> 3);
                return this.currentBitPosition = newPosition & 7;
            };

            BinaryBitStream.prototype.rewindBits = function(bitsToMove) {
                var newPosition;
                newPosition = this.currentBitPosition - bitsToMove;
                this.underlyingStream.rewindBytes(Math.abs(newPosition >> 3));
                return this.currentBitPosition = newPosition & 7;
            };

            BinaryBitStream.prototype.jumpToOffset = function(targetOffset) {
                var currentByteOffset;
                currentByteOffset = this.currentOffset();
                if (targetOffset > currentByteOffset) {
                    return this.advanceBits(targetOffset - currentByteOffset);
                } else if (targetOffset < currentByteOffset) {
                    return this.rewindBits(currentByteOffset - targetOffset);
                }
            };

            BinaryBitStream.prototype.alignToByte = function() {
                if (this.currentBitPosition !== 0) {
                    this.currentBitPosition = 0;
                    return this.underlyingStream.advanceBytes(1);
                }
            };

            BinaryBitStream.prototype.readBits = function(bitsCount, isSigned) {
                var readResult, bytePart0, bytePart1, bytePart2, bytePart3, bytePart4, totalBitsToRead;
                if (bitsCount === 0) {
                    return 0;
                }
                totalBitsToRead = bitsCount + this.currentBitPosition;
                if (totalBitsToRead <= 8) {
                    readResult = ((this.underlyingStream.peekUInt8() << this.currentBitPosition) & 0xff) >>> (8 - bitsCount);
                } else if (totalBitsToRead <= 16) {
                    readResult = ((this.underlyingStream.peekUInt16() << this.currentBitPosition) & 0xffff) >>> (16 - bitsCount);
                } else if (totalBitsToRead <= 24) {
                    readResult = ((this.underlyingStream.peekUInt24() << this.currentBitPosition) & 0xffffff) >>> (24 - bitsCount);
                } else if (totalBitsToRead <= 32) {
                    readResult = (this.underlyingStream.peekUInt32() << this.currentBitPosition) >>> (32 - bitsCount);
                } else if (totalBitsToRead <= 40) {
                    bytePart0 = this.underlyingStream.peekUInt8(0) * 0x0100000000;
                    bytePart1 = this.underlyingStream.peekUInt8(1) << 24 >>> 0;
                    bytePart2 = this.underlyingStream.peekUInt8(2) << 16;
                    bytePart3 = this.underlyingStream.peekUInt8(3) << 8;
                    bytePart4 = this.underlyingStream.peekUInt8(4);
                    readResult = bytePart0 + bytePart1 + bytePart2 + bytePart3 + bytePart4;
                    readResult %= Math.pow(2, 40 - this.currentBitPosition);
                    readResult = Math.floor(readResult / Math.pow(2, 40 - this.currentBitPosition - bitsCount));
                } else {
                    throw new Error("Attempted to read too many bits!");
                }
                if (isSigned) {
                    if (totalBitsToRead < 32) {
                        if (readResult >>> (bitsCount - 1)) {
                            readResult = ((1 << bitsCount >>> 0) - readResult) * -1;
                        }
                    } else {
                        if (readResult / Math.pow(2, bitsCount - 1) | 0) {
                            readResult = (Math.pow(2, bitsCount) - readResult) * -1;
                        }
                    }
                }
                this.advanceBits(bitsCount);
                return readResult;
            };

            BinaryBitStream.prototype.peekBits = function(bitsCount, isSigned) {
                var readResult, bytePart0, bytePart1, bytePart2, bytePart3, bytePart4, totalBitsToRead;
                if (bitsCount === 0) {
                    return 0;
                }
                totalBitsToRead = bitsCount + this.currentBitPosition;
                if (totalBitsToRead <= 8) {
                    readResult = ((this.underlyingStream.peekUInt8() << this.currentBitPosition) & 0xff) >>> (8 - bitsCount);
                } else if (totalBitsToRead <= 16) {
                    readResult = ((this.underlyingStream.peekUInt16() << this.currentBitPosition) & 0xffff) >>> (16 - bitsCount);
                } else if (totalBitsToRead <= 24) {
                    readResult = ((this.underlyingStream.peekUInt24() << this.currentBitPosition) & 0xffffff) >>> (24 - bitsCount);
                } else if (totalBitsToRead <= 32) {
                    readResult = (this.underlyingStream.peekUInt32() << this.currentBitPosition) >>> (32 - bitsCount);
                } else if (totalBitsToRead <= 40) {
                    bytePart0 = this.underlyingStream.peekUInt8(0) * 0x0100000000;
                    bytePart1 = this.underlyingStream.peekUInt8(1) << 24 >>> 0;
                    bytePart2 = this.underlyingStream.peekUInt8(2) << 16;
                    bytePart3 = this.underlyingStream.peekUInt8(3) << 8;
                    bytePart4 = this.underlyingStream.peekUInt8(4);
                    readResult = bytePart0 + bytePart1 + bytePart2 + bytePart3 + bytePart4;
                    readResult %= Math.pow(2, 40 - this.currentBitPosition);
                    readResult = Math.floor(readResult / Math.pow(2, 40 - this.currentBitPosition - bitsCount));
                } else {
                    throw new Error("Attempted to peek too many bits!");
                }
                if (isSigned) {
                    if (totalBitsToRead < 32) {
                        if (readResult >>> (bitsCount - 1)) {
                            readResult = ((1 << bitsCount >>> 0) - readResult) * -1;
                        }
                    } else {
                        if (readResult / Math.pow(2, bitsCount - 1) | 0) {
                            readResult = (Math.pow(2, bitsCount) - readResult) * -1;
                        }
                    }
                }
                return readResult;
            };

            return BinaryBitStream;

        })();

        moduleExports = BinaryBitStream;

    },{}]
});