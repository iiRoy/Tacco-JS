class ImageVault {
    static MAJOR_VERSION_IDENTIFIER = 1;
    static MINOR_VERSION_IDENTIFIER = 0;

    #itemRegistry = new Map();
    #dataSegment = new Uint8Array(0);

    constructor(initialPicture, depthBits) {
        if (typeof initialPicture !== "undefined") {
            this.extractPayload(initialPicture, depthBits);
        }
    }

    addItemReference(fileRefObject) {
        this.#itemRegistry.set(fileRefObject.name, {
            kind: fileRefObject.type,
            reference: fileRefObject
        });
    }

    addTextItem(textString, itemName, itemKind) {
        const encoder = new TextEncoder();
        this.#itemRegistry.set(itemName, {
            kind: itemKind,
            contentBytes: encoder.encode(textString)
        });
    }

    addBinaryItem(byteArray, itemName, itemKind) {
        this.#itemRegistry.set(itemName, {
            kind: itemKind,
            contentBytes: byteArray
        });
    }

    clearAllItems() {
        this.#itemRegistry.clear();
    }

    removeItemByName(itemName) {
        this.#itemRegistry.delete(itemName);
    }

    getItemCount() {
        return this.#itemRegistry.size;
    }

    getItemByName(itemName) {
        return this.#itemRegistry.get(itemName);
    }

    extractPayload(sourcePicture, depthBits = 8) {
        const tempCanvas = document.createElement('canvas');
        const renderContext = tempCanvas.getContext('2d');

        tempCanvas.width = sourcePicture.width;
        tempCanvas.height = sourcePicture.height;
        renderContext.drawImage(sourcePicture, 0, 0);

        const pixelData = renderContext.getImageData(0, 0, sourcePicture.width, sourcePicture.height).data;
        const totalPixels = pixelData.length;
        
        let outputBytes = new Uint8Array(sourcePicture.width * sourcePicture.height * 3); // Max possible size
        let byteCursor = 0;

        if (depthBits === 8) {
            for (let pixelIdx = 0; pixelIdx < totalPixels; pixelIdx += 4) {
                if (pixelData[pixelIdx + 3] === 0xFF) { // Opaque pixel
                    outputBytes[byteCursor++] = pixelData[pixelIdx];
                    outputBytes[byteCursor++] = pixelData[pixelIdx + 1];
                    outputBytes[byteCursor++] = pixelData[pixelIdx + 2];
                }
            }
            this.#dataSegment = outputBytes.subarray(0, byteCursor);
        } else {
            const streamProcessor = new BinaryDataStream(outputBytes);
            for (let pixelIdx = 0; pixelIdx < totalPixels; pixelIdx += 4) {
                if (pixelData[pixelIdx + 3] === 0xFF) { // Opaque pixel
                    streamProcessor.injectBits(depthBits, pixelData[pixelIdx]);
                    streamProcessor.injectBits(depthBits, pixelData[pixelIdx + 1]);
                    streamProcessor.injectBits(depthBits, pixelData[pixelIdx + 2]);
                }
            }
            this.#dataSegment = outputBytes.subarray(0, streamProcessor.getCurrentBytePosition());
        }
        
        if (this.#dataSegment.byteLength >= 8 && this.#dataSegment[0] === 0xDA && this.#dataSegment[1] === 0xDA) {
            const directorySize = (this.#dataSegment[4] | (this.#dataSegment[5] << 8) | (this.#dataSegment[6] << 16) | (this.#dataSegment[7] << 24));
            if (this.#dataSegment.byteLength < 8 + directorySize) {
                 // Not enough data for directory, treat as raw payload
                 return this;
            }
            const directoryBytes = this.#dataSegment.subarray(8, 8 + directorySize);
            const decoder = new TextDecoder();
            const directoryData = JSON.parse(decoder.decode(directoryBytes));

            let currentPos = 8 + directorySize;
            this.#itemRegistry.clear(); // Clear existing
            for (const entry of directoryData.items) {
                if (this.#dataSegment.byteLength < currentPos + entry.size) {
                    // Not enough data for this file, stop processing
                    break; 
                }
                const itemBuffer = new Uint8Array(entry.size);
                itemBuffer.set(this.#dataSegment.subarray(currentPos, currentPos + entry.size));
                currentPos += entry.size;
                this.#itemRegistry.set(entry.itemName, {
                    kind: entry.itemKind,
                    contentBytes: itemBuffer
                });
            }
        }
        return this;
    }

    async packagePayload(completionCallback) {
        const itemPromises = [];
        for (const val of this.#itemRegistry.values()) {
            if (val.reference) {
                itemPromises.push(new Promise((resolve, reject) => {
                    const fileReader = new FileReader();
                    fileReader.onload = (event) => {
                        val.contentBytes = new Uint8Array(event.target.result);
                        delete val.reference; // Remove reference once loaded
                        resolve();
                    };
                    fileReader.onerror = reject;
                    fileReader.readAsArrayBuffer(val.reference);
                }));
            }
        }

        await Promise.all(itemPromises); // Wait for all files to load

        let totalContentSize = 0;
        const manifestEntries = [];

        for (const [key, val] of this.#itemRegistry.entries()) {
            if (val.contentBytes) {
                totalContentSize += val.contentBytes.byteLength;
                manifestEntries.push({
                    itemName: key,
                    size: val.contentBytes.byteLength,
                    itemKind: val.kind
                });
            }
        }

        if (this.#itemRegistry.size > 0) {
            const encoder = new TextEncoder();
            const manifestData = encoder.encode(JSON.stringify({ items: manifestEntries }));
            const manifestSize = manifestData.byteLength;
            const overallSize = 8 + manifestSize + totalContentSize;
            const buffer = new Uint8Array(overallSize);

            // Header: 0xDADA, version, directory size
            buffer[0] = buffer[1] = 0xDA;
            buffer[2] = ImageVault.MAJOR_VERSION_IDENTIFIER;
            buffer[3] = ImageVault.MINOR_VERSION_IDENTIFIER;
            buffer[4] = manifestSize & 0xFF;
            buffer[5] = (manifestSize >> 8) & 0xFF;
            buffer[6] = (manifestSize >> 16) & 0xFF;
            buffer[7] = (manifestSize >> 24) & 0xFF;

            buffer.set(manifestData, 8); // Write directory

            let offset = 8 + manifestData.byteLength;
            for (const val of this.#itemRegistry.values()) {
                if (val.contentBytes) {
                    buffer.set(val.contentBytes, offset);
                    offset += val.contentBytes.byteLength;
                }
            }
            this.#dataSegment = buffer;
        } else {
            this.#dataSegment = new Uint8Array(0);
        }

        if (completionCallback) {
            completionCallback.call(this);
        }
    }

    composePicture(targetSource, depthBits) {
        const renderingCanvas = document.createElement('canvas');
        const drawingContext = renderingCanvas.getContext('2d');

        let currentDepth = depthBits;

        if (typeof targetSource === "undefined") {
            currentDepth = 8;
            const pixelDim = Math.ceil(Math.sqrt(this.#dataSegment.byteLength / 3));
            renderingCanvas.width = pixelDim;
            renderingCanvas.height = pixelDim;
            drawingContext.fillRect(0, 0, pixelDim, pixelDim); // Fill with black by default
        } else {
            if (typeof currentDepth === "undefined") {
                currentDepth = 8;
            }
            renderingCanvas.width = targetSource.width;
            renderingCanvas.height = targetSource.height;
            drawingContext.drawImage(targetSource, 0, 0);
        }

        const imageDataObj = drawingContext.getImageData(0, 0, renderingCanvas.width, renderingCanvas.height);
        const pixelBytes = imageDataObj.data;
        const totalPixelBytes = pixelBytes.length;
        
        let dataCursor = 0;

        if (currentDepth === 8) {
            for (let idx = 0; idx < totalPixelBytes; idx += 4) {
                if (pixelBytes[idx + 3] === 0xFF) { // Opaque pixel
                    if (dataCursor < this.#dataSegment.byteLength) {
                        pixelBytes[idx] = this.#dataSegment[dataCursor++];
                        pixelBytes[idx + 1] = this.#dataSegment[dataCursor++];
                        pixelBytes[idx + 2] = this.#dataSegment[dataCursor++];
                    } else { // Ran out of data, stop modifying
                        break;
                    }
                }
            }
        } else {
            const streamReader = new BinaryDataStream(this.#dataSegment);
            const mask = 0xFF ^ (0xFF >>> (8 - currentDepth));
            for (let idx = 0; idx < totalPixelBytes; idx += 4) {
                if (pixelBytes[idx + 3] === 0xFF) { // Opaque pixel
                    if (streamReader.canExtractBits(currentDepth * 3)) { // Check if enough bits remain
                        pixelBytes[idx] = (pixelBytes[idx] & mask) | streamReader.extractBits(currentDepth);
                        pixelBytes[idx + 1] = (pixelBytes[idx + 1] & mask) | streamReader.extractBits(currentDepth);
                        pixelBytes[idx + 2] = (pixelBytes[idx + 2] & mask) | streamReader.extractBits(currentDepth);
                    } else {
                        break; // Ran out of data
                    }
                }
            }
        }
        
        drawingContext.putImageData(imageDataObj, 0, 0);
        return renderingCanvas;
    }

    calculateStorageCapacity(targetSource, depthBits = 8) {
        const measureCanvas = document.createElement('canvas');
        const measureContext = measureCanvas.getContext('2d');

        measureCanvas.width = targetSource.width;
        measureCanvas.height = targetSource.height;
        measureContext.drawImage(targetSource, 0, 0);

        const pixelData = measureContext.getImageData(0, 0, measureCanvas.width, measureCanvas.height).data;
        const totalPixelBytes = pixelData.length;
        
        let availableBits = 0;
        const bitsPerOpaquePixel = depthBits * 3;

        for (let idx = 0; idx < totalPixelBytes; idx += 4) {
            if (pixelData[idx + 3] === 0xFF) { // Opaque pixel
                availableBits += bitsPerOpaquePixel;
            }
        }
        return availableBits;
    }
}

class BinaryDataStream {
    #byteBuffer;
    #currentByteIndex = 0;
    #pendingBitsCount = 0; // Number of bits *remaining* in the current byte at (#currentByteIndex - 1)

    constructor(buffer) {
        this.#byteBuffer = buffer;
    }

    getCurrentBytePosition() {
        return this.#currentByteIndex + (this.#pendingBitsCount > 0 ? 1 : 0);
    }

    canExtractBits(numBits) {
        if (numBits === 0) return true;
        // Calculate total bits available from current logical position
        let totalAvailableBits = 0;
        if (this.#currentByteIndex > 0 && this.#pendingBitsCount > 0) { // If there's a partially filled byte from previous operations
            totalAvailableBits += this.#pendingBitsCount;
        }
        totalAvailableBits += (this.#byteBuffer.byteLength - this.#currentByteIndex) * 8; // Full bytes from current index onwards
        
        return totalAvailableBits >= numBits;
    }

    injectBits(numBits, value) {
        if (numBits === 0) return;
        
        // Mask value to only contain the 'numBits' least significant bits
        value &= (numBits === 32) ? 0xFFFFFFFF : ((1 << numBits) - 1); 

        let bitsRemainingFromValue = numBits;

        while (bitsRemainingFromValue > 0) {
            if (this.#pendingBitsCount > 0) { // Current byte partially filled (byte at this.#currentByteIndex - 1)
                const bitsToFillCurrentByte = Math.min(bitsRemainingFromValue, this.#pendingBitsCount);
                const shiftAmountInByte = this.#pendingBitsCount - bitsToFillCurrentByte;
                const valueChunk = (value >> (bitsRemainingFromValue - bitsToFillCurrentByte)) & ((1 << bitsToFillCurrentByte) - 1);
                
                this.#byteBuffer[this.#currentByteIndex - 1] |= (valueChunk << shiftAmountInByte);
                
                bitsRemainingFromValue -= bitsToFillCurrentByte;
                this.#pendingBitsCount -= bitsToFillCurrentByte;
            } else { // Start a new byte
                const bitsToPutInNewByte = Math.min(bitsRemainingFromValue, 8);
                const valueChunk = (value >> (bitsRemainingFromValue - bitsToPutInNewByte)) & ((1 << bitsToPutInNewByte) - 1);
                
                if (this.#currentByteIndex >= this.#byteBuffer.byteLength) {
                    // Buffer overflow. In a real scenario, this would involve resizing or error.
                    // For clone, we just stop writing as original might silently truncate.
                    return;
                }
                this.#byteBuffer[this.#currentByteIndex++] = (valueChunk << (8 - bitsToPutInNewByte));
                
                bitsRemainingFromValue -= bitsToPutInNewByte;
                this.#pendingBitsCount = 8 - bitsToPutInNewByte;
            }
        }
    }

    extractBits(numBits) {
        if (numBits === 0) return 0;

        let result = 0;
        let bitsExtracted = 0;

        while (bitsExtracted < numBits) {
            if (this.#pendingBitsCount > 0) { // Current byte partially consumed (byte at this.#currentByteIndex - 1)
                const currentByteValue = this.#byteBuffer[this.#currentByteIndex - 1];
                const bitsFromCurrentByte = Math.min(numBits - bitsExtracted, this.#pendingBitsCount);
                
                const shiftAmountInByte = this.#pendingBitsCount - bitsFromCurrentByte;
                const partialValue = (currentByteValue >> shiftAmountInByte) & ((1 << bitsFromCurrentByte) - 1);
                
                result = (result << bitsFromCurrentByte) | partialValue;
                bitsExtracted += bitsFromCurrentByte;
                this.#pendingBitsCount -= bitsFromCurrentByte;
            } else { // Read from a new byte
                if (this.#currentByteIndex >= this.#byteBuffer.byteLength) {
                    // Buffer underrun. Return partial result.
                    return result; 
                }
                const currentByteValue = this.#byteBuffer[this.#currentByteIndex++];
                const bitsToReadFromNewByte = Math.min(numBits - bitsExtracted, 8);
                
                const partialValue = (currentByteValue >> (8 - bitsToReadFromNewByte));
                
                result = (result << bitsToReadFromNewByte) | partialValue;
                bitsExtracted += bitsToReadFromNewByte;
                this.#pendingBitsCount = 8 - bitsToReadFromNewByte;
            }
        }
        return result;
    }

    positionToBit(targetBitPosition) {
        this.#currentByteIndex = Math.floor(targetBitPosition / 8);
        const bitOffsetInByte = targetBitPosition % 8;
        if (bitOffsetInByte > 0) {
            this.#pendingBitsCount = 8 - bitOffsetInByte;
            this.#currentByteIndex++; 
        } else {
            this.#pendingBitsCount = 0;
        }
    }
}

window.ImageVault = ImageVault;