// This file contains utilities and a class for generating Portable Network Graphics (PNG) image data streams.
// Note: This implementation prioritizes clarity and functional equivalence over absolute performance optimization
// for very large image files, particularly where array manipulations might be involved.

// --- Core Number Prototype Extensions for Byte Manipulation ---

// Ensures a number is treated as an unsigned 32-bit integer.
// This handles negative numbers by wrapping them around the 32-bit range.
Number.prototype.normalizeUnsigned = function() {
    return this >>> 0; // The zero-fill right shift operator effectively converts to unsigned 32-bit.
};

// Converts a number into a four-byte array in big-endian format.
// For example, the number 0x12345678 will be represented as [0x12, 0x34, 0x56, 0x78].
Number.prototype.toFourBytes = function() {
    const valueAsUnsigned = this.normalizeUnsigned();
    return [
        (valueAsUnsigned >>> 24) & 0xFF, // Most significant byte
        (valueAsUnsigned >>> 16) & 0xFF,
        (valueAsUnsigned >>> 8) & 0xFF,
        valueAsUnsigned & 0xFF          // Least significant byte
    ];
};

// Converts a number into a two-byte array in little-endian format.
// For example, the number 0x1234 will be represented as [0x34, 0x12].
Number.prototype.toTwoBytesLittleEndian = function() {
    const valueAsUnsigned = this.normalizeUnsigned();
    return [
        valueAsUnsigned & 0xFF,          // Least significant byte
        (valueAsUnsigned >>> 8) & 0xFF   // Most significant byte
    ];
};

// --- Module-scoped Cache for CRC-32 Lookup Table ---
// This table is computationally expensive to generate and is used repeatedly,
// so it's initialized only once when needed.
let _cachedCrcLookupTable = null;

// --- Core Array Prototype Extensions for Checksum Calculation ---

// Extends Array.prototype to compute the Adler-32 checksum.
// Adler-32 is a fast checksum algorithm, primarily used within Zlib streams.
// Parameters:
//   startIndex: The starting index in the array for checksum calculation. Defaults to 0.
//   countLength: The number of elements from the startIndex to include. Defaults to remaining length.
Array.prototype.computeAdlerChecksum = function(startIndex, countLength) {
    // Apply default values if parameters are not provided.
    if (arguments.length === 0) {
        startIndex = 0;
    }
    if (arguments.length <= 1) {
        countLength = this.length - startIndex;
    }

    // Robust input validation for array bounds and positive length.
    if (countLength <= 0 || startIndex < 0 || startIndex >= this.length) {
        // For invalid ranges, return a default checksum (0) or throw an error.
        // Returning 0 is often acceptable for empty data streams in checksum contexts.
        return 0;
    }
    // Adjust length if it goes beyond the array's boundaries.
    if (startIndex + countLength > this.length) {
        countLength = this.length - startIndex;
    }

    let sumA = 1; // Initial value for the first sum component.
    let sumB = 0; // Initial value for the second sum component.
    const ADLER_MODULUS = 65521; // The prime modulus used in Adler-32 calculation.

    // Iterate through the specified segment of the array.
    for (let currentElementIndex = 0; currentElementIndex < countLength; currentElementIndex++) {
        const byteValue = this[startIndex + currentElementIndex];
        sumA = (sumA + byteValue) % ADLER_MODULUS;
        sumB = (sumB + sumA) % ADLER_MODULUS;
    }

    // Combine the two sums into a single 32-bit checksum and normalize to unsigned.
    // sumB forms the higher 16 bits, sumA forms the lower 16 bits.
    return ((sumB << 16) | sumA).normalizeUnsigned();
};

