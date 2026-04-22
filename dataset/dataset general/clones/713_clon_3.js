// This module provides functionality for embedding and extracting arbitrary data
// within the pixel data of images, leveraging steganography principles.
// It supports various bit depths for color components to control data density.
window.PixelVault = function(srcImgElement, componentBitDepth) {
    // These constants define the internal format revision of the embedded data structure.
    // They are used during the encoding process to mark the data stream.
    const VAULT_FORMAT_MAJOR_REVISION = 1;
    const VAULT_FORMAT_MINOR_REVISION = 0;

    // A collection of objects, each representing a file or data asset stored within the vault.
    // Each entry typically includes properties like `assetName`, `assetType`, and `contentBytes`.
    this.vaultEntries = [];

    // The consolidated byte buffer containing all embedded file data, including metadata.
    // This buffer is the direct result of encoding or the source for decoding.
    this.payloadBuffer = new Uint8Array(0);

    // Upon instantiation, if a valid HTML image element is provided,
    // the vault will attempt to extract data from it immediately.
    if (typeof srcImgElement !== "undefined" && srcImgElement instanceof HTMLImageElement) {
        // Validate and sanitize the provided bit depth for color components.
        // It must be a number between 1 and 8 (inclusive), defaulting to 8 if invalid.
        const effectiveBitDepth = (typeof componentBitDepth === 'number' && componentBitDepth >= 1 && componentBitDepth <= 8)
                                ? Math.floor(componentBitDepth) : 8;
        this.extractDataFromImage(srcImgElement, effectiveBitDepth);
    } else if (srcImgElement !== undefined) {
        // Log a warning if the provided initial image is not a proper HTMLImageElement.
        console.warn("PixelVault: Initial input for image source is not a valid HTMLImageElement. Decoding skipped.");
    }
};

