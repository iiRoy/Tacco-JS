// This section handles integer conversions and checksum calculations.

// Extend the Number prototype to include an unsigned integer conversion.
Number.prototype.toUnsignedInteger = function() {
    // If the number is negative, add 2^32 to convert it to its unsigned equivalent.
    return this < 0 ? this + 4294967296 : this;
};

// Extend the Number prototype to represent the number as an array of 4 bytes (big-endian).
Number.prototype.asFourBytesBE = function() {
    return [(this >>> 24) & 0xff, (this >>> 16) & 0xff, (this >>> 8) & 0xff, this & 0xff];
};

// Extend the Number prototype to represent the number as an array of 2 bytes (little-endian, word-swapped).
Number.prototype.asTwoBytesLE = function() {
    return [this & 0xff, (this >>> 8) & 0xff];
};

// Extend the Array prototype to compute the Adler-32 checksum.
Array.prototype.calculateAdlerChecksum = function(beginIndex, segmentLength) {
    // Determine the start index and length if not provided.
    switch (arguments.length) {
        case 0:
            beginIndex = 0;
        case 1:
            segmentLength = this.length - beginIndex;
    }

    var sumA = 1,
        sumB = 0; // Initialize Adler-32 sums

    // Iterate through the array segment to calculate the checksum.
    for (var currentIdx = 0; currentIdx < segmentLength; currentIdx++) {
        sumA = (sumA + this[beginIndex + currentIdx]) % 65521;
        sumB = (sumB + sumA) % 65521;
    }

    // Combine sums into a 32-bit unsigned integer.
    return ((sumB << 16) | sumA).toUnsignedInteger();
};

// Extend the Array prototype to compute the CRC-32 checksum.
Array.prototype.determineCrcChecksum = function(startPosition, blockLength) {
    // Set default values for start and length if not supplied.
    switch (arguments.length) {
        case 0:
            startPosition = 0;
        case 1:
            blockLength = this.length - startPosition;
    }

    // Retrieve or generate the CRC lookup table.
    var crcTable = arguments.callee.crc32Lookup;
    if (!crcTable) {
        crcTable = [];
        var byteValue;
        for (var idxN = 0; idxN < 256; idxN++) {
            byteValue = idxN;
            for (var bitK = 0; bitK < 8; bitK++) {
                // Apply CRC-32 polynomial (0xEDB88320)
                byteValue = byteValue & 1 ? 0xEDB88320 ^ (byteValue >>> 1) : byteValue >>> 1;
            }
            crcTable[idxN] = byteValue.toUnsignedInteger();
        }
        arguments.callee.crc32Lookup = crcTable; // Store table for future use
    }

    var currentCrc = 0xffffffff; // Initial CRC value
    // Process each byte in the specified array segment.
    for (var dataIndex = 0; dataIndex < blockLength; dataIndex++) {
        currentCrc = crcTable[(currentCrc ^ this[startPosition + dataIndex]) & 0xff] ^ (currentCrc >>> 8);
    }

    // Final XOR with 0xFFFFFFFF and convert to unsigned.
    return (currentCrc ^ 0xffffffff).toUnsignedInteger();
};

// Extend the String prototype to convert a hexadecimal string into an array of bytes.
String.prototype.toHexByteList = function() {
    var outputArray = [];
    // If the string length is odd, append a '0' to make it even for parsing pairs.
    if (this.length % 2 === 1) {
        // Note: Modifying 'this' directly might be unexpected, but matches original logic.
        this[this.length] = "0";
    }
    // Parse two characters at a time as a hex byte.
    for (var charIndex = 0; charIndex < this.length; charIndex += 2) {
        outputArray.push(parseInt(this[charIndex] + this[charIndex + 1], 16) & 0xff);
    }
    return outputArray;
};

// --- Image Generator Class Definition ---

// Constructor for the ImageGenerator (PNG-like) object.
var ImageGenerator = function(inputConfig) {
    this.configuration = {};
    // Apply default settings first, then override with provided options.
    assignProperties(this.configuration, ImageGenerator.baseConfig);
    assignProperties(this.configuration, inputConfig);
    // Initialize core properties of the image object.
    assignProperties(this, {
        pixelData: null, // Raw pixel data stream
        auxiliaryBlocks: null, // Metadata chunks like PLTE, tRNS
        pixelWidth: 5, // Default image width
        pixelHeight: 5 // Default image height
    });
};