// Extends Array.prototype to compute the CRC-32 checksum (using the IEEE 802.3 polynomial).
// This checksum provides stronger error detection and is used for integrity checks of PNG chunks.
// Parameters:
//   startIndex: The starting index in the array for checksum calculation. Defaults to 0.
//   countLength: The number of elements from the startIndex to include. Defaults to remaining length.
Array.prototype.calculateCrcChecksum = function(startIndex, countLength) {
    // Set default values for parameters.
    if (arguments.length === 0) {
        startIndex = 0;
    }
    if (arguments.length <= 1) {
        countLength = this.length - startIndex;
    }

    // Validate input range.
    if (countLength <= 0 || startIndex < 0 || startIndex >= this.length) {
        return 0; // Return 0 for invalid or empty data ranges.
    }
    if (startIndex + countLength > this.length) {
        countLength = this.length - startIndex; // Trim length if it exceeds array bounds.
    }

    // Lazy initialization of the CRC-32 lookup table.
    // This expensive table is computed only once upon its first use.
    if (!_cachedCrcLookupTable) {
        _cachedCrcLookupTable = [];
        const CRC_POLYNOMIAL = 0xEDB88320; // The reversed polynomial for IEEE 802.3 CRC-32.

        for (let tableIndex = 0; tableIndex < 256; tableIndex++) {
            let currentCrcAccumulator = tableIndex;
            for (let bitPosition = 0; bitPosition < 8; bitPosition++) {
                // If the LSB is 1, XOR with the polynomial. Otherwise, just shift.
                currentCrcAccumulator = (currentCrcAccumulator & 1) ?
                    (CRC_POLYNOMIAL ^ (currentCrcAccumulator >>> 1)) :
                    (currentCrcAccumulator >>> 1);
            }
            _cachedCrcLookupTable[tableIndex] = currentCrcAccumulator.normalizeUnsigned();
        }
    }

    let currentCrcValue = 0xFFFFFFFF; // Initial CRC value (all bits set to 1).

    // Process each byte in the specified segment of the array.
    for (let i = 0; i < countLength; i++) {
        const byteValue = this[startIndex + i];
        // XOR the current byte with the lower 8 bits of the current CRC,
        // use the result as an index into the lookup table,
        // then XOR with the higher bits of the current CRC.
        currentCrcValue = _cachedCrcLookupTable[(currentCrcValue ^ byteValue) & 0xFF] ^ (currentCrcValue >>> 8);
    }

    // Final XOR with 0xFFFFFFFF and ensure it's an unsigned 32-bit integer.
    return (currentCrcValue ^ 0xFFFFFFFF).normalizeUnsigned();
};

// --- Core String Prototype Extension for Hexadecimal to Byte Conversion ---

// Converts a hexadecimal string (e.g., "FF0A") into an array of byte values (e.g., [255, 10]).
// It handles odd-length strings by padding with a '0'.
String.prototype.hexStringToByteList = function() {
    const byteOutputArray = [];
    let sourceHexString = this.valueOf(); // Get the primitive string value.

    // Ensure the hexadecimal string has an even length by padding with '0' if needed.
    // Strings are immutable, so we work with a new variable.
    if (sourceHexString.length % 2 !== 0) {
        sourceHexString += '0';
    }

    // Iterate through the string, processing two characters (one byte) at a time.
    for (let i = 0; i < sourceHexString.length; i += 2) {
        const hexPair = sourceHexString.substring(i, i + 2);
        const byteValue = parseInt(hexPair, 16);

        // Basic validation: ensure the parsed value is a valid byte.
        if (isNaN(byteValue) || byteValue < 0 || byteValue > 255) {
            console.warn(`Encountered invalid hex byte sequence '${hexPair}'. Defaulting to 0.`);
            byteOutputArray.push(0);
        } else {
            byteOutputArray.push(byteValue & 0xFF); // Ensure value is within byte range.
        }
    }
    return byteOutputArray;
};

// --- Utility Function for Object Property Assignment ---

// A simple helper to copy properties from a source object to a target object.
// Similar to `Object.assign()`, but with explicit iteration for broader compatibility.
function assignProperties(targetObject, sourceObject) {
    // Basic type validation for robustness.
    if (targetObject === null || typeof targetObject !== 'object') {
        console.error("Invalid target object provided for property assignment.");
        return targetObject;
    }
    if (sourceObject === null || typeof sourceObject !== 'object') {
        // If source is invalid, simply return the target unchanged.
        return targetObject;
    }

    // Iterate over enumerable properties of the source object.
    for (const propertyKey in sourceObject) {
        // Ensure the property belongs directly to the source object, not its prototype chain.
        if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
            targetObject[propertyKey] = sourceObject[propertyKey];
        }
    }
    return targetObject;
}

