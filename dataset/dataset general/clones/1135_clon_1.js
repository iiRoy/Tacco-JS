/*
 * This is an immediately invoked function expression (IIFE)
 * designed to handle different module loading environments,
 * ensuring the library is available globally or via module systems.
 */
!function ( e ) {
    // Check for CommonJS environment (e.g., Node.js, Browserify)
    if ( "object" === typeof exports && "undefined" !== typeof module ) {
        module . exports = e();
    }
    // Check for Asynchronous Module Definition (AMD) environment (e.g., RequireJS)
    else if ( "function" === typeof define && define . amd ) {
        define( [], e );
    }
    // Fallback for global scope (e.g., browser window, web worker)
    else {
        var f; /* Variable to hold the global object */

        // Determine the global object based on environment
        "undefined" !== typeof window
            ? f = window
            : "undefined" !== typeof global
                ? f = global
                : "undefined" !== typeof self && ( f = self );

        f . AV = e(); // Attach the module's export to the global AV property
    }
}(
    /*
     * The function that generates the module's exports.
     * This is the entry point for the bundled code.
     */
    function () {
        // These variables are typically injected by Browserify or similar bundlers
        var define, module, exports;

        /*
         * This inner IIFE is a Browserify-style module loader.
         * It creates a custom `require` function.
         */
        return ( function e( t, n, r ) {

            // The core `require` function for this bundle
            function s( o, u ) {
                if ( !n[ o ] ) {
                    if ( !t[ o ] ) {
                        var a = typeof require === "function" && require;
                        if ( !u && a ) {
                            return a( o, !0 );
                        }
                        if ( i ) {
                            return i( o, !0 );
                        }
                        // If the module isn't found in the bundle or global scope
                        throw new Error( "Cannot find module '" + o + "'" );
                    }
                    var f = n[ o ] = {
                        exports: {}
                    };
                    t[ o ][ 0 ] . call( f . exports, function ( e ) {
                        var n = t[ o ][ 1 ][ e ];
                        return s( n ? n : e );
                    }, f, f . exports, e, t, n, r );
                }
                return n[ o ] . exports;
            }

            // Reference to global `require` if available
            var i = typeof require === "function" && require;

            // Initialize all required modules
            for ( var o = 0; o < r . length; o++ ) {
                s( r[ o ] );
            }

            return s; // Return the custom `require` function
        })
        ({
            /* Module definitions start here */

            // Module ID: 1
            1: [
                function ( _dereq_, module, exports ) {
                    var key, val, _ref;

                    // Load aurora_base and export its components
                    _ref = _dereq_( './src/aurora' );
                    for ( key in _ref ) {
                        val = _ref[ key ];
                        exports[ key ] = val;
                    }

                    // Require device modules, likely for registration or side effects
                    _dereq_( './src/devices/webaudio' );
                    _dereq_( './src/devices/mozilla' );
                },
                {
                    "./src/aurora": 3,
                    "./src/devices/mozilla": 22,
                    "./src/devices/webaudio": 24
                }
            ],

            // Module ID: 2 - Asset Class
            2: [
                function ( _dereq_, module, exports ) {
                    var Asset, BufferSource, Decoder, Demuxer, EventEmitter, FileSource, HTTPSource,
                        __bind = function ( fn, me ) {
                            /* Helper for binding context */
                            return function () {
                                return fn . apply( me, arguments );
                            };
                        },
                        __hasProp = {}.hasOwnProperty, /* Optimized hasOwnProperty check */
                        __extends = function ( child, parent ) {
                            /* Helper for class inheritance */
                            for ( var key in parent ) {
                                if ( __hasProp . call( parent, key ) ) {
                                    child[ key ] = parent[ key ];
                                }
                            }

                            function ctor() {
                                this . constructor = child;
                            }
                            ctor . prototype = parent . prototype;
                            child . prototype = new ctor();
                            child . __super__ = parent . prototype;
                            return child;
                        };

                    // Load dependencies for the Asset class
                    EventEmitter = _dereq_( './core/events' );
                    HTTPSource = _dereq_( './sources/node/http' );
                    FileSource = _dereq_( './sources/node/file' );
                    BufferSource = _dereq_( './sources/buffer' );
                    Demuxer = _dereq_( './demuxer' );
                    Decoder = _dereq_( './decoder' );

                    /*
                     * The Asset class represents a playable audio asset.
                     * It manages the source, demuxing, and decoding processes.
                     */
                    Asset = ( function ( _super ) {
                        __extends( Asset, _super );

                        // Constructor for Asset
                        function Asset( source ) {
                            this . source = source; /* The data source for the asset */

                            // Bind essential methods to the instance context
                            this . _decode = __bind( this . _decode, this );
                            this . findDecoder = __bind( this . findDecoder, this );
                            this . probe = __bind( this . probe, this );

                            // Initialize asset properties
                            this . buffered = 0;
                            this . duration = null;
                            this . format = null;
                            this . metadata = null;
                            this . active = false; // Indicates if the asset is currently being processed
                            this . demuxer = null;
                            this . decoder = null;

                            // Set up initial event listeners for the source
                            this . source . once( 'data', this . probe ); // Probe data on first chunk
                            this . source . on( 'error', ( function ( _this ) {
                                return function ( err ) {
                                    _this . emit( 'error', err );
                                    return _this . stop(); // Stop processing on error
                                };
                            })( this ) );
                            this . source . on( 'progress', ( function ( _this ) {
                                return function ( buffered ) {
                                    _this . buffered = buffered;
                                    return _this . emit( 'buffer', _this . buffered ); // Emit buffer progress
                                };
                            })( this ) );
                        }

                        // --- Static Factory Methods ---

                        /* Creates an Asset from a URL using HTTPSource */
                        Asset . fromURL = function ( url ) {
                            return new Asset( new HTTPSource( url ) );
                        };

                        /* Creates an Asset from a File using FileSource */
                        Asset . fromFile = function ( file ) {
                            return new Asset( new FileSource( file ) );
                        };

                        /* Creates an Asset from an existing Buffer using BufferSource */
                        Asset . fromBuffer = function ( buffer ) {
                            return new Asset( new BufferSource( buffer ) );
                        };

                        // --- Prototype Methods ---

                        /* Starts the asset processing */
                        Asset . prototype . start = function ( decode ) {
                            if ( this . active ) {
                                return; /* Do nothing if already active */
                            }
                            if ( decode != null ) {
                                this . shouldDecode = decode;
                            }
                            if ( this . shouldDecode == null ) {
                                this . shouldDecode = true;
                            }
                            this . active = true;
                            this . source . start(); /* Start the underlying data source */

                            if ( this . decoder && this . shouldDecode ) {
                                return this . _decode(); /* Begin decoding if a decoder is ready */
                            }
                        };

                        /* Stops the asset processing */
                        Asset . prototype . stop = function () {
                            if ( !this . active ) {
                                return; /* Do nothing if not active */
                            }
                            this . active = false;
                            return this . source . pause(); /* Pause the underlying data source */
                        };

                        /*
                         * Retrieves asset information (format, duration, metadata).
                         * If not available immediately, it starts the asset to get it.
                         */
                        Asset . prototype . get = function ( event, callback ) {
                            // Only specific events are supported here
                            if ( event !== 'format' && event !== 'duration' && event !== 'metadata' ) {
                                return;
                            }
                            if ( this[ event ] != null ) {
                                return callback( this[ event ] ); /* If data exists, return immediately */
                            } else {
                                // Otherwise, set a one-time listener and start to fetch data
                                this . once( event, ( function ( _this ) {
                                    return function ( value ) {
                                        _this . stop(); /* Stop once data is retrieved */
                                        return callback( value );
                                    };
                                })( this ) );
                                return this . start();
                            }
                        };

                        /* Decodes a single packet of audio data */
                        Asset . prototype . decodePacket = function () {
                            return this . decoder . decode();
                        };

                        /* Decodes the entire asset to a single Float32Array buffer */
                        Asset . prototype . decodeToBuffer = function ( callback ) {
                            var chunks, dataHandler, length;
                            length = 0;
                            chunks = [];

                            // Accumulate all decoded data chunks
                            this . on( 'data', dataHandler = function ( chunk ) {
                                length += chunk . length;
                                return chunks . push( chunk );
                            } );

                            // Once decoding is complete, combine chunks and call back
                            this . once( 'end', function () {
                                var buf, chunk, offset, _i, _len;
                                buf = new Float32Array( length );
                                offset = 0;
                                for ( _i = 0, _len = chunks . length; _i < _len; _i++ ) {
                                    chunk = chunks[ _i ];
                                    buf . set( chunk, offset );
                                    offset += chunk . length;
                                }
                                this . off( 'data', dataHandler ); /* Clean up listener */
                                return callback( buf );
                            } );
                            return this . start(); /* Start the decoding process */
                        };

                        /*
                         * Probes the initial data chunk to find a suitable demuxer.
                         * This method is called once the first 'data' event is received.
                         */
                        Asset . prototype . probe = function ( chunk ) {
                            var demuxer;
                            if ( !this . active ) {
                                return; /* Only probe if asset is active */
                            }
                            demuxer = Demuxer . find( chunk ); // Try to find a demuxer for the chunk
                            if ( !demuxer ) {
                                return this . emit( 'error', 'A demuxer for this container was not found.' );
                            }

                            this . demuxer = new demuxer( this . source, chunk );
                            this . demuxer . on( 'format', this . findDecoder ); // Set up format listener
                            this . demuxer . on( 'duration', ( function ( _this ) {
                                return function ( duration ) {
                                    _this . duration = duration;
                                    return _this . emit( 'duration', _this . duration );
                                };
                            })( this ) );
                            this . demuxer . on( 'metadata', ( function ( _this ) {
                                return function ( metadata ) {
                                    _this . metadata = metadata;
                                    return _this . emit( 'metadata', _this . metadata );
                                };
                            })( this ) );
                            return this . demuxer . on( 'error', ( function ( _this ) {
                                return function ( err ) {
                                    _this . emit( 'error', err );
                                    return _this . stop();
                                };
                            })( this ) );
                        };

                        /*
                         * Finds and initializes a decoder once the audio format is determined by the demuxer.
                         */
                        Asset . prototype . findDecoder = function ( format ) {
                            var decoder, div;
                            this . format = format;
                            if ( !this . active ) {
                                return; /* Only find decoder if active */
                            }
                            this . emit( 'format', this . format ); // Emit the discovered format

                            decoder = Decoder . find( this . format . formatID ); // Find decoder by format ID
                            if ( !decoder ) {
                                return this . emit( 'error', "A decoder for " + this . format . formatID + " was not found." );
                            }

                            this . decoder = new decoder( this . demuxer, this . format );

                            // Configure data handling based on audio format (floating point or integer)
                            if ( this . format . floatingPoint ) {
                                this . decoder . on( 'data', ( function ( _this ) {
                                    return function ( buffer ) {
                                        return _this . emit( 'data', buffer ); // Emit raw buffer if floating point
                                    };
                                })( this ) );
                            } else {
                                // Convert integer samples to floating point if not already
                                div = Math . pow( 2, this . format . bitsPerChannel - 1 );
                                this . decoder . on( 'data', ( function ( _this ) {
                                    return function ( buffer ) {
                                        var buf, i, sample, _i, _len;
                                        buf = new Float32Array( buffer . length );
                                        for ( i = _i = 0, _len = buffer . length; _i < _len; i = ++_i ) {
                                            sample = buffer[ i ];
                                            buf[ i ] = sample / div; /* Normalize sample to -1.0 to 1.0 */
                                        }
                                        return _this . emit( 'data', buf );
                                    };
                                })( this ) );
                            }

                            // Set up error and end event listeners for the decoder
                            this . decoder . on( 'error', ( function ( _this ) {
                                return function ( err ) {
                                    _this . emit( 'error', err );
                                    return _this . stop();
                                };
                            })( this ) );
                            this . decoder . on( 'end', ( function ( _this ) {
                                return function () {
                                    return _this . emit( 'end' );
                                };
                            })( this ) );

                            this . emit( 'decodeStart' ); // Signal that decoding has started

                            if ( this . shouldDecode ) {
                                return this . _decode(); /* Initiate the decoding loop */
                            }
                        };

                        /* Internal method to handle the continuous decoding process */
                        Asset . prototype . _decode = function () {
                            // Decode packets as long as they are available and the asset is active
                            while ( this . decoder . decode() && this . active ) {
                                continue; /* Keep looping */
                            }
                            // If still active, wait for more data to become available for decoding
                            if ( this . active ) {
                                return this . decoder . once( 'data', this . _decode );
                            }
                        };

                        return Asset; // The Asset class is returned
                    })( EventEmitter ); /* Asset extends EventEmitter */

                    module . exports = Asset; // Export the Asset class
                },
                {
                    "./core/events": 9,
                    "./decoder": 12,
                    "./demuxer": 15,
                    "./sources/buffer": 32,
                    "./sources/node/file": 30,
                    "./sources/node/http": 31
                }
            ],

            // Module ID: 3 - Aurora Main Export
            3: [
                function ( _dereq_, module, exports ) {
                    var key, val, _ref;

                    // Export all members from aurora_base
                    _ref = _dereq_( './aurora_base' );
                    for ( key in _ref ) {
                        val = _ref[ key ];
                        exports[ key ] = val;
                    }

                    // Require various demuxers to register them with the Demuxer factory
                    _dereq_( './demuxers/caf' );
                    _dereq_( './demuxers/m4a' );
                    _dereq_( './demuxers/aiff' );
                    _dereq_( './demuxers/wave' );
                    _dereq_( './demuxers/au' );

                    // Require various decoders to register them with the Decoder factory
                    _dereq_( './decoders/lpcm' );
                    _dereq_( './decoders/xlaw' );
                },
                {
                    "./aurora_base": 4,
                    "./decoders/lpcm": 13,
                    "./decoders/xlaw": 14,
                    "./demuxers/aiff": 16,
                    "./demuxers/au": 17,
                    "./demuxers/caf": 18,
                    "./demuxers/m4a": 19,
                    "./demuxers/wave": 20
                }
            ],

            // Module ID: 4 - Aurora Base Components
            4: [
                function ( _dereq_, module, exports ) {
                    // Export fundamental utility classes and interfaces
                    exports . Base = _dereq_( './core/base' );
                    exports . Buffer = _dereq_( './core/buffer' );
                    exports . BufferList = _dereq_( './core/bufferlist' );
                    exports . Stream = _dereq_( './core/stream' );
                    exports . Bitstream = _dereq_( './core/bitstream' );
                    exports . EventEmitter = _dereq_( './core/events' );
                    exports . UnderflowError = _dereq_( './core/underflow' );

                    // Export source implementations
                    exports . HTTPSource = _dereq_( './sources/node/http' );
                    exports . FileSource = _dereq_( './sources/node/file' );
                    exports . BufferSource = _dereq_( './sources/buffer' );

                    // Export core audio processing components
                    exports . Demuxer = _dereq_( './demuxer' );
                    exports . Decoder = _dereq_( './decoder' );
                    exports . AudioDevice = _dereq_( './device' );
                    exports . Asset = _dereq_( './asset' );
                    exports . Player = _dereq_( './player' );
                    exports . Filter = _dereq_( './filter' );

                    // Export specific filter implementations
                    exports . VolumeFilter = _dereq_( './filters/volume' );
                    exports . BalanceFilter = _dereq_( './filters/balance' );
                },
                {
                    "./asset": 2,
                    "./core/base": 5,
                    "./core/bitstream": 6,
                    "./core/buffer": 7,
                    "./core/bufferlist": 8,
                    "./core/events": 9,
                    "./core/stream": 10,
                    "./core/underflow": 11,
                    "./decoder": 12,
                    "./demuxer": 15,
                    "./device": 21,
                    "./filter": 25,
                    "./filters/balance": 26,
                    "./filters/volume": 27,
                    "./player": 28,
                    "./sources/buffer": 32,
                    "./sources/node/file": 30,
                    "./sources/node/http": 31
                }
            ],

            // Module ID: 5 - Base Class for Inheritance
            5: [
                function ( _dereq_, module, exports ) {
                    var Base,
                        __hasProp = {}.hasOwnProperty,
                        __extends = function ( child, parent ) {
                            /* Helper function for CoffeeScript-style class inheritance */
                            for ( var key in parent ) {
                                if ( __hasProp . call( parent, key ) ) {
                                    child[ key ] = parent[ key ];
                                }
                            }

                            function ctor() {
                                this . constructor = child;
                            }
                            ctor . prototype = parent . prototype;
                            child . prototype = new ctor();
                            child . __super__ = parent . prototype;
                            return child;
                        },
                        __indexOf = [].indexOf || function ( item ) {
                            /* Polyfill for Array.prototype.indexOf */
                            for ( var i = 0, l = this . length; i < l; i++ ) {
                                if ( i in this && this[ i ] === item ) {
                                    return i;
                                }
                            }
                            return -1;
                        };

                    /*
                     * The Base class provides a simple `extend` mechanism
                     * for creating inheritable classes.
                     */
                    Base = ( function () {
                        var fnTest;

                        function Base() {
                            // Default constructor for the Base class
                        }

                        fnTest = /\b_super\b/; // Regular expression to detect calls to `this._super`

                        /*
                         * Static method to extend the current class.
                         * Allows for traditional inheritance and method overriding with `_super`.
                         */
                        Base . extend = function ( prop ) {
                            var Class, fn, key, keys, _ref, _super;

                            // Create a new class that extends the current one
                            Class = ( function ( _super ) {
                                __extends( Class, _super );

                                function Class() {
                                    return Class . __super__ . constructor . apply( this, arguments );
                                }

                                return Class;
                            })( this ); // 'this' refers to the parent class being extended

                            // Handle cases where 'prop' is a function for dynamic extension
                            if ( typeof prop === 'function' ) {
                                keys = Object . keys( Class . prototype );
                                prop . call( Class, Class );
                                prop = {};
                                _ref = Class . prototype;
                                for ( key in _ref ) {
                                    fn = _ref[ key ];
                                    if ( __indexOf . call( keys, key ) < 0 ) {
                                        prop[ key ] = fn;
                                    }
                                }
                            }

                            _super = Class . __super__; // Store reference to the parent's prototype

                            // Add properties/methods to the new class's prototype
                            for ( key in prop ) {
                                fn = prop[ key ];
                                // If the property is a function and uses `_super`, wrap it
                                if ( typeof fn === 'function' && fnTest . test( fn ) ) {
                                    ( function ( key, fn ) {
                                        return Class . prototype[ key ] = function () {
                                            var ret, tmp;
                                            tmp = this . _super; // Save current `_super` reference
                                            this . _super = _super[ key ]; // Set `_super` to the parent's method
                                            ret = fn . apply( this, arguments ); // Call the new method
                                            this . _super = tmp; // Restore original `_super`
                                            return ret;
                                        };
                                    })( key, fn );
                                } else {
                                    // Otherwise, simply assign the property
                                    Class . prototype[ key ] = fn;
                                }
                            }
                            return Class; // Return the newly created extended class
                        };

                        return Base; // The Base class constructor is returned
                    })();

                    module . exports = Base; // Export the Base class
                },
                {}
            ],

            // Module ID: 6 - Bitstream Class
            6: [
                function ( _dereq_, module, exports ) {
                    var Bitstream;

                    /*
                     * The Bitstream class provides methods for reading data bit by bit
                     * from an underlying Stream object.
                     */
                    Bitstream = ( function () {
                        function Bitstream( stream ) {
                            this . stream = stream; /* The underlying byte stream */
                            this . bitPosition = 0; /* Current bit offset within the current byte (0-7) */
                        }

                        /* Creates a deep copy of the Bitstream instance */
                        Bitstream . prototype . copy = function () {
                            var result;
                            result = new Bitstream( this . stream . copy() );
                            result . bitPosition = this . bitPosition;
                            return result;
                        };

                        /* Returns the current absolute bit offset from the start of the stream */
                        Bitstream . prototype . offset = function () {
                            return 8 * this . stream . offset + this . bitPosition;
                        };

                        /* Checks if a certain number of bits are available to read */
                        Bitstream . prototype . available = function ( bits ) {
                            // Convert requested bits into bytes, accounting for current bit position
                            return this . stream . available( ( bits + 8 - this . bitPosition ) / 8 );
                        };

                        /* Advances the bitstream by a specified number of bits */
                        Bitstream . prototype . advance = function ( bits ) {
                            var pos;
                            pos = this . bitPosition + bits;
                            this . stream . advance( pos >> 3 ); // Advance by full bytes
                            return this . bitPosition = pos & 7; // Update remaining bit position
                        };

                        /* Rewinds the bitstream by a specified number of bits */
                        Bitstream . prototype . rewind = function ( bits ) {
                            var pos;
                            pos = this . bitPosition - bits;
                            this . stream . rewind( Math . abs( pos >> 3 ) ); // Rewind by full bytes
                            return this . bitPosition = pos & 7; // Update remaining bit position
                        };

                        /* Seeks to an absolute bit offset in the stream */
                        Bitstream . prototype . seek = function ( offset ) {
                            var curOffset;
                            curOffset = this . offset();
                            if ( offset > curOffset ) {
                                return this . advance( offset - curOffset );
                            } else if ( offset < curOffset ) {
                                return this . rewind( curOffset - offset );
                            }
                            // If offset equals curOffset, do nothing.
                        };

                        /* Aligns the bitstream to the next byte boundary */
                        Bitstream . prototype . align = function () {
                            if ( this . bitPosition !== 0 ) {
                                this . bitPosition = 0;
                                return this . stream . advance( 1 ); // Move to the next byte
                            }
                        };

                        /*
                         * Reads a specified number of bits from the stream, advancing the pointer.
                         * Can read signed or unsigned integers.
                         */
                        Bitstream . prototype . read = function ( bits, signed ) {
                            var a, a0, a1, a2, a3, a4, mBits;
                            if ( bits === 0 ) {
                                return 0;
                            }
                            mBits = bits + this . bitPosition; // Total bits needed for read including current bit pos

                            // Optimized reading based on the total number of bits required
                            if ( mBits <= 8 ) {
                                a = ( ( this . stream . peekUInt8() << this . bitPosition ) & 0xff ) >>> ( 8 - bits );
                            } else if ( mBits <= 16 ) {
                                a = ( ( this . stream . peekUInt16() << this . bitPosition ) & 0xffff ) >>> ( 16 - bits );
                            } else if ( mBits <= 24 ) {
                                a = ( ( this . stream . peekUInt24() << this . bitPosition ) & 0xffffff ) >>> ( 24 - bits );
                            } else if ( mBits <= 32 ) {
                                a = ( this . stream . peekUInt32() << this . bitPosition ) >>> ( 32 - bits );
                            } else if ( mBits <= 40 ) {
                                // For 40-bit reads, combine multiple 8-bit reads
                                a0 = this . stream . peekUInt8( 0 ) * 0x0100000000;
                                a1 = this . stream . peekUInt8( 1 ) << 24 >>> 0;
                                a2 = this . stream . peekUInt8( 2 ) << 16;
                                a3 = this . stream . peekUInt8( 3 ) << 8;
                                a4 = this . stream . peekUInt8( 4 );
                                a = a0 + a1 + a2 + a3 + a4;
                                a %= Math . pow( 2, 40 - this . bitPosition );
                                a = Math . floor( a / Math . pow( 2, 40 - this . bitPosition - bits ) );
                            } else {
                                throw new Error( "Too many bits!" ); // Currently unsupported bit length
                            }

                            // Handle signed conversion if `signed` flag is true
                            if ( signed ) {
                                if ( mBits < 32 ) {
                                    if ( a >>> ( bits - 1 ) ) {
                                        a = ( ( 1 << bits >>> 0 ) - a ) * -1;
                                    }
                                } else {
                                    if ( a / Math . pow( 2, bits - 1 ) | 0 ) {
                                        a = ( Math . pow( 2, bits ) - a ) * -1;
                                    }
                                }
                            }
                            this . advance( bits ); // Move the stream pointer forward
                            return a;
                        };

                        /*
                         * Peeks at a specified number of bits from the stream without advancing the pointer.
                         * Can peek signed or unsigned integers.
                         */
                        Bitstream . prototype . peek = function ( bits, signed ) {
                            var a, a0, a1, a2, a3, a4, mBits;
                            if ( bits === 0 ) {
                                return 0;
                            }
                            mBits = bits + this . bitPosition; // Total bits for peek including current bit pos

                            // Similar logic to `read`, but without calling `advance`
                            if ( mBits <= 8 ) {
                                a = ( ( this . stream . peekUInt8() << this . bitPosition ) & 0xff ) >>> ( 8 - bits );
                            } else if ( mBits <= 16 ) {
                                a = ( ( this . stream . peekUInt16() << this . bitPosition ) & 0xffff ) >>> ( 16 - bits );
                            } else if ( mBits <= 24 ) {
                                a = ( ( this . stream . peekUInt24() << this . bitPosition ) & 0xffffff ) >>> ( 24 - bits );
                            } else if ( mBits <= 32 ) {
                                a = ( this . stream . peekUInt32() << this . bitPosition ) >>> ( 32 - bits );
                            } else if ( mBits <= 40 ) {
                                a0 = this . stream . peekUInt8( 0 ) * 0x0100000000;
                                a1 = this . stream . peekUInt8( 1 ) << 24 >>> 0;
                                a2 = this . stream . peekUInt8( 2 ) << 16;
                                a3 = this . stream . peekUInt8( 3 ) << 8;
                                a4 = this . stream . peekUInt8( 4 );
                                a = a0 + a1 + a2 + a3 + a4;
                                a %= Math . pow( 2, 40 - this . bitPosition );
                                a = Math . floor( a / Math . pow( 2, 40 - this . bitPosition - bits ) );
                            } else {
                                throw new Error( "Too many bits!" );
                            }

                            // Handle signed conversion for peeked value
                            if ( signed ) {
                                if ( mBits < 32 ) {
                                    if ( a >>> ( bits - 1 ) ) {
                                        a = ( ( 1 << bits >>> 0 ) - a ) * -1;
                                    }
                                } else {
                                    if ( a / Math . pow( 2, bits - 1 ) | 0 ) {
                                        a = ( Math . pow( 2, bits ) - a ) * -1;
                                    }
                                }
                            }
                            return a;
                        };

                        return Bitstream; // The Bitstream class is returned
                    })();

                    module . exports = Bitstream; // Export the Bitstream class
                },
                {}
            ]
            /* ... additional modules would follow here ... */
            // The provided code snippet ends at module 6. I've only cloned up to that point.
        });
    }
);