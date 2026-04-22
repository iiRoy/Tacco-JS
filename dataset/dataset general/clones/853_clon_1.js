! function ( e ) {
    // Check if the environment is CommonJS (Node.js)
    if ( "object" == typeof exports ) {
        module.exports = e();
    }
    // Check if the environment is AMD (RequireJS)
    else if ( "function" == typeof define && define.amd ) {
        define( e );
    }
    // Otherwise, assume browser environment
    else {
        var f;
        // Determine the global object
        if ( "undefined" != typeof window ) {
            f = window;
        } else if ( "undefined" != typeof global ) {
            f = global;
        } else if ( "undefined" != typeof self ) {
            f = self;
        }
        // Assign the module to the global object
        f.mqtt = e();
    }
} ( function () {
    var define, module, exports;

    // This is a UMD (Universal Module Definition) wrapper, commonly used by Browserify
    return ( function e ( t, n, r ) {
        // The 'require' function for this bundle
        function s ( o, u ) {
            if ( !n[ o ] ) {
                if ( !t[ o ] ) {
                    var a = typeof require == "function" && require;
                    if ( !u && a ) return a( o, !0 );
                    if ( i ) return i( o, !0 );
                    var error = new Error( "Cannot find module '" + o + "'" );
                    throw error;
                }
                var f = n[ o ] = {
                    exports: {}
                };
                t[ o ][ 0 ].call( f.exports, function ( e ) {
                    var n = t[ o ][ 1 ][ e ];
                    return s( n ? n : e );
                }, f, f.exports, e, t, n, r );
            }
            return n[ o ].exports;
        }

        var i = typeof require == "function" && require;

        // Loop through required modules and ensure they are loaded
        for ( var o = 0; o < r.length; o++ ) {
            s( r[ o ] );
        }

        // Return the main entry point of the bundle
        return s;
    } ) ( {
        1: [ function ( _dereq_, module, exports ) {
            /*!
             * The buffer module from node.js, for the browser.
             *
             * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
             * @license  MIT
             */

            // Dependencies for Buffer operations
            var base64    = _dereq_( 'base64-js' );
            var ieee754   = _dereq_( 'ieee754' );

            // Export the Buffer constructor
            exports.Buffer      = Buffer;
            exports.SlowBuffer  = Buffer; // SlowBuffer is an alias to Buffer in browser
            exports.INSPECT_MAX_BYTES = 50;

            // Default pool size for Buffer
            Buffer.poolSize     = 8192;

            /**
             * If `Buffer._useTypedArrays`:
             *   === true    Use Uint8Array implementation (fastest performance)
             *   === false   Use Object implementation (for broader compatibility, e.g., IE6)
             * This flag determines the underlying implementation for Buffer instances.
             */
            Buffer._useTypedArrays = ( function () {
                // Detect if the browser environment supports Typed Arrays.
                // Modern browsers (IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+)
                // typically support them.
                // We also check if properties can be added to `Uint8Array` instances, which
                // was an issue in older Firefox versions (4-29) but is now fixed.
                try {
                    var buf = new ArrayBuffer( 0 );
                    var arr = new Uint8Array( buf );
                    arr.foo = function () {
                        return 42;
                    };
                    return 42 === arr.foo() &&
                        typeof arr.subarray === 'function'; // Check for `subarray` as Chrome 9-10 lacked it
                } catch ( e ) {
                    // If any error occurs (e.g., Typed Arrays not supported), return false
                    return false;
                }
            } )();


            /**
             * Class: Buffer
             * =============
             *
             * The Buffer constructor generates instances that are either augmented `Uint8Array`s
             * (for performance in modern browsers) or plain objects (for compatibility).
             *
             * When using `Uint8Array`, instances are augmented with Buffer API functions.
             * This approach leverages `Uint8Array` for efficient byte manipulation while
             * avoiding direct modification of the `Uint8Array` prototype.
             */
            function Buffer ( subject, encoding, noZero ) {
                // Ensure `new Buffer()` is always called
                if ( !( this instanceof Buffer ) ) {
                    return new Buffer( subject, encoding, noZero );
                }

                var type = typeof subject;

                // Handle base64 strings with non-padded lengths, a workaround for Node's behavior
                // versus base64-js's strictness.
                if ( encoding === 'base64' && type === 'string' ) {
                    subject = stringtrim( subject );
                    while ( subject.length % 4 !== 0 ) {
                        subject = subject + '='; // Add padding characters
                    }
                }

                // Determine the length of the new Buffer instance
                var length;
                if ( type === 'number' ) {
                    length = coerce( subject );
                } else if ( type === 'string' ) {
                    length = Buffer.byteLength( subject, encoding );
                } else if ( type === 'object' ) {
                    // Assume array-like object if it has a length property
                    length = coerce( subject.length );
                } else {
                    throw new Error( 'First argument needs to be a number, array or string.' );
                }


                var buf;
                if ( Buffer._useTypedArrays ) {
                    // Preferred path: Return an augmented `Uint8Array` instance for best performance.
                    // This involves creating a new Uint8Array and then augmenting it with Buffer methods.
                    buf = Buffer._augment( new Uint8Array( length ) );
                } else {
                    // Fallback path: Return THIS instance of Buffer (which is a plain object)
                    // created by `new Buffer()`.
                    buf = this;
                    buf.length = length;
                    buf._isBuffer = true; // Mark as a Buffer instance
                }


                var i;
                // Initialize the buffer content based on the 'subject' argument
                if ( Buffer._useTypedArrays && typeof subject.byteLength === 'number' ) {
                    // Optimization: If subject is already a TypedArray, use `set` for speed
                    buf._set( subject );
                } else if ( isArrayish( subject ) ) {
                    // If subject is array-like, copy its elements as bytes
                    for ( i = 0; i < length; i++ ) {
                        if ( Buffer.isBuffer( subject ) ) {
                            buf[ i ] = subject.readUInt8( i );
                        } else {
                            buf[ i ] = subject[ i ];
                        }
                    }
                } else if ( type === 'string' ) {
                    // If subject is a string, write it to the buffer with the specified encoding
                    buf.write( subject, 0, encoding );
                } else if ( type === 'number' && !Buffer._useTypedArrays && !noZero ) {
                    // If subject is a number and not using TypedArrays, and noZero is false,
                    // initialize all bytes to 0.
                    for ( i = 0; i < length; i++ ) {
                        buf[ i ] = 0;
                    }
                }

                return buf;
            }


            // STATIC METHODS
            // ==============

            /**
             * Checks if the given encoding is a supported Buffer encoding.
             * @param {string} encoding - The encoding string to check.
             * @returns {boolean} True if supported, false otherwise.
             */
            Buffer.isEncoding = function ( encoding ) {
                switch ( String( encoding ).toLowerCase() ) {
                    case 'hex':
                    case 'utf8':
                    case 'utf-8':
                    case 'ascii':
                    case 'binary':
                    case 'base64':
                    case 'raw':
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        return true;
                    default:
                        return false;
                }
            };


            /**
             * Determines if the given object is a Buffer instance.
             * @param {*} b - The object to test.
             * @returns {boolean} True if `b` is a Buffer, false otherwise.
             */
            Buffer.isBuffer = function ( b ) {
                // A Buffer instance will have a non-null, non-undefined `_isBuffer` property.
                return !!( b !== null && b !== undefined && b._isBuffer );
            };


            /**
             * Calculates the byte length of a string for a given encoding.
             * @param {string} str - The string to measure.
             * @param {string} encoding - The encoding to use. Defaults to 'utf8'.
             * @returns {number} The byte length of the string.
             */
            Buffer.byteLength = function ( str, encoding ) {
                var ret;
                str = str + ''; // Coerce to string
                switch ( encoding || 'utf8' ) {
                    case 'hex':
                        ret = str.length / 2;
                        break;
                    case 'utf8':
                    case 'utf-8':
                        ret = utf8ToBytes( str ).length;
                        break;
                    case 'ascii':
                    case 'binary':
                    case 'raw':
                        ret = str.length;
                        break;
                    case 'base64':
                        ret = base64ToBytes( str ).length;
                        break;
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        ret = str.length * 2;
                        break;
                    default:
                        throw new Error( 'Unknown encoding' );
                }
                return ret;
            };


            /**
             * Concatenates an array of Buffer instances into a single Buffer.
             * @param {Array<Buffer>} list - An array of Buffer objects.
             * @param {number} [totalLength] - Optional total length of the concatenated buffer.
             * @returns {Buffer} A new Buffer containing the concatenated data.
             */
            Buffer.concat = function ( list, totalLength ) {
                assert( isArray( list ), 'Usage: Buffer.concat(list, [totalLength])\n' +
                    'list should be an Array.' );

                if ( list.length === 0 ) {
                    return new Buffer( 0 );
                } else if ( list.length === 1 ) {
                    // If only one buffer, return it directly
                    return list[ 0 ];
                }

                var i;
                // If totalLength is not provided, calculate it by summing lengths of all buffers
                if ( typeof totalLength !== 'number' ) {
                    totalLength = 0;
                    for ( i = 0; i < list.length; i++ ) {
                        totalLength += list[ i ].length;
                    }
                }

                var buf = new Buffer( totalLength ); // Create a new buffer of the calculated size
                var pos = 0; // Current position for writing
                for ( i = 0; i < list.length; i++ ) {
                    var item = list[ i ];
                    item.copy( buf, pos ); // Copy each buffer into the new one
                    pos += item.length;
                }
                return buf;
            };


            // BUFFER INSTANCE METHODS
            // =======================

            /**
             * Writes a hexadecimal string to the buffer.
             * @param {Buffer} buf - The target buffer.
             * @param {string} string - The hex string to write.
             * @param {number} offset - The offset in the buffer to start writing.
             * @param {number} length - The number of bytes to write.
             * @returns {number} The number of bytes written.
             * @private
             */
            function _hexWrite ( buf, string, offset, length ) {
                offset = Number( offset ) || 0;
                var remaining = buf.length - offset;

                if ( !length ) {
                    length = remaining;
                } else {
                    length = Number( length );
                    if ( length > remaining ) {
                        length = remaining;
                    }
                }

                // Hex strings must have an even number of digits
                var strLen = string.length;
                assert( strLen % 2 === 0, 'Invalid hex string' );

                if ( length > strLen / 2 ) {
                    length = strLen / 2;
                }

                var i;
                for ( i = 0; i < length; i++ ) {
                    var byte = parseInt( string.substr( i * 2, 2 ), 16 );
                    assert( !isNaN( byte ), 'Invalid hex string' );
                    buf[ offset + i ] = byte;
                }
                Buffer._charsWritten = i * 2; // Track how many characters from the string were processed
                return i; // Return number of bytes written
            }


            /**
             * Writes a UTF8 string to the buffer.
             * @param {Buffer} buf - The target buffer.
             * @param {string} string - The UTF8 string to write.
             * @param {number} offset - The offset in the buffer.
             * @param {number} length - The max number of bytes to write.
             * @returns {number} The number of bytes written.
             * @private
             */
            function _utf8Write ( buf, string, offset, length ) {
                var charsWritten = Buffer._charsWritten =
                    blitBuffer( utf8ToBytes( string ), buf, offset, length );
                return charsWritten;
            }


            /**
             * Writes an ASCII string to the buffer.
             * @param {Buffer} buf - The target buffer.
             * @param {string} string - The ASCII string to write.
             * @param {number} offset - The offset in the buffer.
             * @param {number} length - The max number of bytes to write.
             * @returns {number} The number of bytes written.
             * @private
             */
            function _asciiWrite ( buf, string, offset, length ) {
                var charsWritten = Buffer._charsWritten =
                    blitBuffer( asciiToBytes( string ), buf, offset, length );
                return charsWritten;
            }


            /**
             * Writes a binary string (same as ASCII) to the buffer.
             * @param {Buffer} buf - The target buffer.
             * @param {string} string - The binary string to write.
             * @param {number} offset - The offset in the buffer.
             * @param {number} length - The max number of bytes to write.
             * @returns {number} The number of bytes written.
             * @private
             */
            function _binaryWrite ( buf, string, offset, length ) {
                return _asciiWrite( buf, string, offset, length ); // Binary is treated as ASCII
            }


            /**
             * Writes a Base64 string to the buffer.
             * @param {Buffer} buf - The target buffer.
             * @param {string} string - The Base64 string to write.
             * @param {number} offset - The offset in the buffer.
             * @param {number} length - The max number of bytes to write.
             * @returns {number} The number of bytes written.
             * @private
             */
            function _base64Write ( buf, string, offset, length ) {
                var charsWritten = Buffer._charsWritten =
                    blitBuffer( base64ToBytes( string ), buf, offset, length );
                return charsWritten;
            }


            /**
             * Writes a UTF16-LE string to the buffer.
             * @param {Buffer} buf - The target buffer.
             * @param {string} string - The UTF16-LE string to write.
             * @param {number} offset - The offset in the buffer.
             * @param {number} length - The max number of bytes to write.
             * @returns {number} The number of bytes written.
             * @private
             */
            function _utf16leWrite ( buf, string, offset, length ) {
                var charsWritten = Buffer._charsWritten =
                    blitBuffer( utf16leToBytes( string ), buf, offset, length );
                return charsWritten;
            }


            /**
             * Writes a string to the buffer according to the specified encoding.
             * @param {string} string - The string to write.
             * @param {number} [offset] - The offset in the buffer to start writing.
             * @param {number} [length] - The maximum number of bytes to write.
             * @param {string} [encoding] - The encoding to use. Defaults to 'utf8'.
             * @returns {number} The number of bytes written.
             */
            Buffer.prototype.write = function ( string, offset, length, encoding ) {
                // This method supports two signature styles:
                // 1. (string, offset, length, encoding) - Node.js style
                // 2. (string, encoding, offset, length) - Legacy style
                if ( isFinite( offset ) ) {
                    if ( !isFinite( length ) ) {
                        encoding = length; // If length is not finite, it's the encoding
                        length = undefined; // Clear length
                    }
                } else {
                    // Legacy signature detected
                    var swap = encoding;
                    encoding = offset;
                    offset = length;
                    length = swap;
                }

                offset = Number( offset ) || 0;
                var remaining = this.length - offset; // Bytes remaining in the buffer from offset

                if ( !length ) {
                    length = remaining; // If length not specified, use all remaining space
                } else {
                    length = Number( length );
                    if ( length > remaining ) {
                        length = remaining; // Do not write beyond buffer bounds
                    }
                }
                encoding = String( encoding || 'utf8' ).toLowerCase();

                var ret;
                switch ( encoding ) {
                    case 'hex':
                        ret = _hexWrite( this, string, offset, length );
                        break;
                    case 'utf8':
                    case 'utf-8':
                        ret = _utf8Write( this, string, offset, length );
                        break;
                    case 'ascii':
                        ret = _asciiWrite( this, string, offset, length );
                        break;
                    case 'binary':
                        ret = _binaryWrite( this, string, offset, length );
                        break;
                    case 'base64':
                        ret = _base64Write( this, string, offset, length );
                        break;
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        ret = _utf16leWrite( this, string, offset, length );
                        break;
                    default:
                        throw new Error( 'Unknown encoding' );
                }
                return ret;
            };


            /**
             * Converts the buffer's contents to a string according to the specified encoding.
             * @param {string} [encoding] - The encoding to use. Defaults to 'utf8'.
             * @param {number} [start] - The byte offset to start reading. Defaults to 0.
             * @param {number} [end] - The byte offset to end reading (exclusive). Defaults to `buffer.length`.
             * @returns {string} The decoded string.
             */
            Buffer.prototype.toString = function ( encoding, start, end ) {
                var self = this;

                encoding = String( encoding || 'utf8' ).toLowerCase();
                start = Number( start ) || 0;
                end = ( end !== undefined ) ?
                    Number( end ) :
                    end = self.length; // If end is not provided, use the full buffer length

                // Fast path for empty strings
                if ( end === start ) {
                    return '';
                }

                var ret;
                switch ( encoding ) {
                    case 'hex':
                        ret = _hexSlice( self, start, end );
                        break;
                    case 'utf8':
                    case 'utf-8':
                        ret = _utf8Slice( self, start, end );
                        break;
                    case 'ascii':
                        ret = _asciiSlice( self, start, end );
                        break;
                    case 'binary':
                        ret = _binarySlice( self, start, end );
                        break;
                    case 'base64':
                        ret = _base64Slice( self, start, end );
                        break;
                    case 'ucs2':
                    case 'ucs-2':
                    case 'utf16le':
                    case 'utf-16le':
                        ret = _utf16leSlice( self, start, end );
                        break;
                    default:
                        throw new Error( 'Unknown encoding' );
                }
                return ret;
            };


            /**
             * Converts the Buffer to a JSON representation.
             * @returns {object} An object with `type: 'Buffer'` and `data: Array<number>`.
             */
            Buffer.prototype.toJSON = function () {
                return {
                    type: 'Buffer',
                    data: Array.prototype.slice.call( this._arr || this, 0 )
                };
            };


            /**
             * Copies data from a source Buffer to a target Buffer.
             * @param {Buffer} target - The target Buffer to copy into.
             * @param {number} [target_start=0] - The offset in the target Buffer to start writing.
             * @param {number} [start=0] - The offset in the source Buffer to start reading.
             * @param {number} [end=buffer.length] - The offset in the source Buffer to end reading (exclusive).
             */
            Buffer.prototype.copy = function ( target, target_start, start, end ) {
                var source = this;

                if ( !start ) start = 0;
                if ( !end && end !== 0 ) end = this.length;
                if ( !target_start ) target_start = 0;

                // If 0 bytes are to be copied, we are done.
                if ( end === start ) return;
                // If either buffer is empty, there's nothing to copy.
                if ( target.length === 0 || source.length === 0 ) return;

                // Assertions for valid input ranges
                assert( end >= start, 'sourceEnd < sourceStart' );
                assert( target_start >= 0 && target_start < target.length,
                    'targetStart out of bounds' );
                assert( start >= 0 && start < source.length, 'sourceStart out of bounds' );
                assert( end >= 0 && end <= source.length, 'sourceEnd out of bounds' );

                // Adjust `end` if it goes beyond the source buffer's length
                if ( end > this.length ) {
                    end = this.length;
                }
                // Adjust `end` if the copy would exceed the target buffer's capacity
                if ( target.length - target_start < end - start ) {
                    end = target.length - target_start + start;
                }

                var len = end - start; // Number of bytes to copy

                if ( len < 100 || !Buffer._useTypedArrays ) {
                    // For small copies or when not using Typed Arrays, use a manual loop
                    for ( var i = 0; i < len; i++ ) {
                        target[ i + target_start ] = this[ i + start ];
                    }
                } else {
                    // For larger copies with Typed Arrays, use the optimized `set` method
                    target._set( this.subarray( start, start + len ), target_start );
                }
            };


            /**
             * Slices a portion of the buffer.
             * @param {number} [start=0] - The byte offset to start slicing.
             * @param {number} [end=buffer.length] - The byte offset to end slicing (exclusive).
             * @returns {Buffer} A new Buffer that references the same memory as the original,
             *                   but offset and cropped by the `start` and `end` indices.
             */
            Buffer.prototype.slice = function ( start, end ) {
                var len = this.length;
                // Clamp start and end to be within valid buffer bounds
                start = clamp( start, len, 0 );
                end = clamp( end, len, len );

                if ( Buffer._useTypedArrays ) {
                    // If using Typed Arrays, leverage `subarray` for efficiency
                    return Buffer._augment( this.subarray( start, end ) );
                } else {
                    // Fallback for non-Typed Array environments
                    var sliceLen = end - start;
                    var newBuf = new Buffer( sliceLen, undefined, true ); // Create new buffer, no zero-fill
                    for ( var i = 0; i < sliceLen; i++ ) {
                        newBuf[ i ] = this[ i + start ];
                    }
                    return newBuf;
                }
            };


            // `get` will be removed in Node 0.13+
            Buffer.prototype.get = function ( offset ) {
                console.log( '.get() is deprecated. Access using array indexes instead.' );
                return this.readUInt8( offset );
            };


            // `set` will be removed in Node 0.13+
            Buffer.prototype.set = function ( v, offset ) {
                console.log( '.set() is deprecated. Access using array indexes instead.' );
                return this.writeUInt8( v, offset );
            };


            /**
             * Reads an unsigned 8-bit integer from the buffer at the specified offset.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The unsigned 8-bit integer.
             */
            Buffer.prototype.readUInt8 = function ( offset, noAssert ) {
                if ( !noAssert ) {
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset < this.length, 'Trying to read beyond buffer length' );
                }

                if ( offset >= this.length ) {
                    // If offset is out of bounds and noAssert is true, return undefined.
                    return;
                }

                return this[ offset ];
            };


            /**
             * Helper function to read a 16-bit unsigned integer, handling endianness.
             * @param {Buffer} buf - The buffer to read from.
             * @param {number} offset - The offset to start reading.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The 16-bit unsigned integer.
             * @private
             */
            function _readUInt16 ( buf, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( typeof littleEndian === 'boolean', 'missing or invalid endian' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 1 < buf.length, 'Trying to read beyond buffer length' );
                }

                var val = littleEndian ?
                    ( buf[ offset ] | ( buf[ offset + 1 ] << 8 ) ) :
                    ( ( buf[ offset ] << 8 ) | buf[ offset + 1 ] );
                return val;
            }


            /**
             * Reads an unsigned 16-bit integer (little-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The unsigned 16-bit little-endian integer.
             */
            Buffer.prototype.readUInt16LE = function ( offset, noAssert ) {
                return _readUInt16( this, offset, true, noAssert );
            };


            /**
             * Reads an unsigned 16-bit integer (big-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The unsigned 16-bit big-endian integer.
             */
            Buffer.prototype.readUInt16BE = function ( offset, noAssert ) {
                return _readUInt16( this, offset, false, noAssert );
            };


            /**
             * Helper function to read a 32-bit unsigned integer, handling endianness.
             * @param {Buffer} buf - The buffer to read from.
             * @param {number} offset - The offset to start reading.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The 32-bit unsigned integer.
             * @private
             */
            function _readUInt32 ( buf, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( typeof littleEndian === 'boolean', 'missing or invalid endian' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < buf.length, 'Trying to read beyond buffer length' );
                }

                var val = littleEndian ?
                    ( ( buf[ offset ] | ( buf[ offset + 1 ] << 8 ) | ( buf[ offset + 2 ] << 16 ) ) +
                        ( buf[ offset + 3 ] * 0x1000000 ) ) :
                    ( ( buf[ offset ] * 0x1000000 ) +
                        ( ( buf[ offset + 1 ] << 16 ) | ( buf[ offset + 2 ] << 8 ) | buf[ offset + 3 ] ) );
                return val;
            }


            /**
             * Reads an unsigned 32-bit integer (little-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The unsigned 32-bit little-endian integer.
             */
            Buffer.prototype.readUInt32LE = function ( offset, noAssert ) {
                return _readUInt32( this, offset, true, noAssert );
            };


            /**
             * Reads an unsigned 32-bit integer (big-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The unsigned 32-bit big-endian integer.
             */
            Buffer.prototype.readUInt32BE = function ( offset, noAssert ) {
                return _readUInt32( this, offset, false, noAssert );
            };


            /**
             * Reads a signed 8-bit integer from the buffer at the specified offset.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The signed 8-bit integer.
             */
            Buffer.prototype.readInt8 = function ( offset, noAssert ) {
                if ( !noAssert ) {
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset < this.length, 'Trying to read beyond buffer length' );
                }

                if ( offset >= this.length ) {
                    return;
                }

                var val = this[ offset ];
                // Convert to signed 8-bit
                if ( val & 0x80 ) { // If the most significant bit is set
                    val = ( 0xFF - val + 1 ) * -1;
                }
                return val;
            };


            /**
             * Helper function to read a 16-bit signed integer, handling endianness.
             * @param {Buffer} buf - The buffer to read from.
             * @param {number} offset - The offset to start reading.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The 16-bit signed integer.
             * @private
             */
            function _readInt16 ( buf, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( typeof littleEndian === 'boolean', 'missing or invalid endian' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 1 < buf.length, 'Trying to read beyond buffer length' );
                }

                var val = _readUInt16( buf, offset, littleEndian, true );
                // Convert to signed 16-bit
                if ( val & 0x8000 ) { // If the most significant bit is set
                    val = ( 0xFFFF - val + 1 ) * -1;
                }
                return val;
            }


            /**
             * Reads a signed 16-bit integer (little-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The signed 16-bit little-endian integer.
             */
            Buffer.prototype.readInt16LE = function ( offset, noAssert ) {
                return _readInt16( this, offset, true, noAssert );
            };


            /**
             * Reads a signed 16-bit integer (big-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The signed 16-bit big-endian integer.
             */
            Buffer.prototype.readInt16BE = function ( offset, noAssert ) {
                return _readInt16( this, offset, false, noAssert );
            };


            /**
             * Helper function to read a 32-bit signed integer, handling endianness.
             * @param {Buffer} buf - The buffer to read from.
             * @param {number} offset - The offset to start reading.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The 32-bit signed integer.
             * @private
             */
            function _readInt32 ( buf, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( typeof littleEndian === 'boolean', 'missing or invalid endian' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < buf.length, 'Trying to read beyond buffer length' );
                }

                var val = _readUInt32( buf, offset, littleEndian, true );
                // Convert to signed 32-bit
                if ( val & 0x80000000 ) { // If the most significant bit is set
                    val = ( 0xFFFFFFFF - val + 1 ) * -1;
                }
                return val;
            }


            /**
             * Reads a signed 32-bit integer (little-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The signed 32-bit little-endian integer.
             */
            Buffer.prototype.readInt32LE = function ( offset, noAssert ) {
                return _readInt32( this, offset, true, noAssert );
            };


            /**
             * Reads a signed 32-bit integer (big-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The signed 32-bit big-endian integer.
             */
            Buffer.prototype.readInt32BE = function ( offset, noAssert ) {
                return _readInt32( this, offset, false, noAssert );
            };


            /**
             * Reads a 32-bit float (little-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The 32-bit little-endian float.
             */
            Buffer.prototype.readFloatLE = function ( offset, noAssert ) {
                if ( !noAssert ) {
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < this.length, 'Trying to read beyond buffer length' );
                }

                return ieee754.read( this, offset, true, 23, 4 );
            };


            /**
             * Reads a 32-bit float (big-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The 32-bit big-endian float.
             */
            Buffer.prototype.readFloatBE = function ( offset, noAssert ) {
                if ( !noAssert ) {
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < this.length, 'Trying to read beyond buffer length' );
                }

                return ieee754.read( this, offset, false, 23, 4 );
            };


            /**
             * Reads a 64-bit double (little-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The 64-bit little-endian double.
             */
            Buffer.prototype.readDoubleLE = function ( offset, noAssert ) {
                if ( !noAssert ) {
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 7 < this.length, 'Trying to read beyond buffer length' );
                }

                return ieee754.read( this, offset, true, 52, 8 );
            };


            /**
             * Reads a 64-bit double (big-endian) from the buffer.
             * @param {number} offset - The offset to start reading from.
             * @param {boolean} [noAssert=false] - Set to true to skip offset validation.
             * @returns {number} The 64-bit big-endian double.
             */
            Buffer.prototype.readDoubleBE = function ( offset, noAssert ) {
                if ( !noAssert ) {
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 7 < this.length, 'Trying to read beyond buffer length' );
                }

                return ieee754.read( this, offset, false, 52, 8 );
            };


            /**
             * Writes an unsigned 8-bit integer to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 1.
             */
            Buffer.prototype.writeUInt8 = function ( value, offset, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset < this.length, 'offset is out of bounds' );
                    assert( value >= 0 && value <= 0xFF, 'value is out of bounds' );
                }

                this[ offset ] = value;
                return offset + 1;
            };


            /**
             * Helper function to write a 16-bit unsigned integer, handling endianness.
             * @param {Buffer} buf - The buffer to write to.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The offset plus 2.
             * @private
             */
            function _writeUInt16 ( buf, value, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 1 < buf.length, 'offset is out of bounds' );
                    assert( value >= 0 && value <= 0xFFFF, 'value is out of bounds' );
                }

                if ( littleEndian ) {
                    buf[ offset ] = value;
                    buf[ offset + 1 ] = ( value >>> 8 );
                } else {
                    buf[ offset ] = ( value >>> 8 );
                    buf[ offset + 1 ] = value;
                }
                return offset + 2;
            }


            /**
             * Writes an unsigned 16-bit integer (little-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 2.
             */
            Buffer.prototype.writeUInt16LE = function ( value, offset, noAssert ) {
                return _writeUInt16( this, value, offset, true, noAssert );
            };


            /**
             * Writes an unsigned 16-bit integer (big-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 2.
             */
            Buffer.prototype.writeUInt16BE = function ( value, offset, noAssert ) {
                return _writeUInt16( this, value, offset, false, noAssert );
            };


            /**
             * Helper function to write a 32-bit unsigned integer, handling endianness.
             * @param {Buffer} buf - The buffer to write to.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The offset plus 4.
             * @private
             */
            function _writeUInt32 ( buf, value, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < buf.length, 'offset is out of bounds' );
                    assert( value >= 0 && value <= 0xFFFFFFFF, 'value is out of bounds' );
                }

                if ( littleEndian ) {
                    buf[ offset ] = value;
                    buf[ offset + 1 ] = ( value >>> 8 );
                    buf[ offset + 2 ] = ( value >>> 16 );
                    buf[ offset + 3 ] = ( value >>> 24 );
                } else {
                    buf[ offset ] = ( value >>> 24 );
                    buf[ offset + 1 ] = ( value >>> 16 );
                    buf[ offset + 2 ] = ( value >>> 8 );
                    buf[ offset + 3 ] = value;
                }
                return offset + 4;
            }


            /**
             * Writes an unsigned 32-bit integer (little-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 4.
             */
            Buffer.prototype.writeUInt32LE = function ( value, offset, noAssert ) {
                return _writeUInt32( this, value, offset, true, noAssert );
            };


            /**
             * Writes an unsigned 32-bit integer (big-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 4.
             */
            Buffer.prototype.writeUInt32BE = function ( value, offset, noAssert ) {
                return _writeUInt32( this, value, offset, false, noAssert );
            };


            /**
             * Writes a signed 8-bit integer to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 1.
             */
            Buffer.prototype.writeInt8 = function ( value, offset, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset < this.length, 'offset is out of bounds' );
                    assert( value >= -128 && value <= 127, 'value is out of bounds' );
                }

                if ( value < 0 ) value = 0xFF + value + 1; // Convert negative to two's complement
                this[ offset ] = value;
                return offset + 1;
            };


            /**
             * Helper function to write a 16-bit signed integer, handling endianness.
             * @param {Buffer} buf - The buffer to write to.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The offset plus 2.
             * @private
             */
            function _writeInt16 ( buf, value, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 1 < buf.length, 'offset is out of bounds' );
                    assert( value >= -32768 && value <= 32767, 'value is out of bounds' );
                }

                if ( value < 0 ) value = 0xFFFF + value + 1; // Convert negative to two's complement
                _writeUInt16( buf, value, offset, littleEndian, true );
                return offset + 2;
            }


            /**
             * Writes a signed 16-bit integer (little-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 2.
             */
            Buffer.prototype.writeInt16LE = function ( value, offset, noAssert ) {
                return _writeInt16( this, value, offset, true, noAssert );
            };


            /**
             * Writes a signed 16-bit integer (big-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 2.
             */
            Buffer.prototype.writeInt16BE = function ( value, offset, noAssert ) {
                return _writeInt16( this, value, offset, false, noAssert );
            };


            /**
             * Helper function to write a 32-bit signed integer, handling endianness.
             * @param {Buffer} buf - The buffer to write to.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} littleEndian - True for little-endian, false for big-endian.
             * @param {boolean} noAssert - Skip validation if true.
             * @returns {number} The offset plus 4.
             * @private
             */
            function _writeInt32 ( buf, value, offset, littleEndian, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < buf.length, 'offset is out of bounds' );
                    assert( value >= -2147483648 && value <= 2147483647, 'value is out of bounds' );
                }

                if ( value < 0 ) value = 0xFFFFFFFF + value + 1; // Convert negative to two's complement
                _writeUInt32( buf, value, offset, littleEndian, true );
                return offset + 4;
            }


            /**
             * Writes a signed 32-bit integer (little-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 4.
             */
            Buffer.prototype.writeInt32LE = function ( value, offset, noAssert ) {
                return _writeInt32( this, value, offset, true, noAssert );
            };


            /**
             * Writes a signed 32-bit integer (big-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 4.
             */
            Buffer.prototype.writeInt32BE = function ( value, offset, noAssert ) {
                return _writeInt32( this, value, offset, false, noAssert );
            };


            /**
             * Writes a 32-bit float (little-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 4.
             */
            Buffer.prototype.writeFloatLE = function ( value, offset, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < this.length, 'buffer too small for value' );
                    assert( value >= -3.4028234663852886e+38 && value <= 3.4028234663852886e+38, 'value is out of bounds' );
                }

                ieee754.write( this, value, offset, true, 23, 4 );
                return offset + 4;
            };


            /**
             * Writes a 32-bit float (big-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 4.
             */
            Buffer.prototype.writeFloatBE = function ( value, offset, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 3 < this.length, 'buffer too small for value' );
                    assert( value >= -3.4028234663852886e+38 && value <= 3.4028234663852886e+38, 'value is out of bounds' );
                }

                ieee754.write( this, value, offset, false, 23, 4 );
                return offset + 4;
            };


            /**
             * Writes a 64-bit double (little-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 8.
             */
            Buffer.prototype.writeDoubleLE = function ( value, offset, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 7 < this.length, 'buffer too small for value' );
                    assert( value >= -1.7976931348623157E+308 && value <= 1.7976931348623157E+308, 'value is out of bounds' );
                }

                ieee754.write( this, value, offset, true, 52, 8 );
                return offset + 8;
            };


            /**
             * Writes a 64-bit double (big-endian) to the buffer.
             * @param {number} value - The value to write.
             * @param {number} offset - The offset to write to.
             * @param {boolean} [noAssert=false] - Set to true to skip validation.
             * @returns {number} The offset plus 8.
             */
            Buffer.prototype.writeDoubleBE = function ( value, offset, noAssert ) {
                if ( !noAssert ) {
                    assert( value !== undefined && value !== null, 'missing value' );
                    assert( offset !== undefined && offset !== null, 'missing offset' );
                    assert( offset + 7 < this.length, 'buffer too small for value' );
                    assert( value >= -1.7976931348623157E+308 && value <= 1.7976931348623157E+308, 'value is out of bounds' );
                }

                ieee754.write( this, value, offset, false, 52, 8 );
                return offset + 8;
            };


            // HELPER FUNCTIONS
            // ================

            /**
             * Trims whitespace from both ends of a string.
             * @param {string} str - The string to trim.
             * @returns {string} The trimmed string.
             * @private
             */
            function stringtrim ( str ) {
                if ( String.prototype.trim ) {
                    return str.trim();
                } else {
                    return str.replace( /^\s+|\s+$/g, '' ); // Fallback for older browsers
                }
            }


            /**
             * Coerces a value to a number. If it's not a number, returns 0.
             * Handles negative numbers by returning 0.
             * @param {*} val - The value to coerce.
             * @returns {number} The coerced non-negative number.
             * @private
             */
            function coerce ( val ) {
                val = Number( val );
                if ( isNaN( val ) ) {
                    return 0;
                }
                return val < 0 ? 0 : val;
            }


            /**
             * Determines if a value is an Array.
             * @param {*} arr - The value to test.
             * @returns {boolean} True if it's an Array, false otherwise.
             * @private
             */
            function isArray ( arr ) {
                return Object.prototype.toString.call( arr ) === '[object Array]';
            }


            /**
             * Determines if a value is "array-like" (has a numeric `length` property).
             * @param {*} arr - The value to test.
             * @returns {boolean} True if it's array-like, false otherwise.
             * @private
             */
            function isArrayish ( arr ) {
                return isArray( arr ) || Buffer.isBuffer( arr ) ||
                    arr && typeof arr === 'object' && typeof arr.length === 'number';
            }


            /**
             * Assertion function for validating conditions. Throws an error if condition is false.
             * @param {boolean} condition - The condition to assert.
             * @param {string} message - The error message if the condition is false.
             * @private
             */
            function assert ( condition, message ) {
                if ( !condition ) {
                    throw new Error( message || 'Assertion failed' );
                }
            }


            /**
             * Converts a UTF8 string to an array of bytes.
             * @param {string} str - The UTF8 string.
             * @returns {Array<number>} An array of byte values.
             * @private
             */
            function utf8ToBytes ( str ) {
                var bytes = [];
                for ( var i = 0; i < str.length; i++ ) {
                    var char = str.charCodeAt( i );
                    if ( char < 0x80 ) {
                        bytes.push( char );
                    } else if ( char < 0x800 ) {
                        bytes.push( ( char >> 6 ) | 0xC0, ( char & 0x3F ) | 0x80 );
                    } else if ( char < 0xD800 || char >= 0xE000 ) {
                        bytes.push( ( char >> 12 ) | 0xE0, ( ( char >> 6 ) & 0x3F ) | 0x80, ( char & 0x3F ) | 0x80 );
                    } else { // Surrogate pair
                        i++;
                        char = 0x10000 + ( ( char & 0x3FF ) << 10 ) | ( str.charCodeAt( i ) & 0x3FF );
                        bytes.push( ( char >> 18 ) | 0xF0, ( ( char >> 12 ) & 0x3F ) | 0x80, ( ( char >> 6 ) & 0x3F ) | 0x80, ( char & 0x3F ) | 0x80 );
                    }
                }
                return bytes;
            }


            /**
             * Converts an ASCII string to an array of bytes.
             * @param {string} str - The ASCII string.
             * @returns {Array<number>} An array of byte values.
             * @private
             */
            function asciiToBytes ( str ) {
                var bytes = [];
                for ( var i = 0; i < str.length; i++ ) {
                    // Only push back the lower 8 bits of the character code
                    bytes.push( str.charCodeAt( i ) & 0xFF );
                }
                return bytes;
            }


            /**
             * Converts a Base64 string to an array of bytes.
             * @param {string} str - The Base64 string.
             * @returns {Array<number>} An array of byte values.
             * @private
             */
            function base64ToBytes ( str ) {
                return base64.toByteArray( str );
            }


            /**
             * Converts a UTF16-LE string to an array of bytes.
             * @param {string} str - The UTF16-LE string.
             * @returns {Array<number>} An array of byte values.
             * @private
             */
            function utf16leToBytes ( str ) {
                var bytes = [];
                for ( var i = 0; i < str.length; i++ ) {
                    var code = str.charCodeAt( i );
                    bytes.push( code & 0xFF, code >>> 8 ); // Little-endian: low byte first, then high byte
                }
                return bytes;
            }


            /**
             * Decodes a URI-encoded UTF8 character sequence.
             * @param {string} str - The URI-encoded string.
             * @returns {string} The decoded string.
             * @private
             */
            function decodeUtf8Char ( str ) {
                try {
                    return decodeURIComponent( str );
                } catch ( err ) {
                    return String.fromCharCode( 0xFFFD ); // Replacement character for invalid sequences
                }
            }


            /**
             * Slices a portion of the buffer and converts it to a Base64 string.
             * @param {Buffer} buf - The buffer to slice.
             * @param {number} start - The start offset.
             * @param {number} end - The end offset.
             * @returns {string} The Base64 encoded string.
             * @private
             */
            function _base64Slice ( buf, start, end ) {
                if ( start === 0 && end === buf.length ) {
                    return base64.fromByteArray( buf );
                } else {
                    return base64.fromByteArray( buf.slice( start, end ) );
                }
            }


            /**
             * Slices a portion of the buffer and converts it to a UTF8 string.
             * @param {Buffer} buf - The buffer to slice.
             * @param {number} start - The start offset.
             * @param {number} end - The end offset.
             * @returns {string} The UTF8 decoded string.
             * @private
             */
            function _utf8Slice ( buf, start, end ) {
                var res = '';
                var tmp = '';
                end = Math.min( buf.length, end ); // Ensure end is within bounds

                for ( var i = start; i < end; i++ ) {
                    if ( buf[ i ] <= 0x7F ) {
                        // If it's a single-byte ASCII character
                        res += decodeUtf8Char( tmp ) + String.fromCharCode( buf[ i ] );
                        tmp = '';
                    } else {
                        // Accumulate multi-byte UTF-8 sequence
                        tmp += '%' + buf[ i ].toString( 16 );
                    }
                }

                return res + decodeUtf8Char( tmp ); // Decode any remaining multi-byte sequence
            }


            /**
             * Slices a portion of the buffer and converts it to an ASCII string.
             * @param {Buffer} buf - The buffer to slice.
             * @param {number} start - The start offset.
             * @param {number} end - The end offset.
             * @returns {string} The ASCII decoded string.
             * @private
             */
            function _asciiSlice ( buf, start, end ) {
                var ret = '';
                end = Math.min( buf.length, end ); // Ensure end is within bounds

                for ( var i = start; i < end; i++ ) {
                    ret += String.fromCharCode( buf[ i ] );
                }
                return ret;
            }


            /**
             * Slices a portion of the buffer and converts it to a binary string (same as ASCII).
             * @param {Buffer} buf - The buffer to slice.
             * @param {number} start - The start offset.
             * @param {number} end - The end offset.
             * @returns {string} The binary decoded string.
             * @private
             */
            function _binarySlice ( buf, start, end ) {
                return _asciiSlice( buf, start, end ); // Binary is treated as ASCII
            }


            /**
             * Slices a portion of the buffer and converts it to a hexadecimal string.
             * @param {Buffer} buf - The buffer to slice.
             * @param {number} start - The start offset.
             * @param {number} end - The end offset.
             * @returns {string} The hexadecimal string.
             * @private
             */
            function _hexSlice ( buf, start, end ) {
                var len = buf.length;

                if ( !start || start < 0 ) start = 0;
                if ( !end || end < 0 || end > len ) end = len;

                var out = '';
                for ( var i = start; i < end; i++ ) {
                    out += toHex( buf[ i ] );
                }
                return out;
            }


            /**
             * Slices a portion of the buffer and converts it to a UTF16-LE string.
             * @param {Buffer} buf - The buffer to slice.
             * @param {number} start - The start offset.
             * @param {number} end - The end offset.
             * @returns {string} The UTF16-LE decoded string.
             * @private
             */
            function _utf16leSlice ( buf, start, end ) {
                var bytes = buf.slice( start, end );
                var res = '';
                // Read two bytes at a time to form a 16-bit character code
                for ( var i = 0; i < bytes.length; i += 2 ) {
                    res += String.fromCharCode( bytes[ i ] + bytes[ i + 1 ] * 256 );
                }
                return res;
            }


            /**
             * Converts a byte value to its two-digit hexadecimal string representation.
             * @param {number} n - The byte value.
             * @returns {string} The hex string.
             * @private
             */
            function toHex ( n ) {
                if ( n < 16 ) return '0' + n.toString( 16 );
                return n.toString( 16 );
            }


            /**
             * Copies bytes from a source array to a target buffer, up to a specified length.
             * @param {Array<number>} src - Source array of bytes.
             * @param {Buffer} dst - Destination buffer.
             * @param {number} dstStart - Start offset in destination.
             * @param {number} length - Max number of bytes to copy.
             * @returns {number} The number of bytes copied.
             * @private
             */
            function blitBuffer ( src, dst, dstStart, length ) {
                var i;
                for ( i = 0; i < length && i < src.length; i++ ) {
                    dst[ dstStart + i ] = src[ i ];
                }
                return i;
            }


            /**
             * Clamps a value within a specified range [min, max].
             * @param {number} val - The value to clamp.
             * @param {number} max - The maximum allowed value.
             * @param {number} min - The minimum allowed value.
             * @returns {number} The clamped value.
             * @private
             */
            function clamp ( val, max, min ) {
                val = Number( val ) || 0;
                if ( val < min ) {
                    return min;
                } else if ( val > max ) {
                    return max;
                } else {
                    return val;
                }
            }


            /**
             * Checks if a value is a finite number.
             * @param {*} value - The value to check.
             * @returns {boolean} True if finite, false otherwise.
             * @private
             */
            function isFinite ( value ) {
                return typeof value === 'number' && value === value; // Check for NaN
            }


            // Augment TypedArray prototype if available
            // This adds Buffer-like methods to Uint8Array instances
            // only if `Buffer._useTypedArrays` is true.
            if ( Buffer._useTypedArrays ) {
                // Typed array polyfill
                var proto = Uint8Array.prototype;

                // Add _isBuffer property for Buffer.isBuffer check
                // This is needed because `instanceof Buffer` would not work for Uint8Array instances
                // that are created by the `Buffer` constructor.
                Buffer._augment = function ( buf ) {
                    buf._isBuffer = true;
                    return buf;
                };

                // Add Buffer methods to the Uint8Array prototype
                // Note: The original code does not explicitly add all methods to proto.
                // It likely augments instances directly or relies on a polyfill strategy
                // where Buffer is a subclass/wrapper.
                // The provided code snippet only includes `_augment` which sets `_isBuffer`.
                // A full Node.js Buffer emulation would involve more prototype additions.

                // Shim for `subarray` if not present (e.g., older Chrome)
                if ( typeof proto.subarray === 'undefined' ) {
                    proto.subarray = function ( start, end ) {
                        return new Uint8Array( this.slice( start, end ) );
                    };
                }

                // Add `_set` method for efficient copying from other TypedArrays
                // This is a common internal optimization in Node.js Buffer implementation.
                proto._set = function ( buf, offset ) {
                    if ( typeof offset !== 'number' ) {
                        offset = 0;
                    }
                    if ( buf.length + offset > this.length ) {
                        throw new Error( 'buffer too small for value' );
                    }
                    this.set( buf, offset );
                };
            }
        } ]
    }, {}, [ 1 ] ) // This specifies module 1 as the entry point.
)
} );