// --- PortableNetworkGraphic (PNG) Image Encoder Class ---

// Constructor for the PortableNetworkGraphic class.
// Initializes an encoder instance with default settings, which can be overridden by provided options.
const PortableNetworkGraphic = function(initialConfiguration) {
    // Initialize instance settings by first applying standard defaults.
    this.settings = {};
    assignProperties(this.settings, PortableNetworkGraphic.standardSettings);

    // Override defaults with any user-supplied configuration.
    if (initialConfiguration && typeof initialConfiguration === 'object') {
        assignProperties(this.settings, initialConfiguration);
    }

    // Define core internal data structures and properties for the image.
    assignProperties(this, {
        pixelDataBuffer: null,   // Stores the raw pixel data (e.g., as a byte array).
        metadataSegments: {},    // A container for optional PNG chunks like PLTE, tRNS.
        imageWidth: 0,          // The width of the image in pixels.
        imageHeight: 0          // The height of the image in pixels.
    });

    // Apply width and height from settings, with validation.
    this.imageWidth = Number(this.settings.width) || 0;
    this.imageHeight = Number(this.settings.height) || 0;

    // Ensure image dimensions are positive. Default to 1x1 if invalid.
    if (this.imageWidth <= 0 || this.imageHeight <= 0) {
        console.warn("Image dimensions must be positive integers. Defaulting to 1x1 pixels.");
        this.imageWidth = 1;
        this.imageHeight = 1;
    }
};

// --- Static Properties and Default Settings for PortableNetworkGraphic ---

// Defines standard settings and common PNG chunk type constants.
assignProperties(PortableNetworkGraphic, {
    standardSettings: {
        width: 1,                 // Default width in pixels.
        height: 1,                // Default height in pixels.
        colorBitDepth: 0x08,      // Common bit depth: 8 bits per sample (e.g., R, G, B, A).
        colorRepresentationType: 0x03, // Color type: 3 (Indexed color), 6 (Truecolor with alpha).
        compressionStrategy: 0x00, // Compression method: 0 (Zlib deflate).
        filteringTechnique: 0x00,  // Filter method: 0 (No filtering).
        interlacingScheme: 0x00    // Interlace method: 0 (No interlacing).
    },
    // Constants for standard PNG chunk types for improved readability.
    CHUNK_TYPE_IHDR: [0x49, 0x48, 0x44, 0x52], // "IHDR" - Image Header
    CHUNK_TYPE_PLTE: [0x50, 0x4C, 0x54, 0x45], // "PLTE" - Palette
    CHUNK_TYPE_tRNS: [0x74, 0x52, 0x4E, 0x53], // "tRNS" - Transparency
    CHUNK_TYPE_IDAT: [0x49, 0x44, 0x41, 0x54], // "IDAT" - Image Data
    CHUNK_TYPE_IEND: [0x49, 0x45, 0x4E, 0x44]  // "IEND" - Image End
});

// --- Prototype Methods for PortableNetworkGraphic Instances ---

