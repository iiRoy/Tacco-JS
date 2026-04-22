(function() {
    // --- Core Data Manipulation Utilities ---

    // String to byte array (UTF-8 encoding)
    const encodeTextToOctets = (sourceText) => {
        return Array.from(new TextEncoder().encode(sourceText));
    };

    // Byte array to string (UTF-8 decoding)
    const decodeOctetsToText = (octetArray) => {
        return new TextDecoder('utf-8').decode(new Uint8Array(octetArray));
    };

    // Converts an unsigned integer to its signed two's complement representation
    const convertUnsignedToSigned = (rawValue, bitLength) => {
        const fullRange = Math.pow(2, bitLength);
        const halfRange = fullRange / 2;
        return (rawValue >= halfRange) ? rawValue - fullRange : rawValue;
    };

    // DataView accessor methods for various integer sizes and endianness
    const octetAccessors = {
        // 8-bit
        read8Bit: (view, position) => view.getUint8(position),
        write8Bit: (view, position, value) => view.setUint8(position, value & 0xFF),

        // 16-bit
        read16LE: (view, position) => view.getUint16(position, true),
        write16LE: (view, position, value) => view.setUint16(position, value, true),
        read16BE: (view, position) => view.getUint16(position, false),
        write16BE: (view, position, value) => view.setUint16(position, value, false),

        // 24-bit (custom implementation as DataView lacks direct support)
        read24LE: (view, position) => {
            let val = view.getUint8(position);
            val |= (view.getUint8(position + 1) << 8);
            val |= (view.getUint8(position + 2) << 16);
            return val >>> 0; // Ensure unsigned 32-bit
        },
        write24LE: (view, position, value) => {
            view.setUint8(position, value & 0xFF);
            view.setUint8(position + 1, (value >> 8) & 0xFF);
            view.setUint8(position + 2, (value >> 16) & 0xFF);
        },
        read24BE: (view, position) => {
            let val = view.getUint8(position) << 16;
            val |= (view.getUint8(position + 1) << 8);
            val |= view.getUint8(position + 2);
            return val >>> 0; // Ensure unsigned 32-bit
        },
        write24BE: (view, position, value) => {
            view.setUint8(position, (value >> 16) & 0xFF);
            view.setUint8(position + 1, (value >> 8) & 0xFF);
            view.setUint8(position + 2, value & 0xFF);
        },

        // 32-bit
        read32LE: (view, position) => view.getUint32(position, true),
        write32LE: (view, position, value) => view.setUint32(position, value, true),
        read32BE: (view, position) => view.getUint32(position, false),
        write32BE: (view, position, value) => view.setUint32(position, value, false),

        // 40-bit (custom implementation due to JS number limitations)
        read40LE: (view, position) => {
            let lower32 = octetAccessors.read32LE(view, position);
            let upper8 = view.getUint8(position + 4);
            return lower32 + upper8 * Math.pow(2, 32);
        },
        write40LE: (view, position, value) => {
            octetAccessors.write32LE(view, position, value & 0xFFFFFFFF);
            view.setUint8(position + 4, Math.floor(value / Math.pow(2, 32)) & 0xFF);
        },
        read40BE: (view, position) => {
            let upper8 = view.getUint8(position);
            let lower32 = octetAccessors.read32BE(view, position + 1);
            return lower32 + upper8 * Math.pow(2, 32);
        },
        write40BE: (view, position, value) => {
            view.setUint8(position, Math.floor(value / Math.pow(2, 32)) & 0xFF);
            octetAccessors.write32BE(view, position + 1, value & 0xFFFFFFFF);
        },

        // 48-bit (custom implementation due to JS number limitations)
        read48LE: (view, position) => {
            let lower32 = octetAccessors.read32LE(view, position);
            let mid8 = view.getUint8(position + 4);
            let upper8 = view.getUint8(position + 5);
            return lower32 + mid8 * Math.pow(2, 32) + upper8 * Math.pow(2, 40);
        },
        write48LE: (view, position, value) => {
            octetAccessors.write32LE(view, position, value & 0xFFFFFFFF);
            view.setUint8(position + 4, Math.floor((value % Math.pow(2, 40)) / Math.pow(2, 32)) & 0xFF);
            view.setUint8(position + 5, Math.floor(value / Math.pow(2, 40)) & 0xFF);
        },
        read48BE: (view, position) => {
            let upper8 = view.getUint8(position);
            let mid8 = view.getUint8(position + 1);
            let lower32 = octetAccessors.read32BE(view, position + 2);
            return lower32 + mid8 * Math.pow(2, 32) + upper8 * Math.pow(2, 40);
        },
        write48BE: (view, position, value) => {
            view.setUint8(position, Math.floor(value / Math.pow(2, 40)) & 0xFF);
            view.setUint8(position + 1, Math.floor((value % Math.pow(2, 40)) / Math.pow(2, 32)) & 0xFF);
            octetAccessors.write32BE(view, position + 2, value & 0xFFFFFFFF);
        }
    };

    // --- Schema Definition Builder ---

    const SchemaConstructor = function() {
        this.fieldDefinitions = [];
        this.totalByteLength = 0;
    };

    SchemaConstructor.prototype = {
        // Generic method to add a field to the schema
        _appendField: function(label, byteSpan, valueReader, valueWriter, occurrenceCount = 1, preallocatedBuffer = undefined, valueEndianness = null) {
            this.fieldDefinitions.push({
                label,
                byteSpan,
                valueReader,
                valueWriter,
                occurrenceCount,
                preallocatedBuffer,
                valueEndianness
            });
            this.totalByteLength += byteSpan * occurrenceCount;
            return this;
        },

        // Adds padding bytes
        insertPadding: function(bytesToSkip = 1) {
            return this._appendField(null, bytesToSkip, (view, pos) => pos + bytesToSkip, (val, view, pos) => {
                for (let i = 0; i < bytesToSkip; ++i) octetAccessors.write8Bit(view, pos + i, 0);
                return pos + bytesToSkip;
            });
        },

        // Defines a field for an array of 8 booleans packed into a single byte
        booleanGroup: function(label, groupCount = 1) {
            const readGroup = (view, pos) => {
                const byteValue = octetAccessors.read8Bit(view, pos);
                const results = [];
                for (let i = 0; i < 8; ++i) { // Always 8 booleans per byte
                    results.push(!!((byteValue >> i) & 1));
                }
                return [results, pos + 1];
            };
            const writeGroup = (values, view, pos) => {
                let byteValue = 0;
                for (let i = 0; i < 8; ++i) {
                    if (values[i]) byteValue |= (1 << i);
                }
                octetAccessors.write8Bit(view, pos, byteValue);
                return pos + 1;
            };
            return this._appendField(label, 1, readGroup, writeGroup, groupCount, undefined, 'forward'); // 'forward' for consistent iteration
        },

        // Defines a field for two 4-bit nibbles packed into a single byte
        nibblePair: function(label, pairCount = 1) {
            const readPair = (view, pos) => {
                const byteValue = octetAccessors.read8Bit(view, pos);
                return [[byteValue >> 4, byteValue & 0x0F], pos + 1];
            };
            const writePair = (values, view, pos) => {
                const byteValue = (values[0] << 4) | (values[1] & 0x0F);
                octetAccessors.write8Bit(view, pos, byteValue);
                return pos + 1;
            };
            return this._appendField(label, 1, readPair, writePair, pairCount, undefined, 'forward'); // 'forward' for consistent iteration
        },

        // Unified method for defining various integer types
        numericField: function(label, bitLength, endianness, isSigned, occurrenceCount = 1, preallocatedBuffer = undefined) {
            const byteCount = bitLength / 8;
            if (bitLength % 8 !== 0 || byteCount < 1) {
                throw new Error(`Invalid bit length for integer field: ${bitLength}. Must be a multiple of 8.`);
            }

            const isLittleEndian = (endianness === 'little');

            // Single value reader for the specific integer type
            const singleValueReader = (view, position) => {
                let rawValue;
                if (isSigned) {
                    if (bitLength === 8) rawValue = view.getInt8(position);
                    else if (bitLength === 16) rawValue = view.getInt16(position, isLittleEndian);
                    else if (bitLength === 32) rawValue = view.getInt32(position, isLittleEndian);
                    else { // For 24, 40, 48 bits, read unsigned and apply sign conversion
                        let readerFunc;
                        if (bitLength === 24) readerFunc = isLittleEndian ? octetAccessors.read24LE : octetAccessors.read24BE;
                        else if (bitLength === 40) readerFunc = isLittleEndian ? octetAccessors.read40LE : octetAccessors.read40BE;
                        else if (bitLength === 48) readerFunc = isLittleEndian ? octetAccessors.read48LE : octetAccessors.read48BE;
                        else throw new Error(`Unsupported signed bit length: ${bitLength}`);
                        rawValue = convertUnsignedToSigned(readerFunc(view, position), bitLength);
                    }
                } else { // Unsigned
                    if (bitLength === 8) rawValue = octetAccessors.read8Bit(view, position);
                    else if (bitLength === 16) rawValue = octetAccessors.read16LE(view, position, isLittleEndian);
                    else if (bitLength === 24) rawValue = isLittleEndian ? octetAccessors.read24LE(view, position) : octetAccessors.read24BE(view, position);
                    else if (bitLength === 32) rawValue = octetAccessors.read32LE(view, position, isLittleEndian);
                    else if (bitLength === 40) rawValue = isLittleEndian ? octetAccessors.read40LE(view, position) : octetAccessors.read40BE(view, position);
                    else if (bitLength === 48) rawValue = isLittleEndian ? octetAccessors.read48LE(view, position) : octetAccessors.read48BE(view, position);
                    else throw new Error(`Unsupported unsigned bit length: ${bitLength}`);
                }
                return [rawValue, position + byteCount];
            };

            // Single value writer for the specific integer type
            const singleValueWriter = (value, view, position) => {
                if (isSigned) {
                    if (bitLength === 8) view.setInt8(position, value);
                    else if (bitLength === 16) view.setInt16(position, value, isLittleEndian);
                    else if (bitLength === 32) view.setInt32(position, value, isLittleEndian);
                    else { // For 24, 40, 48 bits, use unsigned setters
                        let writerFunc;
                        if (bitLength === 24) writerFunc = isLittleEndian ? octetAccessors.write24LE : octetAccessors.write24BE;
                        else if (bitLength === 40) writerFunc = isLittleEndian ? octetAccessors.write40LE : octetAccessors.write40BE;
                        else if (bitLength === 48) writerFunc = isLittleEndian ? octetAccessors.write48LE : octetAccessors.write48BE;
                        else throw new Error(`Unsupported signed bit length: ${bitLength}`);
                        writerFunc(view, position, value);
                    }
                } else { // Unsigned
                    if (bitLength === 8) octetAccessors.write8Bit(view, position, value);
                    else if (bitLength === 16) octetAccessors.write16LE(view, position, value, isLittleEndian);
                    else if (bitLength === 24) (isLittleEndian ? octetAccessors.write24LE : octetAccessors.write24BE)(view, position, value);
                    else if (bitLength === 32) octetAccessors.write32LE(view, position, value, isLittleEndian);
                    else if (bitLength === 40) (isLittleEndian ? octetAccessors.write40LE : octetAccessors.write40BE)(view, position, value);
                    else if (bitLength === 48) (isLittleEndian ? octetAccessors.write48LE : octetAccessors.write48BE)(view, position, value);
                    else throw new Error(`Unsupported unsigned bit length: ${bitLength}`);
                }
                return position + byteCount;
            };

            return this._appendField(label, byteCount, singleValueReader, singleValueWriter, occurrenceCount, preallocatedBuffer, endianness);
        },

        // Convenience methods for specific integer types (signed/unsigned, little/big-endian)
        signed8Little: function(label, count, buf) { return this.numericField(label, 8, 'little', true, count, buf); },
        unsigned8Little: function(label, count, buf) { return this.numericField(label, 8, 'little', false, count, buf); },
        signed8Big: function(label, count, buf) { return this.numericField(label, 8, 'big', true, count, buf); },
        unsigned8Big: function(label, count, buf) { return this.numericField(label, 8, 'big', false, count, buf); },

        signed16Little: function(label, count, buf) { return this.numericField(label, 16, 'little', true, count, buf); },
        unsigned16Little: function(label, count, buf) { return this.numericField(label, 16, 'little', false, count, buf); },
        signed16Big: function(label, count, buf) { return this.numericField(label, 16, 'big', true, count, buf); },
        unsigned16Big: function(label, count, buf) { return this.numericField(label, 16, 'big', false, count, buf); },

        signed24Little: function(label, count, buf) { return this.numericField(label, 24, 'little', true, count, buf); },
        unsigned24Little: function(label, count, buf) { return this.numericField(label, 24, 'little', false, count, buf); },
        signed24Big: function(label, count, buf) { return this.numericField(label, 24, 'big', true, count, buf); },
        unsigned24Big: function(label, count, buf) { return this.numericField(label, 24, 'big', false, count, buf); },

        signed32Little: function(label, count, buf) { return this.numericField(label, 32, 'little', true, count, buf); },
        unsigned32Little: function(label, count, buf) { return this.numericField(label, 32, 'little', false, count, buf); },
        signed32Big: function(label, count, buf) { return this.numericField(label, 32, 'big', true, count, buf); },
        unsigned32Big: function(label, count, buf) { return this.numericField(label, 32, 'big', false, count, buf); },

        signed40Little: function(label, count, buf) { return this.numericField(label, 40, 'little', true, count, buf); },
        unsigned40Little: function(label, count, buf) { return this.numericField(label, 40, 'little', false, count, buf); },
        signed40Big: function(label, count, buf) { return this.numericField(label, 40, 'big', true, count, buf); },
        unsigned40Big: function(label, count, buf) { return this.numericField(label, 40, 'big', false, count, buf); },

        signed48Little: function(label, count, buf) { return this.numericField(label, 48, 'little', true, count, buf); },
        unsigned48Little: function(label, count, buf) { return this.numericField(label, 48, 'little', false, count, buf); },
        signed48Big: function(label, count, buf) { return this.numericField(label, 48, 'big', true, count, buf); },
        unsigned48Big: function(label, count, buf) { return this.numericField(label, 48, 'big', false, count, buf); },

        // Finalizes the schema and returns the decode/encode functions
        generateCodec: function() {
            const schema = this.fieldDefinitions;
            const fullByteLength = this.totalByteLength;

            const decodeFunction = (byteArray) => {
                const dataView = new DataView(byteArray.buffer, byteArray.byteOffset, byteArray.byteLength);
                let currentByteOffset = 0;
                const decodedObject = {};

                for (const field of schema) {
                    if (field.label === null) { // Padding field
                        currentByteOffset += field.byteSpan;
                        continue;
                    }

                    if (field.occurrenceCount > 1) {
                        const valueArray = field.preallocatedBuffer || [];
                        // Original code loops backwards for little-endian arrays, forwards for big-endian/boolean/nibble arrays
                        if (field.valueEndianness === 'little') {
                            for (let i = field.occurrenceCount - 1; i >= 0; --i) {
                                const [value, nextPosition] = field.valueReader(dataView, currentByteOffset);
                                valueArray[i] = value;
                                currentByteOffset = nextPosition;
                            }
                        } else { // 'big' or 'forward' for boolean/nibble
                            for (let i = 0; i < field.occurrenceCount; ++i) {
                                const [value, nextPosition] = field.valueReader(dataView, currentByteOffset);
                                valueArray[i] = value;
                                currentByteOffset = nextPosition;
                            }
                        }
                        decodedObject[field.label] = valueArray;
                    } else {
                        const [value, nextPosition] = field.valueReader(dataView, currentByteOffset);
                        decodedObject[field.label] = value;
                        currentByteOffset = nextPosition;
                    }
                }
                return decodedObject;
            };

            const encodeFunction = (dataPayload) => {
                const buffer = new ArrayBuffer(fullByteLength);
                const dataView = new DataView(buffer);
                let currentByteOffset = 0;

                for (const field of schema) {
                    if (field.label === null) { // Padding field
                        for (let i = 0; i < field.byteSpan; ++i) {
                            octetAccessors.write8Bit(dataView, currentByteOffset + i, 0);
                        }
                        currentByteOffset += field.byteSpan;
                        continue;
                    }

                    const valueToProcess = dataPayload[field.label];

                    if (field.occurrenceCount > 1) {
                        if (field.valueEndianness === 'little') {
                            for (let i = field.occurrenceCount - 1; i >= 0; --i) {
                                currentByteOffset = field.valueWriter(valueToProcess[i] || 0, dataView, currentByteOffset);
                            }
                        } else { // 'big' or 'forward' for boolean/nibble
                            for (let i = 0; i < field.occurrenceCount; ++i) {
                                currentByteOffset = field.valueWriter(valueToProcess[i] || 0, dataView, currentByteOffset);
                            }
                        }
                    } else {
                        currentByteOffset = field.valueWriter(valueToProcess, dataView, currentByteOffset);
                    }
                }
                return new Uint8Array(buffer);
            };

            return {
                decode: decodeFunction,
                encode: encodeFunction,
                schemaSize: fullByteLength
            };
        }
    };

    // Factory function to create a new schema builder instance
    const createDataLayoutBuilder = () => new SchemaConstructor();

    // Expose the module's public interface
    this.BinaryProcessorModule = {
        decodeCharacters: decodeOctetsToText,
        encodeCharacters: encodeTextToOctets,
        createLayoutDescription: createDataLayoutBuilder
    };
}).call(this);