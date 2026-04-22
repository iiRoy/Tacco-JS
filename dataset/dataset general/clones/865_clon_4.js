const convert_to_unsigned_32bit = (inputNum) => inputNum < 0 ? inputNum + 4294967296 : inputNum;

const extract_four_bytes_big_endian = (inputNum) => [
    (inputNum >>> 24) & 0xff,
    (inputNum >>> 16) & 0xff,
    (inputNum >>> 8) & 0xff,
    inputNum & 0xff
];

const extract_two_bytes_little_endian = (inputNum) => [
    inputNum & 0xff,
    (inputNum >>> 8) & 0xff
];

const calculate_adler_checksum = (byteSequence, initialOffset = 0, segmentLength = byteSequence.length - initialOffset) => {
    let alpha = 1;
    let beta = 0;
    const modulus = 65521;

    for (let idx = 0; idx < segmentLength; idx++) {
        alpha = (alpha + byteSequence[initialOffset + idx]) % modulus;
        beta = (beta + alpha) % modulus;
    }
    return convert_to_unsigned_32bit((beta << 16) | alpha);
};

const generate_crc_table_data = () => {
    const table = Array(256).fill(0);
    for (let currentByte = 0; currentByte < 256; currentByte++) {
        let tempVal = currentByte;
        for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
            tempVal = (tempVal & 1) ? 0xedb88320 ^ (tempVal >>> 1) : (tempVal >>> 1);
        }
        table[currentByte] = convert_to_unsigned_32bit(tempVal);
    }
    return table;
};
const crc_lookup_table_cache = generate_crc_table_data();

const calculate_crc_checksum = (byteSequence, initialOffset = 0, segmentLength = byteSequence.length - initialOffset) => {
    let currentCrc = 0xffffffff;
    for (let idx = 0; idx < segmentLength; idx++) {
        currentCrc = crc_lookup_table_cache[(currentCrc ^ byteSequence[initialOffset + idx]) & 0xff] ^ (currentCrc >>> 8);
    }
    return convert_to_unsigned_32bit(currentCrc ^ 0xffffffff);
};

const hex_string_to_byte_array = (hexInput) => {
    let processedHex = hexInput;
    if (processedHex.length % 2 === 1) {
        processedHex += "0";
    }
    return Array.from({ length: processedHex.length / 2 }, (_, i) =>
        parseInt(processedHex.substring(i * 2, i * 2 + 2), 16) & 0xff
    );
};

const applyProperties = (destination, source) => {
    for (const propKey in source) {
        if (Object.prototype.hasOwnProperty.call(source, propKey)) {
            destination[propKey] = source[propKey];
        }
    }
    return destination;
};

class ImageAssembler {
    static defaultSettings = {
        pixelBitDepth: 0x08,
        hueType: 0x03,
        compressionScheme: 0x00,
        filteringStrategy: 0x00,
        interleavingPattern: 0x00
    };

    constructor(userOptions) {
        this.configuration = {};
        Object.assign(this.configuration, ImageAssembler.defaultSettings);
        Object.assign(this.configuration, userOptions);

        this.pixelData = null;
        this.segmentData = null;
        this.imageWidth = 5;
        this.imageHeight = 5;
    }