// Static properties and methods for the ImageGenerator class.
assignProperties(ImageGenerator, {
    baseConfig: {
        colorBitDepth: 0x08, // 8 bits per channel
        pixelColorType: 0x03, // 3 = Indexed color, 6 = Truecolor with alpha
        compressionMethod: 0x00, // Deflate/inflate
        scanlineFilterMethod: 0x00, // 0 = No filtering
        interlacingMethod: 0x00 // No interlacing
    }
});

// Prototype methods for ImageGenerator instances.
assignProperties(ImageGenerator.prototype, {
    // Handles raw data, either setting it or retrieving it based on arguments.
    processRawData: function() {
        if (arguments.length) {
            this.updateRawData.apply(this, arguments);
        } else {
            this.fetchRawData.apply(this, arguments);
        }
    },

    // Retrieves the raw data as a hexadecimal string.
    fetchRawData: function() {
        return this.generateByteSequence()
            .map(function(byteValue) {
                byteValue = byteValue || 0; // Ensure byteValue is not null/undefined
                // Format byte as two-digit hex string
                return (byteValue < 15 ? "0" + byteValue.toString(16) : byteValue.toString(16));
            })
            .join('');
    },

    // Generates the complete byte stream for the image file.
    generateByteSequence: function() {
        var currentInstance = this,
            imageConfig = currentInstance.configuration;

        // --- Start of PNG signature and IHDR chunk ---
        var outputBytes = [
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG file signature (BOF)
            0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52 // IHDR chunk length (13 bytes), 'IHDR' type
        ];
        // Append image dimensions
        outputBytes = outputBytes.concat((+currentInstance.pixelWidth).asFourBytesBE(), (+currentInstance.pixelHeight).asFourBytesBE());
        // Append IHDR configuration options
        outputBytes = outputBytes.concat(
            imageConfig.colorBitDepth,
            imageConfig.pixelColorType,
            imageConfig.compressionMethod,
            imageConfig.scanlineFilterMethod,
            imageConfig.interlacingMethod
        );
        // Append IHDR chunk CRC
        outputBytes = outputBytes.concat(outputBytes.determineCrcChecksum(12, 17).asFourBytesBE());

        // --- PLTE chunk (Palette) ---
        if (imageConfig.pixelColorType === 0x03) { // Only for indexed color images
            var paletteBytes = currentInstance.auxiliaryBlocks.PLTE.toHexByteList();
            outputBytes = outputBytes.concat(paletteBytes.length.asFourBytesBE()); // PLTE chunk length
            var checksumBegin = outputBytes.length;
            outputBytes = outputBytes.concat(0x50, 0x4c, 0x54, 0x45); // 'PLTE' chunk type
            outputBytes = outputBytes.concat(paletteBytes); // Palette data
            outputBytes = outputBytes.concat(outputBytes.determineCrcChecksum(checksumBegin, paletteBytes.length + 4).asFourBytesBE()); // PLTE chunk CRC
        }

        // --- tRNS chunk (Transparency) ---
        if (imageConfig.pixelColorType === 0x03) { // Only for indexed color images
            var transparencyBytes = currentInstance.auxiliaryBlocks.tRNS.toHexByteList();
            outputBytes = outputBytes.concat(transparencyBytes.length.asFourBytesBE()); // tRNS chunk length
            var crcCalculationStart = outputBytes.length;
            outputBytes = outputBytes.concat(0x74, 0x52, 0x4e, 0x53); // 'tRNS' chunk type
            outputBytes = outputBytes.concat(transparencyBytes); // Transparency data
            outputBytes = outputBytes.concat(outputBytes.determineCrcChecksum(crcCalculationStart, transparencyBytes.length + 4).asFourBytesBE()); // tRNS chunk CRC
        }
        // No else block needed as per original for IDAT stream.

        // --- IDAT chunk (Image Data) ---
        var pixelStream = currentInstance.pixelData.toHexByteList();
        var widthDimension = currentInstance.pixelWidth,
            heightDimension = currentInstance.pixelHeight,
            bytesPerPixel = (imageConfig.pixelColorType === 0x03 ? 1 : 4); // Bytes per pixel (e.g., 1 for indexed, 4 for RGBA)

        // Calculate total length of compressed pixel data including filter bytes.
        var totalPayloadLength = heightDimension * (widthDimension * bytesPerPixel + 1); // +1 for filter type byte

        // Insert filter type (0x00 for 'None') at the beginning of each scanline.
        for (var rowCounter = 0; rowCounter < heightDimension; rowCounter++) {
            pixelStream.splice(rowCounter * (widthDimension * bytesPerPixel + 1), 0, 0x00);
        }

        // Determine the number of ZLIB data blocks.
        var dataBlocksCount = Math.ceil(totalPayloadLength / 32768); // 32768 is max block size for uncompressed ZLIB

        // Append IDAT chunk length (sum of data length, block headers, ZLIB header, and Adler-32 checksum).
        outputBytes = outputBytes.concat((totalPayloadLength + 5 * dataBlocksCount + 6).asFourBytesBE());
        var idatCrcStart = outputBytes.length;
        outputBytes = outputBytes.concat(0x49, 0x44, 0x41, 0x54); // 'IDAT' chunk type

        // Calculate CRC length for IDAT chunk.
        var crcTotalLength = (totalPayloadLength + 5 * dataBlocksCount + 6 + 4); // Data length + ZLIB structure + 'IDAT' type length

        // --- ZLIB compression header ---
        // http://www.w3.org/TR/2003/REC-PNG-20031110/#10CompressionCM0
        // http://tools.ietf.org/html/rfc1950#page-4
        outputBytes = outputBytes.concat(0x78, 0x01); // ZLIB header: CM=8 (deflate), CINFO=7 (32KB window), FLEVEL=01 (fastest), FDICT=0 (no dict), FCHECK (checksum)

        // --- ZLIB uncompressed data blocks ---
        for (var blockIndex = 0; blockIndex < dataBlocksCount; blockIndex++) {
            var currentBlockSize = Math.min(32768, totalPayloadLength - (blockIndex * 32768)); // Size of the current block
            outputBytes.push(blockIndex === (dataBlocksCount - 1) ? 0x01 : 0x00); // BFINAL flag (1 for last block, 0 otherwise)
            outputBytes = outputBytes.concat(currentBlockSize.asTwoBytesLE()); // BLEN (block length)
            outputBytes = outputBytes.concat((~currentBlockSize).asTwoBytesLE()); // NLEN (one's complement of BLEN)
            var blockContent = pixelStream.slice(blockIndex * 32768, blockIndex * 32768 + currentBlockSize); // Extract data for this block
            outputBytes = outputBytes.concat(blockContent); // Append raw block data
        }

        // --- ZLIB Adler-32 checksum for the entire uncompressed data ---
        outputBytes = outputBytes.concat(pixelStream.calculateAdlerChecksum().asFourBytesBE());
        // --- IDAT chunk CRC ---
        outputBytes = outputBytes.concat(outputBytes.determineCrcChecksum(idatCrcStart, crcTotalLength).asFourBytesBE());

        // --- IEND chunk (Image End) ---
        outputBytes = outputBytes.concat(0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44); // IEND chunk length (0), 'IEND' type
        outputBytes = outputBytes.concat(outputBytes.determineCrcChecksum(outputBytes.length - 4, 4).asFourBytesBE()); // IEND chunk CRC

        return outputBytes;
    },

    // Updates image properties with new settings.
    updateSettings: function(newConfiguration) {
        assignProperties(this, newConfiguration);
    },

    // Generates a Data URL string for the image.
    exportToDataURI: function() {
        var currentObject = this;
        // Convert the byte stream to a binary string, then base64 encode it.
        var imageDataURI = "data:image/png;base64," + base64EncodeString(
            currentObject.generateByteSequence()
            .map(function(byteVal) {
                return String.fromCharCode(byteVal);
            }).join('')
        );
        return imageDataURI;
    }
});

// --- Utility Functions ---

// Helper function to copy properties from source object to target object.
function assignProperties(targetObj, sourceObj) {
    for (var propertyKey in sourceObj) {
        targetObj[propertyKey] = sourceObj[propertyKey];
    }
    return targetObj;
}

// Ensure ImageGenerator is available in the global scope.
var globalScope = (1, eval)('this'); // Get a reference to the global object
globalScope.ImageGenerator = ImageGenerator;

var originalBase64Encoder = globalScope.btoa; // Store original btoa if it exists

// Override global btoa to handle Node.js Buffer or browser btoa.
globalScope.base64EncodeString = function(textInput) {
    if (originalBase64Encoder) {
        return originalBase64Encoder(textInput);
    } else {
        // Fallback for environments without native btoa (e.g., Node.js)
        return new Buffer(textInput, 'binary').toString('base64');
    }
};