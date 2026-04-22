(function(globalScope) {
    // This module offers facilities for structured binary data processing,
    // including byte-level operations, integer conversions, and text encoding.

    /**
     * Converts a UTF-8 encoded string (represented as JS string) into a standard Unicode string.
     * @param {string} inputString - The UTF-8 encoded string.
     * @returns {string} The decoded Unicode string.
     * @throws {URIError} If the input string is not a valid UTF-8 sequence.
     */
    const decodeUnicodeBytes = function(inputString) {
        // Leveraging browser's built-in URI component handling for UTF-8 conversion.
        // First, 'escape' treats the string as ISO-8859-1, encoding non-ASCII chars as %xx.
        // Then, 'decodeURIComponent' interprets these %xx sequences as UTF-8 bytes.
        try {
            return decodeURIComponent(escape(inputString));
        } catch (error) {
            console.error("Failed to decode Unicode bytes:", error.message);
            throw error; // Re-throw to indicate failure
        }
    };

    /**
     * Converts a standard Unicode string into a UTF-8 encoded string suitable for
     * byte-level representation (though still a JS string).
     * @param {string} inputString - The Unicode string.
     * @returns {string} The UTF-8 encoded string.
     */
    const encodeUnicodeBytes = function(inputString) {
        // Reverse of the decoding process.
        // 'encodeURIComponent' encodes Unicode characters into UTF-8 byte sequences (%xx).
        // 'unescape' then converts these %xx sequences back into raw bytes (ISO-8859-1 interpretation).
        return unescape(encodeURIComponent(inputString));
    };

    // --- Bit-level manipulation utilities ---

    /**
     * Extracts individual boolean flags from a single 8-bit byte.
     * Each bit in the byte represents a boolean value.
     * @param {object} byteSource - An object containing `array` (Uint8Array-like) and `offset`.
     * @returns {boolean[]} An array of 8 boolean values, from LSB to MSB.
     */
    const extractBitFlags = function(byteSource) {
        const valueByte = readSingleByte(byteSource);
        const flagArray = [];
        for (let bitIndex = 0; bitIndex < 8; ++bitIndex) {
            flagArray.push(Boolean((valueByte >> bitIndex) & 1));
        }
        return flagArray;
    };

    /**
     * Combines an array of 8 boolean flags into a single 8-bit byte.
     * @param {boolean[]} flags - An array of 8 boolean values.
     * @param {object} byteDestination - An object containing `array` (Uint8Array-like) and `offset`.
     */
    const combineBitFlags = function(flags, byteDestination) {
        if (!Array.isArray(flags) || flags.length !== 8) {
            console.warn("Expected an array of 8 booleans for flag packing. Padding or truncating.");
            // Pad with false or truncate if length is not 8
            const paddedFlags = Array(8).fill(false).map((val, idx) => flags[idx] || val);
            flags = paddedFlags;
        }

        let combinedValue = 0;
        for (let bitPosition = 0; bitPosition < 8; ++bitPosition) {
            if (flags[bitPosition]) {
                combinedValue |= (1 << bitPosition);
            }
        }
        writeSingleByte(combinedValue, byteDestination);
    };

    // --- Nibble (4-bit) manipulation utilities ---

    /**
     * Splits an 8-bit byte into two 4-bit nibbles (high and low).
     * @param {object} byteSource - An object containing `array` (Uint8Array-like) and `offset`.
     * @returns {{high: number, low: number}} An object with the high and low nibble values.
     */
    const splitByteIntoHalves = function(byteSource) {
        const fullByte = readSingleByte(byteSource);
        return {
            high: (fullByte >> 4) & 0x0F, // Shift right by 4, then mask for lower 4 bits
            low: fullByte & 0x0F         // Mask for lower 4 bits
        };
    };

    /**
     * Merges two 4-bit nibbles into a single 8-bit byte.
     * @param {{high: number, low: number}} nibblePair - An object containing high and low nibble values.
     * @param {object} byteDestination - An object containing `array` (Uint8Array-like) and `offset`.
     */
    const mergeHalvesIntoByte = function(nibblePair, byteDestination) {
        // Ensure nibble values are within 0-15 range
        const highNibble = (nibblePair.high || 0) & 0x0F;
        const lowNibble = (nibblePair.low || 0) & 0x0F;
        
        const mergedByte = (highNibble << 4) | lowNibble;
        writeSingleByte(mergedByte, byteDestination);
    };

    // --- Core 8-bit byte operations ---

    /**
     * Converts an unsigned 8-bit integer to its signed equivalent.
     * @param {number} value - An unsigned 8-bit integer (0-255).
     * @returns {number} The signed 8-bit integer (-128 to 127).
     */
    const normalizeSignedByte = function(value) {
        // This effectively performs a sign extension for an 8-bit number.
        // It's a common pattern to convert unsigned to signed within a fixed bit range.
        // (x + 0x80) % 0x100 - 0x80 maps values 0-255 to -128-127.
        return (value + 0x80) % 0x100 - 0x80;
    };

    /**
     * Reads a single 8-bit byte from the binary data source and advances the offset.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 8-bit unsigned integer read.
     * @throws {Error} If reading beyond buffer bounds.
     */
    const readSingleByte = function(sourceBuffer) {
        if (sourceBuffer.offset >= sourceBuffer.array.length) {
            throw new Error("Buffer underflow: Attempted to read beyond array bounds.");
        }
        return sourceBuffer.array[sourceBuffer.offset++];
    };

    /**
     * Writes a single 8-bit byte to the binary data destination and advances the offset.
     * @param {number} value - The 8-bit unsigned integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     * @throws {Error} If writing beyond buffer bounds.
     */
    const writeSingleByte = function(value, destinationBuffer) {
        if (destinationBuffer.offset >= destinationBuffer.array.length) {
            throw new Error("Buffer overflow: Attempted to write beyond array bounds.");
        }
        destinationBuffer.array[destinationBuffer.offset++] = value & 0xFF; // Ensure only lower 8 bits are written
    };

    // --- 16-bit integer operations ---

    /**
     * Converts an unsigned 16-bit integer to its signed equivalent.
     * @param {number} value - An unsigned 16-bit integer (0-65535).
     * @returns {number} The signed 16-bit integer (-32768 to 32767).
     */
    const normalizeSignedWord16 = function(value) {
        return (value + 0x8000) % 0x10000 - 0x8000;
    };

    /**
     * Reads a 16-bit unsigned integer in Little-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 16-bit unsigned integer.
     */
    const read16_LE = function(sourceBuffer) {
        let result = readSingleByte(sourceBuffer);
        result |= readSingleByte(sourceBuffer) << 8;
        return result >>> 0; // Ensure unsigned 32-bit interpretation (JS numbers are 64-bit float)
    };

    /**
     * Writes a 16-bit unsigned integer in Little-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write16_LE = function(value, destinationBuffer) {
        writeSingleByte(value & 0xFF, destinationBuffer);
        writeSingleByte((value >> 8) & 0xFF, destinationBuffer);
    };

    /**
     * Reads a 16-bit unsigned integer in Big-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 16-bit unsigned integer.
     */
    const read16_BE = function(sourceBuffer) {
        let result = readSingleByte(sourceBuffer) << 8;
        result |= readSingleByte(sourceBuffer);
        return result >>> 0;
    };

    /**
     * Writes a 16-bit unsigned integer in Big-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write16_BE = function(value, destinationBuffer) {
        writeSingleByte((value >> 8) & 0xFF, destinationBuffer);
        writeSingleByte(value & 0xFF, destinationBuffer);
    };

    // --- 24-bit integer operations ---

    /**
     * Converts an unsigned 24-bit integer to its signed equivalent.
     * @param {number} value - An unsigned 24-bit integer (0-16777215).
     * @returns {number} The signed 24-bit integer (-8388608 to 8388607).
     */
    const normalizeSignedWord24 = function(value) {
        return (value + 0x800000) % 0x1000000 - 0x800000;
    };

    /**
     * Reads a 24-bit unsigned integer in Little-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 24-bit unsigned integer.
     */
    const read24_LE = function(sourceBuffer) {
        let result = readSingleByte(sourceBuffer);
        result |= readSingleByte(sourceBuffer) << 8;
        result |= readSingleByte(sourceBuffer) << 16;
        return result >>> 0;
    };

    /**
     * Writes a 24-bit unsigned integer in Little-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write24_LE = function(value, destinationBuffer) {
        writeSingleByte(value & 0xFF, destinationBuffer);
        writeSingleByte((value >> 8) & 0xFF, destinationBuffer);
        writeSingleByte((value >> 16) & 0xFF, destinationBuffer);
    };

    /**
     * Reads a 24-bit unsigned integer in Big-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 24-bit unsigned integer.
     */
    const read24_BE = function(sourceBuffer) {
        let result = readSingleByte(sourceBuffer) << 16;
        result |= readSingleByte(sourceBuffer) << 8;
        result |= readSingleByte(sourceBuffer);
        return result >>> 0;
    };

    /**
     * Writes a 24-bit unsigned integer in Big-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write24_BE = function(value, destinationBuffer) {
        writeSingleByte((value >> 16) & 0xFF, destinationBuffer);
        writeSingleByte((value >> 8) & 0xFF, destinationBuffer);
        writeSingleByte(value & 0xFF, destinationBuffer);
    };

    // --- 32-bit integer operations ---

    /**
     * Converts an unsigned 32-bit integer to its signed equivalent.
     * @param {number} value - An unsigned 32-bit integer (0-4294967295).
     * @returns {number} The signed 32-bit integer (-2147483648 to 2147483647).
     */
    const normalizeSignedWord32 = function(value) {
        return (value + 0x80000000) % 0x100000000 - 0x80000000;
    };

    /**
     * Reads a 32-bit unsigned integer in Little-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 32-bit unsigned integer.
     */
    const read32_LE = function(sourceBuffer) {
        let result = readSingleByte(sourceBuffer);
        result |= readSingleByte(sourceBuffer) << 8;
        result |= readSingleByte(sourceBuffer) << 16;
        result |= readSingleByte(sourceBuffer) << 24;
        return result >>> 0;
    };

    /**
     * Writes a 32-bit unsigned integer in Little-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write32_LE = function(value, destinationBuffer) {
        writeSingleByte(value & 0xFF, destinationBuffer);
        writeSingleByte((value >> 8) & 0xFF, destinationBuffer);
        writeSingleByte((value >> 16) & 0xFF, destinationBuffer);
        writeSingleByte((value >> 24) & 0xFF, destinationBuffer);
    };

    /**
     * Reads a 32-bit unsigned integer in Big-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 32-bit unsigned integer.
     */
    const read32_BE = function(sourceBuffer) {
        let result = readSingleByte(sourceBuffer) << 24;
        result |= readSingleByte(sourceBuffer) << 16;
        result |= readSingleByte(sourceBuffer) << 8;
        result |= readSingleByte(sourceBuffer);
        return result >>> 0;
    };

    /**
     * Writes a 32-bit unsigned integer in Big-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write32_BE = function(value, destinationBuffer) {
        writeSingleByte((value >> 24) & 0xFF, destinationBuffer);
        writeSingleByte((value >> 16) & 0xFF, destinationBuffer);
        writeSingleByte((value >> 8) & 0xFF, destinationBuffer);
        writeSingleByte(value & 0xFF, destinationBuffer);
    };

    // --- 40-bit integer operations (Handle with care due to JS number precision) ---

    const LARGE_NUMBER_BASE = 0x100000000; // 2^32

    /**
     * Converts an unsigned 40-bit integer to its signed equivalent.
     * Note: JavaScript numbers are 64-bit floats, precision issues may arise for large integers.
     * @param {number} value - An unsigned 40-bit integer.
     * @returns {number} The signed 40-bit integer.
     */
    const normalizeSignedWord40 = function(value) {
        return (value + 0x8000000000) % 0x10000000000 - 0x8000000000;
    };

    /**
     * Reads a 40-bit unsigned integer in Little-Endian format.
     * This involves combining a 32-bit value with an additional byte,
     * potentially exceeding safe integer limits in JS.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 40-bit unsigned integer.
     */
    const read40_LE = function(sourceBuffer) {
        // Read the lower 32 bits
        let lower32 = read32_LE(sourceBuffer);
        // Read the upper 8 bits
        const upper8 = readSingleByte(sourceBuffer);
        // Combine, being mindful of JS number precision for large values
        return lower32 + (upper8 * LARGE_NUMBER_BASE);
    };

    /**
     * Writes a 40-bit unsigned integer in Little-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write40_LE = function(value, destinationBuffer) {
        write32_LE(value & 0xFFFFFFFF, destinationBuffer); // Write lower 32 bits
        const upperByte = Math.floor(value / LARGE_NUMBER_BASE);
        writeSingleByte(upperByte & 0xFF, destinationBuffer); // Write upper 8 bits
    };

    /**
     * Reads a 40-bit unsigned integer in Big-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 40-bit unsigned integer.
     */
    const read40_BE = function(sourceBuffer) {
        // Read the upper 8 bits first
        const upper8 = readSingleByte(sourceBuffer);
        // Then read the lower 32 bits
        const lower32 = read32_BE(sourceBuffer);
        return lower32 + (upper8 * LARGE_NUMBER_BASE);
    };

    /**
     * Writes a 40-bit unsigned integer in Big-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write40_BE = function(value, destinationBuffer) {
        const upperByte = Math.floor(value / LARGE_NUMBER_BASE);
        writeSingleByte(upperByte & 0xFF, destinationBuffer); // Write upper 8 bits
        write32_BE(value & 0xFFFFFFFF, destinationBuffer); // Write lower 32 bits
    };

    // --- 48-bit integer operations (More significant precision issues) ---

    const LARGE_NUMBER_BASE_2 = 0x10000000000; // 2^40

    /**
     * Converts an unsigned 48-bit integer to its signed equivalent.
     * Note: JavaScript numbers are 64-bit floats, precision issues are highly probable here.
     * @param {number} value - An unsigned 48-bit integer.
     * @returns {number} The signed 48-bit integer.
     */
    const normalizeSignedWord48 = function(value) {
        return (value + 0x800000000000) % 0x1000000000000 - 0x800000000000;
    };

    /**
     * Reads a 48-bit unsigned integer in Little-Endian format.
     * This requires careful handling of JS number precision.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 48-bit unsigned integer.
     */
    const read48_LE = function(sourceBuffer) {
        let lower32 = read32_LE(sourceBuffer);
        let middle8 = readSingleByte(sourceBuffer);
        let upper8 = readSingleByte(sourceBuffer);
        
        // Combine carefully. lower32 is already >>> 0.
        let result = lower32;
        result += middle8 * LARGE_NUMBER_BASE; // Add 2^32 byte
        result += upper8 * LARGE_NUMBER_BASE_2; // Add 2^40 byte
        return result;
    };

    /**
     * Writes a 48-bit unsigned integer in Little-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write48_LE = function(value, destinationBuffer) {
        write32_LE(value & 0xFFFFFFFF, destinationBuffer);
        writeSingleByte(Math.floor((value / LARGE_NUMBER_BASE)) & 0xFF, destinationBuffer);
        writeSingleByte(Math.floor((value / LARGE_NUMBER_BASE_2)) & 0xFF, destinationBuffer);
    };

    /**
     * Reads a 48-bit unsigned integer in Big-Endian format.
     * @param {object} sourceBuffer - Object with `array` (Uint8Array) and `offset`.
     * @returns {number} The 48-bit unsigned integer.
     */
    const read48_BE = function(sourceBuffer) {
        const upper8 = readSingleByte(sourceBuffer);
        const middle8 = readSingleByte(sourceBuffer);
        const lower32 = read32_BE(sourceBuffer);

        let result = lower32;
        result += middle8 * LARGE_NUMBER_BASE;
        result += upper8 * LARGE_NUMBER_BASE_2;
        return result;
    };

    /**
     * Writes a 48-bit unsigned integer in Big-Endian format.
     * @param {number} value - The integer to write.
     * @param {object} destinationBuffer - Object with `array` (Uint8Array) and `offset`.
     */
    const write48_BE = function(value, destinationBuffer) {
        writeSingleByte(Math.floor((value / LARGE_NUMBER_BASE_2)) & 0xFF, destinationBuffer);
        writeSingleByte(Math.floor((value / LARGE_NUMBER_BASE)) & 0xFF, destinationBuffer);
        write32_BE(value & 0xFFFFFFFF, destinationBuffer);
    };

    // --- Schema Definition Class ---

    /**
     * Represents a single operation (unpack or pack) within a binary schema.
     * This internal class simplifies the structure of schema definitions.
     */
    class SchemaOperation {
        /**
         * @param {function(object, object): void} unpacker - Function to read from binary and populate struct.
         * @param {function(object, object): void} packer - Function to read from struct and write to binary.
         */
        constructor(unpacker, packer) {
            if (typeof unpacker !== 'function' || typeof packer !== 'function') {
                throw new Error("SchemaOperation requires valid unpacker and packer functions.");
            }
            this.unpacker = unpacker;
            this.packer = packer;
        }
    }

    /**
     * A fluent API for defining binary data structures (schemas) for packing and unpacking.
     * It allows chaining methods to build up a complex data layout.
     */
    class DataLayout {
        /**
         * Creates a new DataLayout instance.
         * @param {DataLayout} [baseLayout] - An optional parent layout to extend.
         * @param {number} [byteSpan=0] - The byte size of the current fragment being added.
         * @param {SchemaOperation} [currentOperation] - The operation object for the current fragment.
         */
        constructor(baseLayout, byteSpan = 0, currentOperation = null) {
            if (baseLayout instanceof DataLayout) {
                this.totalByteSize = baseLayout.totalByteSize + byteSpan;
                this.operationSequence = baseLayout.operationSequence.concat(currentOperation);
            } else {
                this.totalByteSize = 0;
                this.operationSequence = [];
            }
        }

        /**
         * Factory method to create a new DataLayout instance.
         * This is useful internally to maintain the fluent interface.
         * @param {DataLayout} base - The current DataLayout instance (this).
         * @param {number} span - The byte size of the new segment.
         * @param {SchemaOperation} op - The unpack/pack operations for the new segment.
         * @returns {DataLayout} A new DataLayout instance.
         */
        _createNewLayout(base, span, op) {
            return new DataLayout(base, span, op);
        }

        /**
         * Adds padding bytes (NULs) to the schema.
         * @param {number} [numBytes=1] - The number of bytes to pad.
         * @returns {DataLayout} A new DataLayout instance with the padding added.
         */
        addPadding(numBytes = 1) {
            const paddingOp = new SchemaOperation(
                (source, target) => {
                    source.offset += numBytes;
                },
                (source, destination) => {
                    for (let i = 0; i < numBytes; ++i) {
                        writeSingleByte(0, destination);
                    }
                }
            );
            return this._createNewLayout(this, numBytes, paddingOp);
        }

        /**
         * Adds a field for an array of 8 boolean flags (1 byte).
         * @param {string} fieldKey - The key for the field in the target structure.
         * @param {number} [count] - If provided, defines an array of 'count' flag sets.
         * @returns {DataLayout} A new DataLayout instance.
         */
        addBooleanFlags(fieldKey, count) {
            if (count === undefined) {
                // Single set of 8 booleans
                const singleBooleanOp = new SchemaOperation(
                    (source, target) => {
                        target[fieldKey] = extractBitFlags(source);
                    },
                    (source, destination) => {
                        combineBitFlags(source[fieldKey] || [], destination);
                    }
                );
                return this._createNewLayout(this, 1, singleBooleanOp);
            } else {
                // Array of 'count' sets of 8 booleans
                const multiBooleanOp = new SchemaOperation(
                    (source, target) => {
                        const tempArray = [];
                        for (let i = 0; i < count; ++i) {
                            tempArray.push(extractBitFlags(source));
                        }
                        target[fieldKey] = tempArray;
                    },
                    (source, destination) => {
                        const sourceArray = source[fieldKey] || [];
                        for (let i = 0; i < count; ++i) {
                            combineBitFlags(sourceArray[i] || [], destination);
                        }
                    }
                );
                return this._createNewLayout(this, count, multiBooleanOp);
            }
        }

        /**
         * Adds a field for a nibble pair (1 byte).
         * @param {string} fieldKey - The key for the field in the target structure.
         * @param {number} [count] - If provided, defines an array of 'count' nibble pairs.
         * @returns {DataLayout} A new DataLayout instance.
         */
        addNibblePair(fieldKey, count) {
            if (count === undefined) {
                // Single nibble pair
                const singleNibbleOp = new SchemaOperation(
                    (source, target) => {
                        target[fieldKey] = splitByteIntoHalves(source);
                    },
                    (source, destination) => {
                        mergeHalvesIntoByte(source[fieldKey] || { high: 0, low: 0 }, destination);
                    }
                );
                return this._createNewLayout(this, 1, singleNibbleOp);
            } else {
                // Array of 'count' nibble pairs
                const multiNibbleOp = new SchemaOperation(
                    (source, target) => {
                        const tempArray = [];
                        for (let i = 0; i < count; ++i) {
                            tempArray.push(splitByteIntoHalves(source));
                        }
                        target[fieldKey] = tempArray;
                    },
                    (source, destination) => {
                        const sourceArray = source[fieldKey] || [];
                        for (let i = 0; i < count; ++i) {
                            mergeHalvesIntoByte(sourceArray[i] || { high: 0, low: 0 }, destination);
                        }
                    }
                );
                return this._createNewLayout(this, count, multiNibbleOp);
            }
        }

        /**
         * Generic method to create an integer field.
         * @param {string} key - The field key.
         * @param {number} size - Size in bytes (1, 2, 3, 4, 5, 6).
         * @param {boolean} isSigned - True for signed, false for unsigned.
         * @param {boolean} isLittleEndian - True for LE, false for BE.
         * @param {number} [arrayCount] - Number of elements if an array.
         * @param {Array} [buffer] - Pre-allocated buffer for array fields.
         * @returns {DataLayout}
         */
        _addIntegerField(key, size, isSigned, isLittleEndian, arrayCount, buffer) {
            const unpackFunc = `read${size * 8}_${isLittleEndian ? 'LE' : 'BE'}`;
            const packFunc = `write${size * 8}_${isLittleEndian ? 'LE' : 'BE'}`;
            const normalizeFunc = isSigned ? `normalizeSignedWord${size * 8}` : null;

            if (arrayCount === undefined) {
                const singleIntOp = new SchemaOperation(
                    (source, target) => {
                        let value = globalScope[unpackFunc](source);
                        if (normalizeFunc) {
                            value = globalScope[normalizeFunc](value);
                        }
                        target[key] = value;
                    },
                    (source, destination) => {
                        globalScope[packFunc](source[key] || 0, destination);
                    }
                );
                return this._createNewLayout(this, size, singleIntOp);
            } else {
                const multiIntOp = new SchemaOperation(
                    (source, target) => {
                        let targetArray = buffer;
                        if (targetArray === undefined) {
                            targetArray = [];
                        }
                        for (let i = 0; i < arrayCount; ++i) {
                            let value = globalScope[unpackFunc](source);
                            if (normalizeFunc) {
                                value = globalScope[normalizeFunc](value);
                            }
                            targetArray[i] = value;
                        }
                        target[key] = targetArray;
                    },
                    (source, destination) => {
                        const sourceArray = source[key] || [];
                        for (let i = 0; i < arrayCount; ++i) {
                            globalScope[packFunc](sourceArray[i] || 0, destination);
                        }
                    }
                );
                return this._createNewLayout(this, size * arrayCount, multiIntOp);
            }
        }

        // --- 8-bit integer field definitions ---
        addSignedInt8_LE(key, count, buffer) { return this._addIntegerField(key, 1, true, true, count, buffer); }
        addUnsignedInt8_LE(key, count, buffer) { return this._addIntegerField(key, 1, false, true, count, buffer); }
        addSignedInt8_BE(key, count, buffer) { return this._addIntegerField(key, 1, true, false, count, buffer); }
        addUnsignedInt8_BE(key, count, buffer) { return this._addIntegerField(key, 1, false, false, count, buffer); }

        // --- 16-bit integer field definitions ---
        addSignedInt16_LE(key, count, buffer) { return this._addIntegerField(key, 2, true, true, count, buffer); }
        addUnsignedInt16_LE(key, count, buffer) { return this._addIntegerField(key, 2, false, true, count, buffer); }
        addSignedInt16_BE(key, count, buffer) { return this._addIntegerField(key, 2, true, false, count, buffer); }
        addUnsignedInt16_BE(key, count, buffer) { return this._addIntegerField(key, 2, false, false, count, buffer); }

        // --- 24-bit integer field definitions ---
        addSignedInt24_LE(key, count, buffer) { return this._addIntegerField(key, 3, true, true, count, buffer); }
        addUnsignedInt24_LE(key, count, buffer) { return this._addIntegerField(key, 3, false, true, count, buffer); }
        addSignedInt24_BE(key, count, buffer) { return this._addIntegerField(key, 3, true, false, count, buffer); }
        addUnsignedInt24_BE(key, count, buffer) { return this._addIntegerField(key, 3, false, false, count, buffer); }

        // --- 32-bit integer field definitions ---
        addSignedInt32_LE(key, count, buffer) { return this._addIntegerField(key, 4, true, true, count, buffer); }
        addUnsignedInt32_LE(key, count, buffer) { return this._addIntegerField(key, 4, false, true, count, buffer); }
        addSignedInt32_BE(key, count, buffer) { return this._addIntegerField(key, 4, true, false, count, buffer); }
        addUnsignedInt32_BE(key, count, buffer) { return this._addIntegerField(key, 4, false, false, count, buffer); }

        // --- 40-bit integer field definitions ---
        addSignedInt40_LE(key, count, buffer) { return this._addIntegerField(key, 5, true, true, count, buffer); }
        addUnsignedInt40_LE(key, count, buffer) { return this._addIntegerField(key, 5, false, true, count, buffer); }
        addSignedInt40_BE(key, count, buffer) { return this._addIntegerField(key, 5, true, false, count, buffer); }
        addUnsignedInt40_BE(key, count, buffer) { return this._addIntegerField(key, 5, false, false, count, buffer); }

        // --- 48-bit integer field definitions ---
        addSignedInt48_LE(key, count, buffer) { return this._addIntegerField(key, 6, true, true, count, buffer); }
        addUnsignedInt48_LE(key, count, buffer) { return this._addIntegerField(key, 6, false, true, count, buffer); }
        addSignedInt48_BE(key, count, buffer) { return this._addIntegerField(key, 6, true, false, count, buffer); }
        addUnsignedInt48_BE(key, count, buffer) { return this._addIntegerField(key, 6, false, false, count, buffer); }

        // --- Public methods for schema application ---

        /**
         * Unpacks binary data into a JavaScript object according to the defined schema.
         * @param {Uint8Array} binaryData - The source binary data.
         * @param {object} [targetObject={}] - The object to populate with unpacked data.
         * @returns {object} The populated target object.
         * @throws {Error} If buffer underflow occurs during unpacking.
         */
        unpack(binaryData, targetObject = {}) {
            const dataView = { array: binaryData, offset: 0 };
            for (const op of this.operationSequence) {
                if (op && op.unpacker) {
                    try {
                        op.unpacker(dataView, targetObject);
                    } catch (e) {
                        console.error("Error during unpacking:", e.message);
                        throw e;
                    }
                }
            }
            return targetObject;
        }

        /**
         * Packs a JavaScript object into binary data according to the defined schema.
         * @param {object} sourceObject - The JavaScript object containing data to pack.
         * @param {Uint8Array} [outputBuffer] - Optional pre-allocated buffer. If not provided, a new one is created.
         * @returns {Uint8Array} The packed binary data.
         * @throws {Error} If buffer overflow occurs during packing.
         */
        pack(sourceObject, outputBuffer) {
            if (!outputBuffer) {
                outputBuffer = new Uint8Array(this.totalByteSize);
            } else if (outputBuffer.length < this.totalByteSize) {
                throw new Error(`Output buffer too small. Expected at least ${this.totalByteSize} bytes, got ${outputBuffer.length}.`);
            }

            const dataView = { array: outputBuffer, offset: 0 };
            for (const op of this.operationSequence) {
                if (op && op.packer) {
                    try {
                        op.packer(sourceObject, dataView);
                    } catch (e) {
                        console.error("Error during packing:", e.message);
                        throw e;
                    }
                }
            }
            return outputBuffer;
        }
    }

    // Expose the DataLayout class and UTF-8 utilities to the global scope or module exports
    // This part assumes a browser environment by default, but can be adapted for Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            DataLayout: DataLayout,
            decodeUnicodeBytes: decodeUnicodeBytes,
            encodeUnicodeBytes: encodeUnicodeBytes
            // More granular exports if needed for internal functions
        };
    } else {
        globalScope.BinarySchema = {
            DataLayout: DataLayout,
            decodeUnicodeBytes: decodeUnicodeBytes,
            encodeUnicodeBytes: encodeUnicodeBytes
        };
    }

})(typeof window !== 'undefined' ? window : global);