assignProperties(PortableNetworkGraphic.prototype, {

    // A polymorphic method to either set or retrieve raw image data.
    // If arguments are provided, it acts as a setter; otherwise, it's a getter.
    processRawData: function() {
        if (arguments.length > 0) {
            // If arguments are supplied, attempt to set the raw data.
            this.setRawData.apply(this, arguments);
        } else {
            // Otherwise, retrieve and return the raw data.
            return this.getRawData.apply(this, arguments);
        }
    },

    // Retrieves the raw image data as a hexadecimal string representation of the byte stream.
    getRawData: function() {
        const generatedByteSequence = this.generateByteStream();
        if (!generatedByteSequence || generatedByteSequence.length === 0) {
            console.warn("No byte stream could be generated. Returning an empty hexadecimal string.");
            return "";
        }
        // Map each byte to its two-character hexadecimal representation.
        return generatedByteSequence.map(function(byteValue) {
            // Ensure byteValue is a valid number between 0 and 255.
            const validatedByte = (Number(byteValue) || 0) & 0xFF;
            return (validatedByte < 16 ? "0" : "") + validatedByte.toString(16);
        }).join('');
    },

    // Sets the raw pixel data for the image.
    // Currently supports array of bytes or a hexadecimal string.
    setRawData: function(dataInput) {
        if (Array.isArray(dataInput)) {
            // If input is an array, assume it's already a byte array.
            this.pixelDataBuffer = dataInput;
        } else if (typeof dataInput === 'string') {
            // If input is a string, assume it's a hexadecimal string and convert it.
            this.pixelDataBuffer = dataInput.hexStringToByteList();
        } else {
            console.error("Unsupported raw data format. Please provide a byte array or a hexadecimal string.");
            this.pixelDataBuffer = null; // Clear any existing invalid data.
        }
    },

    // Generates the complete PNG byte stream, encapsulating all image data and metadata
    // into an array of byte values conforming to the PNG specification.
    generateByteStream: function() {
        const instanceReference = this;
        const currentConfiguration = instanceReference.settings;
        let outputByteSequence = []; // The array to accumulate all PNG bytes.

        // --- PNG File Signature (Magic Number) ---
        // A fixed 8-byte sequence identifying the file as a PNG.
        const pngFileSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        outputByteSequence = outputByteSequence.concat(pngFileSignature);

        // --- IHDR Chunk (Image Header) ---
        // Contains fundamental information about the image.
        const ihdrChunkDataLength = 13; // Fixed length for IHDR data.
        outputByteSequence = outputByteSequence.concat(ihdrChunkDataLength.toFourBytes());
        const ihdrChunkStartIdx = outputByteSequence.length; // Mark start for CRC calculation.
        outputByteSequence = outputByteSequence.concat(PortableNetworkGraphic.CHUNK_TYPE_IHDR); // Add "IHDR" chunk type.

        // Add image dimensions, bit depth, color type, and other IHDR fields.
        outputByteSequence = outputByteSequence.concat(
            Number(instanceReference.imageWidth).toFourBytes(),
            Number(instanceReference.imageHeight).toFourBytes(),
            currentConfiguration.colorBitDepth,
            currentConfiguration.colorRepresentationType,
            currentConfiguration.compressionStrategy,
            currentConfiguration.filteringTechnique,
            currentConfiguration.interlacingScheme
        );
        // Calculate and append the CRC for the IHDR chunk (type + data).
        const ihdrCrcCalculationLength = ihdrChunkDataLength + PortableNetworkGraphic.CHUNK_TYPE_IHDR.length;
        outputByteSequence = outputByteSequence.concat(outputByteSequence.calculateCrcChecksum(ihdrChunkStartIdx, ihdrCrcCalculationLength).toFourBytes());

        // --- PLTE Chunk (Palette) ---
        // Present only for indexed-color images (color type 3).
        if (currentConfiguration.colorRepresentationType === 0x03 &&
            instanceReference.metadataSegments &&
            instanceReference.metadataSegments.PLTE) {
            const paletteByteSequence = instanceReference.metadataSegments.PLTE.hexStringToByteList();
            if (paletteByteSequence.length > 0) {
                outputByteSequence = outputByteSequence.concat(paletteByteSequence.length.toFourBytes());
                const plteChunkStartIdx = outputByteSequence.length;
                outputByteSequence = outputByteSequence.concat(PortableNetworkGraphic.CHUNK_TYPE_PLTE); // Add "PLTE" chunk type.
                outputByteSequence = outputByteSequence.concat(paletteByteSequence);
                // Calculate and append the CRC for the PLTE chunk.
                const plteCrcCalculationLength = paletteByteSequence.length + PortableNetworkGraphic.CHUNK_TYPE_PLTE.length;
                outputByteSequence = outputByteSequence.concat(outputByteSequence.calculateCrcChecksum(plteChunkStartIdx, plteCrcCalculationLength).toFourBytes());
            }
        }

        // --- tRNS Chunk (Transparency) ---
        // Used for indexed-color images to define alpha for palette entries.
        if (currentConfiguration.colorRepresentationType === 0x03 &&
            instanceReference.metadataSegments &&
            instanceReference.metadataSegments.tRNS) {
            const transparencyByteSequence = instanceReference.metadataSegments.tRNS.hexStringToByteList();
            if (transparencyByteSequence.length > 0) {
                outputByteSequence = outputByteSequence.concat(transparencyByteSequence.length.toFourBytes());
                const trnsChunkStartIdx = outputByteSequence.length;
                outputByteSequence = outputByteSequence.concat(PortableNetworkGraphic.CHUNK_TYPE_tRNS); // Add "tRNS" chunk type.
                outputByteSequence = outputByteSequence.concat(transparencyByteSequence);
                // Calculate and append the CRC for the tRNS chunk.
                const trnsCrcCalculationLength = transparencyByteSequence.length + PortableNetworkGraphic.CHUNK_TYPE_tRNS.length;
                outputByteSequence = outputByteSequence.concat(outputByteSequence.calculateCrcChecksum(trnsChunkStartIdx, trnsCrcCalculationLength).toFourBytes());
            }
        }

        // --- IDAT Chunk (Image Data) ---
        // Contains the compressed pixel data.
        if (!instanceReference.pixelDataBuffer || instanceReference.pixelDataBuffer.length === 0) {
            console.error("Pixel data buffer is empty or not set. Cannot generate IDAT chunk meaningfully.");
            // Proceed to IEND, but the image will likely be invalid or empty.
        }

        let currentPixelData = instanceReference.pixelDataBuffer || []; // Use empty array if null/undefined.
        const effectiveWidth = instanceReference.imageWidth;
        const effectiveHeight = instanceReference.imageHeight;

        // Determine the number of bytes per pixel based on the color type.
        // This logic assumes 8-bit depth. More complex logic needed for other bit depths.
        // TODO: Expand this to handle different bit depths and color types accurately.
        const bytesPerPixel = (currentConfiguration.colorRepresentationType === 0x03) ? 1 : 4; // 1 for indexed, 4 for RGBA.

        const scanlineDataWidth = effectiveWidth * bytesPerPixel;
        // Total raw data length including one filter byte per scanline.
        const totalFilteredScanlineDataLength = effectiveHeight * (scanlineDataWidth + 1);

        // Prepend a filter type byte (0x00 for "None") to the beginning of each scanline.
        // Building a new array is generally more efficient than repeated `splice` operations.
        const filteredPixelDataArray = [];
        for (let y = 0; y < effectiveHeight; y++) {
            filteredPixelDataArray.push(0x00); // Filter type 0 (None) for the current scanline.
            const scanlineSourceStart = y * scanlineDataWidth;
            for (let x = 0; x < scanlineDataWidth; x++) {
                filteredPixelDataArray.push(currentPixelData[scanlineSourceStart + x]);
            }
        }
        currentPixelData = filteredPixelDataArray; // Update to the filtered data array.

        // Zlib compression parameters for uncompressed blocks.
        const MAX_ZLIB_UNCOMPRESSED_BLOCK_SIZE = 65535; // Max data length in an uncompressed Zlib block (2^16-1).
        // Note: The original code used 32768, which is a common safe block size,
        // but 65535 is the maximum allowed by the Zlib specification for LEN/NLEN.
        const numberOfZlibBlocks = Math.ceil(currentPixelData.length / MAX_ZLIB_UNCOMPRESSED_BLOCK_SIZE);

        // Calculate the total length of the Zlib stream data.
        // This includes:
        // - 2 bytes for the Zlib header (CMF, FLG).
        // - 5 bytes per uncompressed block (BFINAL, BTYPE, LEN, NLEN).
        // - The actual filtered pixel data.
        // - 4 bytes for the Zlib Adler-32 checksum.
        const zlibStreamPayloadLength = currentPixelData.length + (numberOfZlibBlocks * 5) + 2 + 4;

        outputByteSequence = outputByteSequence.concat(zlibStreamPayloadLength.toFourBytes());
        const idatChunkStartIdx = outputByteSequence.length;
        outputByteSequence = outputByteSequence.concat(PortableNetworkGraphic.CHUNK_TYPE_IDAT); // Add "IDAT" chunk type.

        // --- Zlib Header (CMF, FLG) ---
        // CMF (Compression Method / FINFO): 0x78 (CM=8 for deflate, CINFO=7 for 32KB window).
        // FLG (FCHECK / FDICT / FLEVEL): 0x01 (FCHECK=1 - fastest compression, FDICT=0 - no preset dictionary).
        outputByteSequence.push(0x78, 0x01);

        // --- Zlib Uncompressed Data Blocks ---
        for (let blockIndex = 0; blockIndex < numberOfZlibBlocks; blockIndex++) {
            const currentBlockDataSize = Math.min(MAX_ZLIB_UNCOMPRESSED_BLOCK_SIZE,
                currentPixelData.length - (blockIndex * MAX_ZLIB_UNCOMPRESSED_BLOCK_SIZE));

            // Block Header Byte:
            // Bit 0: BFINAL (1 if this is the last block, 0 otherwise).
            // Bits 1-2: BTYPE (00 for uncompressed block).
            const blockHeaderControlByte = (blockIndex === (numberOfZlibBlocks - 1) ? 0x01 : 0x00);
            outputByteSequence.push(blockHeaderControlByte);

            // LEN (2 bytes): Length of the uncompressed data in this block (little-endian).
            outputByteSequence = outputByteSequence.concat(currentBlockDataSize.toTwoBytesLittleEndian());
            // NLEN (2 bytes): One's complement of LEN (~LEN) (little-endian).
            outputByteSequence = outputByteSequence.concat((~currentBlockDataSize).normalizeUnsigned().toTwoBytesLittleEndian());

            // Extract the slice of image data for the current block.
            const imageDataSliceForBlock = currentPixelData.slice(
                blockIndex * MAX_ZLIB_UNCOMPRESSED_BLOCK_SIZE,
                blockIndex * MAX_ZLIB_UNCOMPRESSED_BLOCK_SIZE + currentBlockDataSize
            );
            outputByteSequence = outputByteSequence.concat(imageDataSliceForBlock);
        }

        // --- Zlib Footer (Adler-32 Checksum) ---
        // Adler-32 checksum of the *uncompressed* (filtered) pixel data.
        outputByteSequence = outputByteSequence.concat(currentPixelData.computeAdlerChecksum().toFourBytes());

        // Calculate and append the CRC for the IDAT chunk (chunk type + Zlib stream data).
        const idatCrcCalculationLength = zlibStreamPayloadLength + PortableNetworkGraphic.CHUNK_TYPE_IDAT.length;
        outputByteSequence = outputByteSequence.concat(outputByteSequence.calculateCrcChecksum(idatChunkStartIdx, idatCrcCalculationLength).toFourBytes());


        // --- IEND Chunk (Image End) ---
        // Marks the end of the PNG file. It has a fixed length of 0 data bytes.
        const iendChunkDataLength = 0;
        outputByteSequence = outputByteSequence.concat(iendChunkDataLength.toFourBytes());
        const iendChunkStartIdx = outputByteSequence.length;
        outputByteSequence = outputByteSequence.concat(PortableNetworkGraphic.CHUNK_TYPE_IEND); // Add "IEND" chunk type.
        // Calculate and append the CRC for the IEND chunk.
        const iendCrcCalculationLength = iendChunkDataLength + PortableNetworkGraphic.CHUNK_TYPE_IEND.length;
        outputByteSequence = outputByteSequence.concat(outputByteSequence.calculateCrcChecksum(iendChunkStartIdx, iendCrcCalculationLength).toFourBytes());

        return outputByteSequence;
    },

    // Applies new configuration settings to the current instance of the image encoder.
    // This allows dynamic modification of image properties.
    applyConfiguration: function(newSettings) {
        if (newSettings && typeof newSettings === 'object') {
            assignProperties(this, newSettings); // Directly update instance properties.
            // Re-validate dimensions after potential update.
            this.imageWidth = Number(this.imageWidth) || 0;
            this.imageHeight = Number(this.imageHeight) || 0;
            if (this.imageWidth <= 0 || this.imageHeight <= 0) {
                console.warn("Invalid dimensions provided in configuration. Dimensions must be positive. Resetting to 1x1.");
                this.imageWidth = 1;
                this.imageHeight = 1;
            }
        } else {
            console.warn("Attempted to apply invalid or null configuration settings.");
        }
    },

    // Converts the generated PNG byte stream into a Base64-encoded Data URI string.
    // This allows embedding the PNG image directly into HTML or CSS.
    exportAsDataURI: function() {
        const instanceReference = this;
        const pngByteStream = instanceReference.generateByteStream();

        if (!pngByteStream || pngByteStream.length === 0) {
            console.error("Failed to generate PNG byte stream, cannot create Data URI.");
            return "";
        }

        // Convert the array of byte values into a raw binary string.
        const binaryStringRepresentation = pngByteStream.map(function(byteVal) {
            return String.fromCharCode(byteVal);
        }).join('');

        // Use the globally available `btoa` function (or its polyfill) for Base64 encoding.
        const base64EncodedData = rootContext.btoa(binaryStringRepresentation);

        return "data:image/png;base64," + base64EncodedData;
    }
});