window.PixelVault.prototype = {

    // Registers a file system `File` object for later embedding.
    // The actual content will be loaded asynchronously during the `generateEmbeddedBuffer` phase.
    appendFileReference: function(fileObject) {
        if (!fileObject || !(fileObject instanceof File)) {
            console.error("PixelVault: Invalid File object provided for appending.");
            return;
        }
        this.vaultEntries.push({ assetName: fileObject.name, assetType: fileObject.type, fileHandle: fileObject });
    },

    // Adds a plain text string as a new asset to the vault.
    // The text will be UTF-8 encoded into a Uint8Array.
    appendTextAsset: function(textString, assetName, assetType = 'text/plain') {
        if (typeof textString !== 'string' || !assetName) {
            console.error("PixelVault: Invalid text content or asset name provided for appending.");
            return;
        }
        const encodedContent = this.encodeStringToUtf8(textString);
        this.vaultEntries.push({ assetName: assetName, assetType: assetType, contentBytes: encodedContent });
    },

    // Incorporates a raw binary `Uint8Array` as a new asset into the vault.
    appendBinaryAsset: function(byteArray, assetName, assetType = 'application/octet-stream') {
        if (!(byteArray instanceof Uint8Array) || !assetName) {
            console.error("PixelVault: Invalid Uint8Array or asset name provided for appending.");
            return;
        }
        this.vaultEntries.push({ assetName: assetName, assetType: assetType, contentBytes: byteArray });
    },

    // Erases all currently registered assets and clears the internal payload buffer.
    resetVault: function() {
        this.vaultEntries = [];
        this.payloadBuffer = new Uint8Array(0);
    },

    // Removes an asset from the vault based on its numerical index.
    // Returns `true` if an asset was successfully removed, `false` otherwise.
    removeAssetByIndex: function(idx) {
        if (typeof idx !== 'number' || idx < 0 || idx >= this.vaultEntries.length) {
            console.warn(`PixelVault: Attempted to remove asset at invalid index: ${idx}.`);
            return false;
        }
        this.vaultEntries.splice(idx, 1);
        return true;
    },

    // Deletes the first asset found that matches the given name.
    // Returns `true` if an asset was found and removed, `false` otherwise.
    removeAssetByName: function(targetName) {
        if (!targetName || typeof targetName !== 'string') {
            console.error("PixelVault: Invalid asset name provided for removal.");
            return false;
        }
        const initialCount = this.vaultEntries.length;
        this.vaultEntries = this.vaultEntries.filter(entry => entry.assetName !== targetName);
        return this.vaultEntries.length < initialCount; // True if filter removed any element
    },

    // Reports the current total number of assets stored in the vault.
    getAssetCount: function() {
        return this.vaultEntries.length;
    },

    // Retrieves an asset entry by its zero-based index.
    // Returns the asset object or `null` if the index is out of bounds.
    getAssetAt: function(idx) {
        if (typeof idx !== 'number' || idx < 0 || idx >= this.vaultEntries.length) {
            return null;
        }
        return this.vaultEntries[idx];
    },

    // Locates and returns the first asset entry that matches the given name.
    // Returns the asset object or `null` if no matching asset is found.
    getAssetByName: function(targetName) {
        if (!targetName || typeof targetName !== 'string') {
            return null;
        }
        for (const entry of this.vaultEntries) {
            if (entry.assetName === targetName) {
                return entry;
            }
        }
        return null;
    },

    // Extracts hidden data from a provided image element.
    // The `componentBitDepth` specifies how many least significant bits per color channel were used for embedding.
    extractDataFromImage: function(srcImgElement, componentBitDepth = 8) {
        if (!srcImgElement || !(srcImgElement instanceof HTMLImageElement)) {
            console.error("PixelVault: Invalid source image element for data extraction.");
            this.payloadBuffer = new Uint8Array(0);
            this.vaultEntries = [];
            return this;
        }

        const effectiveBitDepth = Math.max(1, Math.min(8, Math.floor(componentBitDepth)));

        const processingCanvas = document.createElement('canvas');
        const canvasContext = processingCanvas.getContext('2d', { willReadFrequently: true });

        processingCanvas.width = srcImgElement.naturalWidth || srcImgElement.width;
        processingCanvas.height = srcImgElement.naturalHeight || srcImgElement.height;

        canvasContext.clearRect(0, 0, processingCanvas.width, processingCanvas.height);
        canvasContext.drawImage(srcImgElement, 0, 0);

        const imageData = canvasContext.getImageData(0, 0, processingCanvas.width, processingCanvas.height);
        const pixelData = imageData.data;
        const totalPixelDataLength = pixelData.length;

        // An initial estimation for the payload buffer size.
        // Assuming roughly 3 bytes of data per 4 bytes of pixel data (RGB, ignoring alpha).
        const estimatedPayloadCapacity = Math.floor((totalPixelDataLength / 4) * 3);
        const tempPayloadBytes = new Uint8Array(estimatedPayloadCapacity);

        let currentPixelByteIdx = 0;
        let payloadWriteIdx = 0; // Only used for 8-bit depth

        if (effectiveBitDepth === 8) {
            while (currentPixelByteIdx < totalPixelDataLength) {
                // Only extract from fully opaque pixels (alpha == 255).
                if (pixelData[currentPixelByteIdx + 3] === 0xFF) {
                    if (payloadWriteIdx + 2 < estimatedPayloadCapacity) { // Ensure buffer space
                        tempPayloadBytes[payloadWriteIdx++] = pixelData[currentPixelByteIdx++];
                        tempPayloadBytes[payloadWriteIdx++] = pixelData[currentPixelByteIdx++];
                        tempPayloadBytes[payloadWriteIdx++] = pixelData[currentPixelByteIdx++];
                        currentPixelByteIdx++; // Skip alpha channel
                    } else {
                        console.warn("PixelVault: Payload buffer capacity exceeded during 8-bit data extraction. Data might be truncated.");
                        break;
                    }
                } else {
                    currentPixelByteIdx += 4; // Skip transparent pixel
                }
            }
            this.payloadBuffer = tempPayloadBytes.subarray(0, payloadWriteIdx);
        } else {
            // For bit depths less than 8, use the BitAccessor to read bit by bit.
            const bitStreamReader = new window.BitAccessor(tempPayloadBytes);
            while (currentPixelByteIdx < totalPixelDataLength) {
                if (pixelData[currentPixelByteIdx + 3] === 0xFF) {
                    // Extract bits into the temporary payload buffer.
                    // The BitAccessor manages its own internal byte and bit pointers.
                    bitStreamReader.insertBitSequence(effectiveBitDepth, pixelData[currentPixelByteIdx++]);
                    bitStreamReader.insertBitSequence(effectiveBitDepth, pixelData[currentPixelByteIdx++]);
                    bitStreamReader.insertBitSequence(effectiveBitDepth, pixelData[currentPixelByteIdx++]);
                    currentPixelByteIdx++; // Skip alpha channel
                } else {
                    currentPixelByteIdx += 4; // Skip transparent pixel
                }
            }
            // The BitAccessor's current byte position indicates the actual length used.
            this.payloadBuffer = tempPayloadBytes.subarray(0, bitStreamReader.currentBytePosition);
        }

        // Attempt to parse the directory structure from the extracted payload.
        const VAULT_MAGIC_BYTE_1 = 0xda;
        const VAULT_MAGIC_BYTE_2 = 0xda;
        const HEADER_MIN_SIZE = 8; // Magic (2 bytes) + Version (2 bytes) + Directory Size (4 bytes)

        if (this.payloadBuffer.length >= HEADER_MIN_SIZE &&
            this.payloadBuffer[0] === VAULT_MAGIC_BYTE_1 &&
            this.payloadBuffer[1] === VAULT_MAGIC_BYTE_2) {

            // Read the 32-bit little-endian directory size.
            const directoryByteSize = this.payloadBuffer[4] |
                                      (this.payloadBuffer[5] << 8) |
                                      (this.payloadBuffer[6] << 16) |
                                      (this.payloadBuffer[7] << 24);

            if (this.payloadBuffer.length >= HEADER_MIN_SIZE + directoryByteSize) {
                const directorySegment = this.payloadBuffer.subarray(HEADER_MIN_SIZE, HEADER_MIN_SIZE + directoryByteSize);
                let vaultDirectory;
                try {
                    vaultDirectory = JSON.parse(this.decodeUtf8ToText(directorySegment));
                } catch (e) {
                    console.error("PixelVault: Failed to parse vault directory JSON. Error:", e);
                    this.vaultEntries = []; // Clear entries if directory is unreadable.
                    return this;
                }

                let currentPayloadOffset = HEADER_MIN_SIZE + directoryByteSize;
                this.vaultEntries = []; // Reset entries before populating from directory.

                if (vaultDirectory && Array.isArray(vaultDirectory.files)) {
                    for (const fileMetadata of vaultDirectory.files) {
                        // Basic validation for file metadata.
                        if (fileMetadata && typeof fileMetadata.name === 'string' &&
                            typeof fileMetadata.size === 'number' && typeof fileMetadata.type === 'string') {

                            if (currentPayloadOffset + fileMetadata.size <= this.payloadBuffer.length) {
                                const fileContent = this.payloadBuffer.subarray(currentPayloadOffset, currentPayloadOffset + fileMetadata.size);
                                this.vaultEntries.push({ assetName: fileMetadata.name, assetType: fileMetadata.type, contentBytes: fileContent });
                                currentPayloadOffset += fileMetadata.size;
                            } else {
                                console.warn(`PixelVault: Declared file '${fileMetadata.name}' extends beyond available payload. Data may be incomplete.`);
                                break; // Stop processing if a file cannot be fully read.
                            }
                        } else {
                            console.warn("PixelVault: Invalid file metadata found in directory:", fileMetadata);
                        }
                    }
                } else {
                    console.warn("PixelVault: Vault directory is malformed or lacks a 'files' array.");
                }
            } else {
                console.warn("PixelVault: Declared directory size exceeds available extracted payload. Directory might be incomplete.");
            }
        } else {
            // If no magic number is found, assume the entire payload is a single raw file.
            this.vaultEntries = [{ assetName: "raw_data_extracted.bin", assetType: "application/octet-stream", contentBytes: this.payloadBuffer }];
            console.log("PixelVault: No vault directory signature found. Interpreting payload as a single raw data file.");
        }
        return this;
    },

    // Generates the consolidated byte buffer (`payloadBuffer`) from all registered assets.
    // This method handles asynchronous file loading and then serializes all data.
    // A `completionCallback` is invoked once the buffer is ready.
    generateEmbeddedBuffer: function(completionCallback) {
        const self = this; // Maintain context for nested functions and callbacks.

        // Step 1: Asynchronously load content for any file references (e.g., from File objects).
        // Returns a Promise that resolves when all files are loaded.
        const loadFileContents = () => {
            return new Promise((resolve, reject) => {
                let filesPendingLoad = 0;

                self.vaultEntries.forEach(entry => {
                    if (entry.fileHandle && entry.fileHandle instanceof File) {
                        filesPendingLoad++;
                        const fileReader = new FileReader();

                        fileReader.onload = (event) => {
                            entry.contentBytes = new Uint8Array(event.target.result);
                            delete entry.fileHandle; // Remove handle after content is loaded.
                            filesPendingLoad--;
                            if (filesPendingLoad === 0) {
                                resolve(); // All asynchronous loads complete.
                            }
                        };

                        fileReader.onerror = (error) => {
                            console.error(`PixelVault: Error loading file '${entry.assetName}':`, error);
                            // Even with an error, decrement to prevent deadlock.
                            // Consider more robust error handling (e.g., skipping file or rejecting promise).
                            filesPendingLoad--;
                            if (filesPendingLoad === 0) {
                                resolve(); // Resolve even on error for now, to allow serialization of other files.
                            }
                        };

                        fileReader.readAsArrayBuffer(entry.fileHandle);
                    }
                });

                if (filesPendingLoad === 0) {
                    resolve(); // No files to load, proceed immediately.
                }
            });
        };

        // Step 2: Serialize all loaded asset contents into a single Uint8Array buffer.
        const serializeAllAssets = () => {
            if (self.vaultEntries.length === 0) {
                self.payloadBuffer = new Uint8Array(0);
                if (completionCallback) completionCallback.call(self);
                return;
            }

            let totalContentDataSize = 0;
            const directoryStructure = { files: [] };

            // First pass: Calculate total data size and build the directory metadata.
            for (const entry of self.vaultEntries) {
                if (!entry.contentBytes) {
                    console.warn(`PixelVault: Asset '${entry.assetName}' has no loaded content. Skipping during serialization.`);
                    continue;
                }
                const currentAssetByteLength = entry.contentBytes.byteLength;
                totalContentDataSize += currentAssetByteLength;
                directoryStructure.files.push({
                    name: entry.assetName,
                    size: currentAssetByteLength,
                    type: entry.assetType
                });
            }

            const directoryBytes = this.encodeStringToUtf8(JSON.stringify(directoryStructure));
            const directoryByteLength = directoryBytes.byteLength;

            // Define the header structure for the vault format.
            const VAULT_MAGIC_BYTE_1 = 0xda;
            const VAULT_MAGIC_BYTE_2 = 0xda;
            const CURRENT_FORMAT_MAJOR_REV = 1; // Corresponding to VAULT_FORMAT_MAJOR_REVISION
            const CURRENT_FORMAT_MINOR_REV = 0; // Corresponding to VAULT_FORMAT_MINOR_REVISION
            const HEADER_FIXED_BYTE_SIZE = 8; // Magic (2) + Version (2) + Directory Size (4)

            const finalBufferTotalSize = HEADER_FIXED_BYTE_SIZE + directoryByteLength + totalContentDataSize;
            const outputBytes = new Uint8Array(finalBufferTotalSize);

            let currentWriteOffset = 0;

            // Write the vault header (Magic Number).
            outputBytes[currentWriteOffset++] = VAULT_MAGIC_BYTE_1;
            outputBytes[currentWriteOffset++] = VAULT_MAGIC_BYTE_2;

            // Write the vault format version.
            outputBytes[currentWriteOffset++] = CURRENT_FORMAT_MAJOR_REV;
            outputBytes[currentWriteOffset++] = CURRENT_FORMAT_MINOR_REV;

            // Write the directory size (32-bit, little-endian).
            outputBytes[currentWriteOffset++] = directoryByteLength & 0xFF;
            outputBytes[currentWriteOffset++] = (directoryByteLength >> 8) & 0xFF;
            outputBytes[currentWriteOffset++] = (directoryByteLength >> 16) & 0xFF;
            outputBytes[currentWriteOffset++] = (directoryByteLength >> 24) & 0xFF;

            // Embed the directory bytes.
            outputBytes.set(directoryBytes, currentWriteOffset);
            currentWriteOffset += directoryByteLength;

            // Embed the content bytes of each asset.
            for (const entry of self.vaultEntries) {
                if (entry.contentBytes) {
                    outputBytes.set(entry.contentBytes, currentWriteOffset);
                    currentWriteOffset += entry.contentBytes.byteLength;
                }
            }

            self.payloadBuffer = outputBytes; // Store the newly generated buffer.
            if (completionCallback) {
                completionCallback.call(self); // Invoke the user-provided callback.
            }
        };

        // Execute the sequence: load files, then serialize.
        loadFileContents()
            .then(serializeAllAssets)
            .catch(error => {
                console.error("PixelVault: Error during file loading or serialization process:", error);
                self.payloadBuffer = new Uint8Array(0); // Clear buffer on critical errors.
                if (completionCallback) completionCallback.call(self);
            });
    },

    // Creates and returns an HTMLCanvasElement with the vault's payload data embedded within its pixels.
    // If `targetImageElement` is provided, its dimensions and content are used as a base.
    // Otherwise, a new canvas is created just large enough to contain the data.
    renderImageOutput: function(targetImageElement, componentBitDepth = 8) {
        const outputCanvas = document.createElement('canvas');
        const canvasContext = outputCanvas.getContext('2d');

        const effectiveBitDepth = Math.max(1, Math.min(8, Math.floor(componentBitDepth)));

        let outputWidth, outputHeight;

        if (!targetImageElement || !(targetImageElement instanceof HTMLImageElement)) {
            // No valid target image provided; create a new canvas sized to fit the payload.
            const bytesPerPixel = 3; // R, G, B channels
            const requiredPixels = Math.ceil(this.payloadBuffer.byteLength / bytesPerPixel);
            const sideLength = Math.ceil(Math.sqrt(requiredPixels));

            outputWidth = sideLength;
            outputHeight = sideLength;
            outputCanvas.width = outputWidth;
            outputCanvas.height = outputHeight;
            canvasContext.fillStyle = '#000000'; // Default background for new canvas
            canvasContext.fillRect(0, 0, outputWidth, outputHeight);
        } else {
            // Use the dimensions and content of the provided target image.
            outputWidth = targetImageElement.naturalWidth || targetImageElement.width;
            outputHeight = targetImageElement.naturalHeight || targetImageElement.height;
            outputCanvas.width = outputWidth;
            outputCanvas.height = outputHeight;
            canvasContext.drawImage(targetImageElement, 0, 0);
        }

        const imageData = canvasContext.getImageData(0, 0, outputWidth, outputHeight);
        const pixelDataArray = imageData.data;
        const totalPixelDataBytes = pixelDataArray.length;

        let currentPixelByteIdx = 0;
        let payloadReadIdx = 0;

        if (effectiveBitDepth === 8) {
            // Direct byte embedding for 8-bit depth.
            while (currentPixelByteIdx < totalPixelDataBytes && payloadReadIdx < this.payloadBuffer.byteLength) {
                if (pixelDataArray[currentPixelByteIdx + 3] === 0xFF) { // Only embed in opaque pixels
                    pixelDataArray[currentPixelByteIdx++] = this.payloadBuffer[payloadReadIdx++];
                    pixelDataArray[currentPixelByteIdx++] = this.payloadBuffer[payloadReadIdx++];
                    pixelDataArray[currentPixelByteIdx++] = this.payloadBuffer[payloadReadIdx++];
                    currentPixelByteIdx++; // Skip alpha channel
                } else {
                    currentPixelByteIdx += 4; // Skip transparent pixel
                }
            }
        } else {
            // Bit-stream embedding for lower bit depths.
            const bitOutputStream = new window.BitAccessor(this.payloadBuffer);
            // Create a bitmask to preserve the upper (non-steganographic) bits of the pixel components.
            const upperBitsMask = 0xFF ^ ((1 << effectiveBitDepth) - 1);

            while (currentPixelByteIdx < totalPixelDataBytes && !bitOutputStream.isEndOfStream()) {
                if (pixelDataArray[currentPixelByteIdx + 3] === 0xFF) { // Only embed in opaque pixels
                    // Embed into R, G, B channels, preserving existing upper bits.
                    pixelDataArray[currentPixelByteIdx] = (pixelDataArray[currentPixelByteIdx] & upperBitsMask) | bitOutputStream.extractBitSequence(effectiveBitDepth);
                    currentPixelByteIdx++;
                    pixelDataArray[currentPixelByteIdx] = (pixelDataArray[currentPixelByteIdx] & upperBitsMask) | bitOutputStream.extractBitSequence(effectiveBitDepth);
                    currentPixelByteIdx++;
                    pixelDataArray[currentPixelByteIdx] = (pixelDataArray[currentPixelByteIdx] & upperBitsMask) | bitOutputStream.extractBitSequence(effectiveBitDepth);
                    currentPixelByteIdx++;
                    currentPixelByteIdx++; // Skip alpha channel
                } else {
                    currentPixelByteIdx += 4; // Skip transparent pixel
                }
            }
        }

        canvasContext.putImageData(imageData, 0, 0); // Apply the modified pixel data back to the canvas.
        return outputCanvas;
    },

    // Calculates the maximum number of bits that can be embedded into a given image.
    // This considers only opaque pixels and the specified `componentBitDepth`.
    determineImageStorageCapacity: function(targetImageElement, componentBitDepth = 8) {
        if (!targetImageElement || !(targetImageElement instanceof HTMLImageElement)) {
            console.error("PixelVault: Invalid target image element for capacity calculation.");
            return 0;
        }

        const effectiveBitDepth = Math.max(1, Math.min(8, Math.floor(componentBitDepth)));

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = targetImageElement.naturalWidth || targetImageElement.width;
        tempCanvas.height = targetImageElement.naturalHeight || targetImageElement.height;
        tempCtx.drawImage(targetImageElement, 0, 0);

        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixelBytes = imgData.data;
        const totalPixelByteCount = pixelBytes.length;

        let currentPixelByteIdx = 0;
        let availableBitsCount = 0;
        const bitsPerOpaquePixel = effectiveBitDepth * 3; // R, G, B channels

        while (currentPixelByteIdx < totalPixelByteCount) {
            // Only pixels with full opacity (alpha = 255) are considered usable for data storage.
            if (pixelBytes[currentPixelByteIdx + 3] === 0xFF) {
                availableBitsCount += bitsPerOpaquePixel;
            }
            currentPixelByteIdx += 4; // Move to the next pixel (RGBA format).
        }
        return availableBitsCount;
    },

    // Encodes a standard JavaScript string into a `Uint8Array` using UTF-8 encoding rules.
    encodeStringToUtf8: function(inputString) {
        if (typeof inputString !== 'string') {
            console.warn("PixelVault: Input for UTF-8 encoding is not a string. Returning empty Uint8Array.");
            return new Uint8Array(0);
        }
        const utf8Bytes = [];
        for (let i = 0; i < inputString.length; i++) {
            let charCode = inputString.charCodeAt(i);
            if (charCode < 0x80) { // 1-byte sequence (0xxxxxxx)
                utf8Bytes.push(charCode);
            } else if (charCode < 0x800) { // 2-byte sequence (110xxxxx 10xxxxxx)
                utf8Bytes.push((charCode >> 6) | 0xC0);
                utf8Bytes.push((charCode & 0x3F) | 0x80);
            } else if (charCode < 0xD800 || charCode >= 0xE000) { // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
                // Excludes surrogate pairs, which are handled separately for 4-byte sequences.
                utf8Bytes.push((charCode >> 12) | 0xE0);
                utf8Bytes.push(((charCode >> 6) & 0x3F) | 0x80);
                utf8Bytes.push((charCode & 0x3F) | 0x80);
            } else { // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx) - surrogate pairs
                // Handle UTF-16 surrogate pairs to correctly form 4-byte UTF-8 sequences for astral plane characters.
                // This assumes a valid surrogate pair (high then low) is encountered.
                if (i + 1 < inputString.length) {
                    const nextCharCode = inputString.charCodeAt(i + 1);
                    if (charCode >= 0xD800 && charCode <= 0xDBFF && // High surrogate
                        nextCharCode >= 0xDC00 && nextCharCode <= 0xDFFF) { // Low surrogate
                        const codePoint = 0x10000 + ((charCode & 0x3FF) << 10) + (nextCharCode & 0x3FF);
                        utf8Bytes.push((codePoint >> 18) | 0xF0);
                        utf8Bytes.push(((codePoint >> 12) & 0x3F) | 0x80);
                        utf8Bytes.push(((codePoint >> 6) & 0x3F) | 0x80);
                        utf8Bytes.push((codePoint & 0x3F) | 0x80);
                        i++; // Consume the low surrogate as well
                    } else {
                        // Malformed surrogate, push replacement character (or handle as 3-byte sequence if not a pair)
                        utf8Bytes.push(0xEF, 0xBF, 0xBD); // U+FFFD Replacement Character
                    }
                } else {
                    // Incomplete surrogate pair at end of string
                    utf8Bytes.push(0xEF, 0xBF, 0xBD);
                }
            }
        }
        return new Uint8Array(utf8Bytes);
    },

    // Decodes a `Uint8Array` (assumed to be UTF-8 encoded) back into a JavaScript string.
    // Includes basic error handling for malformed UTF-8 sequences by inserting U+FFFD.
    decodeUtf8ToText: function(utf8ByteArray) {
        if (!(utf8ByteArray instanceof Uint8Array)) {
            console.warn("PixelVault: Input for UTF-8 decoding is not a Uint8Array. Returning empty string.");
            return "";
        }
        let decodedString = "";
        let byteIdx = 0;
        const arrayLength = utf8ByteArray.byteLength;

        while (byteIdx < arrayLength) {
            let byte1 = utf8ByteArray[byteIdx++];
            if (byte1 < 0x80) { // 1-byte sequence (0xxxxxxx)
                decodedString += String.fromCharCode(byte1);
            } else if ((byte1 & 0xE0) === 0xC0) { // 2-byte sequence (110xxxxx 10xxxxxx)
                if (byteIdx < arrayLength) {
                    let byte2 = utf8ByteArray[byteIdx++];
                    if ((byte2 & 0xC0) === 0x80) {
                        decodedString += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
                    } else { // Malformed: byte2 is not a continuation byte
                        decodedString += String.fromCharCode(0xFFFD); // U+FFFD Replacement Character
                        byteIdx--; // Re-process byte2 as a new start
                    }
                } else { // Incomplete 2-byte sequence
                    decodedString += String.fromCharCode(0xFFFD);
                }
            } else if ((byte1 & 0xF0) === 0xE0) { // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
                if (byteIdx + 1 < arrayLength) {
                    let byte2 = utf8ByteArray[byteIdx++];
                    let byte3 = utf8ByteArray[byteIdx++];
                    if (((byte2 & 0xC0) === 0x80) && ((byte3 & 0xC0) === 0x80)) {
                        decodedString += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
                    } else { // Malformed: byte2 or byte3 is not a continuation byte
                        decodedString += String.fromCharCode(0xFFFD);
                        if ((byte2 & 0xC0) === 0x80) byteIdx--; // Only skip byte2 if it was valid
                    }
                } else { // Incomplete 3-byte sequence
                    decodedString += String.fromCharCode(0xFFFD);
                }
            } else if ((byte1 & 0xF8) === 0xF0) { // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
                if (byteIdx + 2 < arrayLength) {
                    let byte2 = utf8ByteArray[byteIdx++];
                    let byte3 = utf8ByteArray[byteIdx++];
                    let byte4 = utf8ByteArray[byteIdx++];
                    if (((byte2 & 0xC0) === 0x80) && ((byte3 & 0xC0) === 0x80) && ((byte4 & 0xC0) === 0x80)) {
                        let codePoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
                        if (codePoint >= 0x10000) { // Convert to surrogate pair for JavaScript (UTF-16)
                            codePoint -= 0x10000;
                            decodedString += String.fromCharCode(0xD800 + (codePoint >> 10)); // High surrogate
                            decodedString += String.fromCharCode(0xDC00 + (codePoint & 0x3FF)); // Low surrogate
                        } else {
                            decodedString += String.fromCharCode(codePoint);
                        }
                    } else { // Malformed: one or more continuation bytes invalid
                        decodedString += String.fromCharCode(0xFFFD);
                        // Backtrack partially to try to re-parse.
                        if ((byte4 & 0xC0) !== 0x80) byteIdx--;
                        if ((byte3 & 0xC0) !== 0x80) byteIdx--;
                        if ((byte2 & 0xC0) !== 0x80) byteIdx--;
                    }
                } else { // Incomplete 4-byte sequence
                    decodedString += String.fromCharCode(0xFFFD);
                }
            } else { // Invalid UTF-8 start byte
                decodedString += String.fromCharCode(0xFFFD);
            }
        }
        return decodedString;
    }
};