    retrieveHexOutput(inputBytes = this.assembleBytes()) {
        return inputBytes.map(byteVal => {
            const hex = byteVal.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('');
    }

    assembleBytes() {
        const currentInstance = this;
        const currentSettings = currentInstance.configuration;
        let finalByteSequence = [];

        let ihdrSection = [
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
        ];
        ihdrSection = ihdrSection.concat(extract_four_bytes_big_endian(currentInstance.imageWidth));
        ihdrSection = ihdrSection.concat(extract_four_bytes_big_endian(currentInstance.imageHeight));
        ihdrSection = ihdrSection.concat([
            currentSettings.pixelBitDepth,
            currentSettings.hueType,
            currentSettings.compressionScheme,
            currentSettings.filteringStrategy,
            currentSettings.interleavingPattern
        ]);

        const ihdrCrc = calculate_crc_checksum(ihdrSection, 12, 17);
        finalByteSequence = finalByteSequence.concat(ihdrSection, extract_four_bytes_big_endian(ihdrCrc));

        if (currentSettings.hueType === 0x03 && currentInstance.segmentData && currentInstance.segmentData.PLTE) {
            const paletteBytes = hex_string_to_byte_array(currentInstance.segmentData.PLTE);
            finalByteSequence = finalByteSequence.concat(extract_four_bytes_big_endian(paletteBytes.length));
            const paletteCrcStartIdx = finalByteSequence.length;
            finalByteSequence = finalByteSequence.concat([0x50, 0x4c, 0x54, 0x45]);
            finalByteSequence = finalByteSequence.concat(paletteBytes);
            const paletteCrc = calculate_crc_checksum(finalByteSequence, paletteCrcStartIdx, paletteBytes.length + 4);
            finalByteSequence = finalByteSequence.concat(extract_four_bytes_big_endian(paletteCrc));
        }

        if (currentSettings.hueType === 0x03 && currentInstance.segmentData && currentInstance.segmentData.tRNS) {
            const transparencyBytes = hex_string_to_byte_array(currentInstance.segmentData.tRNS);
            finalByteSequence = finalByteSequence.concat(extract_four_bytes_big_endian(transparencyBytes.length));
            const transparencyCrcStartIdx = finalByteSequence.length;
            finalByteSequence = finalByteSequence.concat([0x74, 0x52, 0x4e, 0x53]);
            finalByteSequence = finalByteSequence.concat(transparencyBytes);
            const transparencyCrc = calculate_crc_checksum(finalByteSequence, transparencyCrcStartIdx, transparencyBytes.length + 4);
            finalByteSequence = finalByteSequence.concat(extract_four_bytes_big_endian(transparencyCrc));
        }

        let graphicBytes = hex_string_to_byte_array(currentInstance.pixelData);
        const rowWidth = currentInstance.imageWidth;
        const columnHeight = currentInstance.imageHeight;
        const pixelByteCount = (currentSettings.hueType === 0x03 ? 1 : 4);

        graphicBytes = Array.from({ length: columnHeight }).reduce((acc, _, y) => {
            const rowStart = y * rowWidth * pixelByteCount;
            const rowEnd = rowStart + rowWidth * pixelByteCount;
            acc.push(0x00);
            acc.push(...graphicBytes.slice(rowStart, rowEnd));
            return acc;
        }, []);

        const totalUncompressedLen = graphicBytes.length;
        const maxBlockSize = 32768;
        const dataBlocksCount = Math.ceil(totalUncompressedLen / maxBlockSize);

        let zlibContent = [0x78, 0x01];

        const blockSegments = Array.from({ length: dataBlocksCount }, (_, blockIdx) => {
            const currentBlockSize = Math.min(maxBlockSize, totalUncompressedLen - (blockIdx * maxBlockSize));
            const isLastBlock = (blockIdx === dataBlocksCount - 1);
            const blockHeader = [isLastBlock ? 0x01 : 0x00];
            blockHeader.push(...extract_two_bytes_little_endian(currentBlockSize));
            blockHeader.push(...extract_two_bytes_little_endian(~currentBlockSize));

            const dataSegment = graphicBytes.slice(blockIdx * maxBlockSize, blockIdx * maxBlockSize + currentBlockSize);
            return blockHeader.concat(dataSegment);
        });

        zlibContent = zlibContent.concat(...blockSegments);

        zlibContent = zlibContent.concat(extract_four_bytes_big_endian(calculate_adler_checksum(graphicBytes)));

        const idatChunkDataLength = zlibContent.length;
        finalByteSequence = finalByteSequence.concat(extract_four_bytes_big_endian(idatChunkDataLength));
        const idatCrcStartIdx = finalByteSequence.length;
        finalByteSequence = finalByteSequence.concat([0x49, 0x44, 0x41, 0x54]);
        finalByteSequence = finalByteSequence.concat(zlibContent);
        const idatCrc = calculate_crc_checksum(finalByteSequence, idatCrcStartIdx, idatChunkDataLength + 4);
        finalByteSequence = finalByteSequence.concat(extract_four_bytes_big_endian(idatCrc));

        const iendChunk = [
            0x00, 0x00, 0x00, 0x00,
            0x49, 0x45, 0x4e, 0x44
        ];
        const iendCrc = calculate_crc_checksum(iendChunk, 4, 4);
        finalByteSequence = finalByteSequence.concat(iendChunk, extract_four_bytes_big_endian(iendCrc));

        return finalByteSequence;
    }

    configure(newSettings) {
        Object.assign(this, newSettings);
    }

    generateDataURI() {
        const encodedBytes = this.assembleBytes().map(byteVal => String.fromCharCode(byteVal)).join('');
        return `data:image/png;base64,${globalContext.btoa(encodedBytes)}`;
    }
}

const retrieveGlobalContext = () => {
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return Function('return this')();
};
const globalContext = retrieveGlobalContext();

const originalB64Encoder = globalContext.btoa;
globalContext.btoa = function(inputStr) {
    if (originalB64Encoder) {
        return originalB64Encoder(inputStr);
    } else if (typeof Buffer !== 'undefined') {
        return Buffer.from(inputStr, 'binary').toString('base64');
    } else {
        throw new Error("Base64 encoding function not found in this environment.");
    }
};

globalContext.ImageAssembler = ImageAssembler;