// --- Global Context Management and Base64 (btoa) Polyfill ---

// Dynamically determine the global object, which can be `window` (browsers),
// `globalThis` (ES2020 standard), `self` (Web Workers), or `global` (Node.js).
const rootContext = (function() {
    if (typeof window !== 'undefined') return window;
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof global !== 'undefined') return global;
    try {
        return new Function('return this')(); // Fallback for highly restricted environments.
    } catch (e) {
        return {}; // Return empty object if no global context can be found.
    }
})();

// Expose the PortableNetworkGraphic class to the global context.
rootContext.PortableNetworkGraphic = PortableNetworkGraphic;

// Store a reference to the original `btoa` function if it exists.
const nativeBtoaFunction = rootContext.btoa;

// Provide a custom `btoa` polyfill or wrapper for environments that lack it (e.g., Node.js by default).
// It attempts to use the native `btoa`, then Node.js `Buffer`, then a basic JavaScript implementation.
rootContext.btoa = function(inputString) {
    if (nativeBtoaFunction) {
        return nativeBtoaFunction(inputString);
    } else if (typeof Buffer !== 'undefined' && Buffer.from) {
        // Node.js environment: Use Buffer for Base64 encoding.
        return Buffer.from(inputString, 'binary').toString('base64');
    } else {
        // Fallback for environments without native `btoa` or Node.js `Buffer`.
        // This is a simplified, basic Base64 encoder and might not be fully spec-compliant
        // or robust for all character sets (e.g., Unicode). A full polyfill is more complex.
        console.warn("`btoa` is not natively available and `Buffer` is not found. Using a simplified JS fallback for Base64 encoding.");

        const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let stringToEncode = String(inputString);
        let encodedOutput = '';
        let charIndex = 0;
        let char1, char2, char3; // Three 8-bit bytes
        let enc1, enc2, enc3, enc4; // Four 6-bit characters

        do {
            char1 = stringToEncode.charCodeAt(charIndex++);
            char2 = stringToEncode.charCodeAt(charIndex++);
            char3 = stringToEncode.charCodeAt(charIndex++);

            enc1 = char1 >> 2;
            enc2 = ((char1 & 3) << 4) | (char2 >> 4);
            enc3 = ((char2 & 15) << 2) | (char3 >> 6);
            enc4 = char3 & 63;

            // Handle padding characters for input not divisible by 3.
            if (isNaN(char2)) {
                enc3 = enc4 = 64; // '=' padding for 2-byte input.
            } else if (isNaN(char3)) {
                enc4 = 64;       // '=' padding for 1-byte input.
            }

            encodedOutput += base64Chars.charAt(enc1) + base64Chars.charAt(enc2) +
                             base64Chars.charAt(enc3) + base64Chars.charAt(enc4);

        } while (charIndex < stringToEncode.length);

        return encodedOutput;
    }
};