// --- Bit Stream Management Utility ---
// `BitAccessor` provides methods to read and write arbitrary bit lengths
// into and out of a `Uint8Array`, managing byte and bit offsets internally.
window.BitAccessor = function(dataBuffer) {
    if (!(dataBuffer instanceof Uint8Array)) {
        throw new Error("BitAccessor: Constructor requires a Uint8Array as its underlying buffer.");
    }
    this.underlyingBuffer = dataBuffer;
    this.currentBytePosition = 0; // Index of the byte that *would be* the next full byte to process.
                                   // If `remainingBitsInCurrentByte > 0`, the actual byte being modified is `currentBytePosition - 1`.
    this.remainingBitsInCurrentByte = 0; // Number of bits *available* in the byte at `currentBytePosition - 1`.
                                        // 0 if `currentBytePosition` points to a fresh byte.
};

window.BitAccessor.prototype = {

    // Appends a sequence of `count` bits from `dataValue` into the stream.
    insertBitSequence: function(count, dataValue) {
        if (count === 0) { return; }
        if (count < 0 || count > 32) {
            console.warn(`BitAccessor: Attempted to write an invalid number of bits (${count}).`);
            return;
        }

        // Mask `dataValue` to isolate only the relevant `count` least significant bits.
        const relevantValue = dataValue & ((1 << count) - 1);

        let bitsProcessedInThisStep;

        if (this.remainingBitsInCurrentByte > 0) {
            // We are continuing to fill a partially written byte (at `currentBytePosition - 1`).
            const byteIndexToModify = this.currentBytePosition - 1;

            if (this.remainingBitsInCurrentByte >= count) {
                // The entire `dataValue` fits within the remaining bits of the current byte.
                this.underlyingBuffer[byteIndexToModify] |= relevantValue << (this.remainingBitsInCurrentByte - count);
                bitsProcessedInThisStep = count;
                this.remainingBitsInCurrentByte -= count;
            } else {
                // `dataValue` overflows the current byte. Fill the current byte first.
                this.underlyingBuffer[byteIndexToModify] |= relevantValue >> (count - this.remainingBitsInCurrentByte);
                bitsProcessedInThisStep = this.remainingBitsInCurrentByte;
                this.remainingBitsInCurrentByte = 0; // The current byte is now completely full.
            }
        } else {
            // Start writing into a new, fresh byte (at `currentBytePosition`).
            bitsProcessedInThisStep = Math.min(8, count);
            this.remainingBitsInCurrentByte = 8 - bitsProcessedInThisStep;
            // Shift the relevant portion of `dataValue` and place it in the new byte.
            this.underlyingBuffer[this.currentBytePosition++] =
                (relevantValue >> (count - bitsProcessedInThisStep)) << this.remainingBitsInCurrentByte;
        }

        const remainingBitsToInsert = count - bitsProcessedInThisStep;
        if (remainingBitsToInsert > 0) {
            // Recursively call to write any remaining bits.
            this.insertBitSequence(remainingBitsToInsert, relevantValue);
        }
    },

    // Extracts `count` bits from the stream and returns them.
    // `accumulatedValue` is used for recursive calls to build the final result.
    extractBitSequence: function(count, accumulatedValue = 0) {
        if (count === 0) { return accumulatedValue; }
        if (count < 0 || count > 32) {
            console.warn(`BitAccessor: Attempted to read an invalid number of bits (${count}).`);
            return 0;
        }

        let partialExtractedBits;
        let bitsProcessedInThisStep;

        if (this.remainingBitsInCurrentByte > 0) {
            // We are reading from a partially read byte (at `currentBytePosition - 1`).
            const currentByteValue = this.underlyingBuffer[this.currentBytePosition - 1];
            bitsProcessedInThisStep = Math.min(this.remainingBitsInCurrentByte, count);
            this.remainingBitsInCurrentByte -= bitsProcessedInThisStep;
            // Extract bits from the current byte.
            partialExtractedBits = (currentByteValue >> this.remainingBitsInCurrentByte) & ((1 << bitsProcessedInThisStep) - 1);
        } else {
            // Start reading from a new byte (at `currentBytePosition`).
            if (this.currentBytePosition >= this.underlyingBuffer.length) {
                console.warn("BitAccessor: Reached end of buffer during read operation. Returning partial value.");
                return accumulatedValue;
            }
            bitsProcessedInThisStep = Math.min(8, count);
            this.remainingBitsInCurrentByte = 8 - bitsProcessedInThisStep;
            // Extract bits from the new byte.
            partialExtractedBits = (this.underlyingBuffer[this.currentBytePosition++] >> this.remainingBitsInCurrentByte) & ((1 << bitsProcessedInThisStep) - 1);
        }

        // Accumulate the extracted bits into the result.
        accumulatedValue = (accumulatedValue << bitsProcessedInThisStep) | partialExtractedBits;

        const remainingBitsToExtract = count - bitsProcessedInThisStep;
        return (remainingBitsToExtract > 0) ? this.extractBitSequence(remainingBitsToExtract, accumulatedValue) : accumulatedValue;
    },

    // Checks if the stream has reached or passed the end of its underlying buffer.
    isEndOfStream: function() {
        return this.currentBytePosition >= this.underlyingBuffer.length && this.remainingBitsInCurrentByte === 0;
    },

    // Sets the stream's read/write position to a specific absolute bit offset from the start of the buffer.
    navigateBitstream: function(absoluteBitPosition) {
        if (absoluteBitPosition < 0) {
            console.warn("BitAccessor: Negative bit position provided. Clamping to 0.");
            absoluteBitPosition = 0;
        }
        const maxBufferBits = this.underlyingBuffer.length * 8;
        if (absoluteBitPosition > maxBufferBits) {
            console.warn(`BitAccessor: Requested bit position (${absoluteBitPosition}) exceeds buffer capacity (${maxBufferBits}). Clamping.`);
            absoluteBitPosition = maxBufferBits;
        }

        this.currentBytePosition = Math.floor(absoluteBitPosition / 8);
        const bitsAlreadyUsedInByte = absoluteBitPosition % 8;

        if (bitsAlreadyUsedInByte > 0) {
            // If the target position is within a byte, set remaining bits and advance `currentBytePosition`
            // so that `currentBytePosition - 1` points to the partially used byte.
            this.remainingBitsInCurrentByte = 8 - bitsAlreadyUsedInByte;
            this.currentBytePosition++;
        } else {
            // If the target position is exactly at a byte boundary, the current byte is full,
            // and `currentBytePosition` is already correctly pointing to the next fresh byte.
            this.remainingBitsInCurrentByte = 0;
        }
    }
};