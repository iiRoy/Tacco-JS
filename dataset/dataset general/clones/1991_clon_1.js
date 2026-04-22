( function ( ) {
  /*
   * This section handles UTF-8 encoding and decoding operations.
   * It uses standard JavaScript functions for conversion between
   * UTF-8 and internal JavaScript string representations.
   */
  var decodeUTF8 = function ( s ) {
    // Decodes a UTF-8 encoded string.
    // First, escape the string to handle non-ASCII characters,
    // then decode the URI component.
    return decodeURIComponent( escape( s ) ) ;
  } ;


  var encodeUTF8 = function ( s ) {
    // Encodes a string into UTF-8 format.
    // First, encode the URI component, then unescape it.
    return unescape( encodeURIComponent( s ) ) ;
  } ;


  /*
   * Boolean processing routines.
   * These functions pack and unpack arrays of boolean values
   * into and from a single 8-bit byte.
   */
  var unpackBoolean = function ( binary ) {
    // Unpacks 8 boolean values from a single byte.
    // Each bit in the byte represents a boolean.
    var x = unpack8( binary ) ;
    return [
      !! ( x & 1 )  , /* Bit 0 */
      !! ( x & 2 )  , /* Bit 1 */
      !! ( x & 4 )  , /* Bit 2 */
      !! ( x & 8 )  , /* Bit 3 */
      !! ( x & 16 ) , /* Bit 4 */
      !! ( x & 32 ) , /* Bit 5 */
      !! ( x & 64 ) , /* Bit 6 */
      !! ( x & 128 )  /* Bit 7 */
    ] ;
  } ;


  var packBoolean = function ( val , binary ) {
    // Packs an array of 8 boolean values into a single byte.
    // Each boolean contributes a bit to the final byte.
    pack8(
      val[0] | ( val[1] << 1 ) | ( val[2] << 2 ) | ( val[3] << 3 ) |
      ( val[4] << 4 ) | ( val[5] << 5 ) | ( val[6] << 6 ) | ( val[7] << 7 ) ,
      binary
    ) ;
  } ;


  /*
   * Nibble processing routines.
   * A nibble is a 4-bit unit. These functions pack and unpack
   * two nibbles into and from a single 8-bit byte.
   */
  var unpackNibble = function ( binary ) {
    // Unpacks two 4-bit nibbles from an 8-bit byte.
    // The higher 4 bits form the first nibble, lower 4 bits the second.
    var x = unpack8( binary ) ;
    return [ x >> 4 , x & 0x0f ] ;
  } ;


  var packNibble = function ( val , binary ) {
    // Packs two nibbles (each 4-bit) into a single 8-bit byte.
    // The first nibble goes into the higher 4 bits, the second into the lower 4 bits.
    pack8( ( val[0] << 4 ) | val[1] , binary ) ;
  } ;


  /*
   * 8-bit integer processing routines.
   * Includes signed conversion, unpacking, and packing of 8-bit values.
   */
  var sign8 = function ( i ) {
    // Converts an unsigned 8-bit integer to a signed 8-bit integer.
    return ( i + 0x80 ) % 0x100 - 0x80 ;
  } ;


  var unpack8 = function ( binary ) {
    // Unpacks a single 8-bit byte from the binary stream.
    // Increments the offset after reading.
    return binary.array[ binary.offset++ ] ;
  } ;


  var pack8 = function ( val , binary ) {
    // Packs a single 8-bit byte into the binary stream.
    // Only the lower 8 bits are stored. Increments the offset.
    binary.array[ binary.offset++ ] = val & 0xff ;
  } ;


  /*
   * 16-bit integer processing routines.
   * Supports both little-endian ('l') and big-endian ('b') byte orders,
   * along with signed conversion.
   */
  var sign16 = function ( i ) {
    // Converts an unsigned 16-bit integer to a signed 16-bit integer.
    return ( i + 0x8000 ) % 0x10000 - 0x8000 ;
  } ;


  var unpack16l = function ( binary ) {
    // Unpacks a 16-bit little-endian unsigned integer.
    // Reads least significant byte first.
    var val = binary.array[ binary.offset++ ] ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation
    return val ;
  } ;


  var pack16l = function ( val , binary ) {
    // Packs a 16-bit little-endian integer.
    // Writes least significant byte first.
    binary.array[ binary.offset++ ] = val & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
  } ;


  var unpack16b = function ( binary ) {
    // Unpacks a 16-bit big-endian unsigned integer.
    // Reads most significant byte first.
    var val = binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation
    return val ;
  } ;


  var pack16b = function ( val , binary ) {
    // Packs a 16-bit big-endian integer.
    // Writes most significant byte first.
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = val & 0xff ;
  } ;


  /*
   * 24-bit integer processing routines.
   * Supports both little-endian ('l') and big-endian ('b') byte orders,
   * along with signed conversion.
   */
  var sign24 = function ( i ) {
    // Converts an unsigned 24-bit integer to a signed 24-bit integer.
    return ( i + 0x800000 ) % 0x1000000 - 0x800000 ;
  } ;


  var unpack24l = function ( binary ) {
    // Unpacks a 24-bit little-endian unsigned integer.
    // Reads bytes from least significant to most significant.
    var val = binary.array[ binary.offset++ ] ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation
    return val ;
  } ;


  var pack24l = function ( val , binary ) {
    // Packs a 24-bit little-endian integer.
    // Writes bytes from least significant to most significant.
    binary.array[ binary.offset++ ] = val & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
  } ;


  var unpack24b = function ( binary ) {
    // Unpacks a 24-bit big-endian unsigned integer.
    // Reads bytes from most significant to least significant.
    var val = binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation
    return val ;
  } ;


  var pack24b = function ( val , binary ) {
    // Packs a 24-bit big-endian integer.
    // Writes bytes from most significant to least significant.
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = val & 0xff ;
  } ;


  /*
   * 32-bit integer processing routines.
   * Supports both little-endian ('l') and big-endian ('b') byte orders,
   * along with signed conversion.
   */
  var sign32 = function ( i ) {
    // Converts an unsigned 32-bit integer to a signed 32-bit integer.
    return ( i + 0x80000000 ) % 0x100000000 - 0x80000000 ;
  } ;


  var unpack32l = function ( binary ) {
    // Unpacks a 32-bit little-endian unsigned integer.
    // Reads bytes from least significant to most significant.
    var val = binary.array[ binary.offset++ ] ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 24 ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation
    return val ;
  } ;


  var pack32l = function ( val , binary ) {
    // Packs a 32-bit little-endian integer.
    // Writes bytes from least significant to most significant.
    binary.array[ binary.offset++ ] = val & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 24 ) & 0xff ;
  } ;


  var unpack32b = function ( binary ) {
    // Unpacks a 32-bit big-endian unsigned integer.
    // Reads bytes from most significant to least significant.
    var val = binary.array[ binary.offset++ ] << 24 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation
    return val ;
  } ;


  var pack32b = function ( val , binary ) {
    // Packs a 32-bit big-endian integer.
    // Writes bytes from most significant to least significant.
    binary.array[ binary.offset++ ] = ( val >> 24 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = val & 0xff ;
  } ;


  /*
   * 40-bit integer processing routines.
   * Due to JavaScript's 32-bit bitwise operations limit,
   * these routines handle larger numbers using multiplication
   * and addition for the higher bits.
   * Supports little-endian ('l') and big-endian ('b') byte orders.
   */
  var sign40 = function ( i ) {
    // Converts an unsigned 40-bit integer to a signed 40-bit integer.
    return ( i + 0x8000000000 ) % 0x10000000000 - 0x8000000000 ;
  } ;


  var unpack40l = function ( binary ) {
    // Unpacks a 40-bit little-endian unsigned integer.
    // First 4 bytes form the lower 32 bits, the 5th byte is the higher 8 bits.
    var val = binary.array[ binary.offset++ ] ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 24 ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation for the lower part
    val += binary.array[ binary.offset++ ] * 0x100000000 ; // Add the 5th byte (higher 8 bits)
    return val ;
  } ;


  var pack40l = function ( val , binary ) {
    // Packs a 40-bit little-endian integer.
    // Writes the lower 32 bits first, then the higher 8 bits.
    binary.array[ binary.offset++ ] = val & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 24 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val / 0x100000000 ) & 0xff ; // Extract the 5th byte
  } ;


  var unpack40b = function ( binary ) {
    // Unpacks a 40-bit big-endian unsigned integer.
    // The first byte is the higher 8 bits, followed by the lower 32 bits.
    var head = binary.array[ binary.offset++ ] * 0x100000000 ; // Read the 5th byte (higher 8 bits)
    var val = binary.array[ binary.offset++ ] << 24 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] ;
    val >>>= 0 ; // Ensure unsigned 32-bit representation for the lower part
    val += head ; // Combine with the higher bits
    return val ;
  } ;


  var pack40b = function ( val , binary ) {
    // Packs a 40-bit big-endian integer.
    // Writes the higher 8 bits first, then the lower 32 bits.
    binary.array[ binary.offset++ ] = ( val / 0x100000000 ) & 0xff ; // Write the 5th byte
    binary.array[ binary.offset++ ] = ( val >> 24 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = val & 0xff ;
  } ;


  /*
   * 48-bit integer processing routines.
   * Similar to 40-bit, these handle numbers larger than 32 bits
   * by splitting them into parts that fit within JavaScript's number limits.
   * Supports little-endian ('l') and big-endian ('b') byte orders.
   */
  var sign48 = function ( i ) {
    // Converts an unsigned 48-bit integer to a signed 48-bit integer.
    return ( i + 0x800000000000 ) % 0x1000000000000 - 0x800000000000 ;
  } ;


  var unpack48l = function ( binary ) {
    // Unpacks a 48-bit little-endian unsigned integer.
    // The first 4 bytes are the lowest 32 bits, then two more bytes for higher bits.
    var val = binary.array[ binary.offset++ ] ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 24 ;
    val >>>= 0 ; // Lower 32 bits (unsigned)
    val += binary.array[ binary.offset++ ] * 0x100000000 ; // Add 5th byte (bits 32-39)
    val += binary.array[ binary.offset++ ] * 0x10000000000 ; // Add 6th byte (bits 40-47)
    return val ;
  } ;


  var pack48l = function ( val , binary ) {
    // Packs a 48-bit little-endian integer.
    // Writes the lowest 32 bits, then the next 8 bits, then the highest 8 bits.
    binary.array[ binary.offset++ ] = val & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 24 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val / 0x100000000 ) & 0xff ; // 5th byte
    binary.array[ binary.offset++ ] = ( val / 0x10000000000 ) & 0xff ; // 6th byte
  } ;


  var unpack48b = function ( binary ) {
    // Unpacks a 48-bit big-endian unsigned integer.
    // The first two bytes are the highest 16 bits, followed by the lower 32 bits.
    var head = binary.array[ binary.offset++ ] * 0x10000000000 ; // 6th byte (bits 40-47)
    head += binary.array[ binary.offset++ ] * 0x100000000 ; // 5th byte (bits 32-39)
    var val = binary.array[ binary.offset++ ] << 24 ;
    val |= binary.array[ binary.offset++ ] << 16 ;
    val |= binary.array[ binary.offset++ ] << 8 ;
    val |= binary.array[ binary.offset++ ] ;
    val >>>= 0 ; // Lower 32 bits (unsigned)
    val += head ; // Combine with the higher 16 bits
    return val ;
  } ;


  var pack48b = function ( val , binary ) {
    // Packs a 48-bit big-endian integer.
    // Writes the highest 8 bits, then the next 8 bits, then the lowest 32 bits.
    binary.array[ binary.offset++ ] = ( val / 0x10000000000 ) & 0xff ; // 6th byte
    binary.array[ binary.offset++ ] = ( val / 0x100000000 ) & 0xff ; // 5th byte
    binary.array[ binary.offset++ ] = ( val >> 24 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 16 ) & 0xff ;
    binary.array[ binary.offset++ ] = ( val >> 8 ) & 0xff ;
    binary.array[ binary.offset++ ] = val & 0xff ;
  } ;


  /*
   * The Restruct class.
   * This class is designed to define and manage binary data structures
   * for packing and unpacking various data types.
   */
  var Restruct = function ( parent , size , format ) {
    // Constructor for Restruct objects.
    // 'parent' is an optional existing Restruct instance to extend.
    // 'size' is the size in bytes of the current format.
    // 'format' is an object containing unpack and pack functions.
    if ( typeof parent === 'undefined' ) {
      // If no parent, this is the base Restruct.
      this.size = 0 ;
      this.formats = [ ] ;
    } else {
      // If a parent exists, extend its size and formats.
      this.size = parent.size + size ;
      this.formats = parent.formats.concat( format ) ;
    }
  } ;


  Restruct.prototype = {
    // Prototype methods for the Restruct class.

    /*
     * pad(n) method:
     * Adds 'n' null bytes (0x00) for padding.
     * If 'n' is undefined, defaults to 1 byte.
     */
    pad : function ( n ) {
      if ( typeof n === 'undefined' ) {
        n = 1 ; // Default to 1 byte padding.
      }

      return new Restruct( this , n , {
        unpack : function ( binary , struct ) {
          // Unpack: simply advance the binary offset by 'n'.
          binary.offset += n ;
        } ,

        pack : function ( struct , binary ) {
          // Pack: write 'n' null bytes into the binary stream.
          for ( var i = 0 ; i < n ; ++i ) {
            pack8( 0 , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * boolean(k, n) method:
     * Defines a boolean field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of boolean fields.
     */
    boolean : function ( k , n ) {
      if ( typeof n === "undefined" ) {
        // Single boolean field (8 booleans packed into one byte).
        return new Restruct( this , 1 , {
          unpack : function ( binary , struct ) {
            // Unpack a single byte into 8 booleans and assign to struct[k].
            struct[k] = unpackBoolean( binary ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack 8 booleans from struct[k] into a single byte.
            packBoolean( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of boolean fields (n bytes, each representing 8 booleans).
      return new Restruct( this , n , {
        unpack : function ( binary , struct ) {
          // Initialize struct[k] as an array.
          struct[k] = [ ] ;
          // Loop 'n' times to unpack 'n' sets of 8 booleans.
          for ( var i = 0 ; i < n ; ++i ) {
            struct[k][i] = unpackBoolean( binary ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Loop 'n' times to pack 'n' sets of 8 booleans.
          for ( var i = 0 ; i < n ; ++i ) {
            packBoolean( struct[k][i] , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * nibble(k, n) method:
     * Defines a nibble field (4-bit value).
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of nibble fields.
     */
    nibble : function ( k , n ) {
      if ( typeof n === "undefined" ) {
        // Single nibble field (two nibbles packed into one byte).
        return new Restruct( this , 1 , {
          unpack : function ( binary , struct ) {
            // Unpack a single byte into two nibbles and assign to struct[k].
            struct[k] = unpackNibble( binary ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack two nibbles from struct[k] into a single byte.
            packNibble( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of nibble fields (n bytes, each representing two nibbles).
      return new Restruct( this , n , {
        unpack : function ( binary , struct ) {
          // Initialize struct[k] as an array.
          struct[k] = [ ] ;
          // Loop 'n' times to unpack 'n' sets of two nibbles.
          for ( var i = 0 ; i < n ; ++i ) {
            struct[k][i] = unpackNibble( binary ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Loop 'n' times to pack 'n' sets of two nibbles.
          for ( var i = 0 ; i < n ; ++i ) {
            packNibble( struct[k][i] , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * int8ls(k, n, buf) method:
     * Defines an 8-bit signed little-endian integer field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of integers.
     * 'buf' is an optional buffer to use for the array.
     */
    int8ls : function ( k , n , buf ) {
      if ( typeof n === "undefined" ) {
        // Single 8-bit signed little-endian integer.
        return new Restruct( this , 1 , {
          unpack : function ( binary , struct ) {
            // Unpack an 8-bit value and convert to signed.
            struct[k] = sign8( unpack8( binary ) ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack the signed 8-bit value.
            pack8( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of 8-bit signed little-endian integers.
      return new Restruct( this , 1 * n , {
        unpack : function ( binary , struct ) {
          // Check if a buffer is provided, otherwise initialize a new array.
          if ( typeof buf !== "undefined" ) {
            struct[k] = buf ;
          } else {
            struct[k] = [ ] ;
          }

          // Unpack 'n' integers in reverse order for little-endian array processing.
          for ( var i = n - 1 ; i >= 0 ; --i ) {
            struct[k][i] = sign8( unpack8( binary ) ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Pack 'n' integers in reverse order.
          for ( var i = n - 1 ; i >= 0 ; --i ) {
            pack8( struct[k][i] || 0 , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * int8lu(k, n, buf) method:
     * Defines an 8-bit unsigned little-endian integer field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of integers.
     * 'buf' is an optional buffer to use for the array.
     */
    int8lu : function ( k , n , buf ) {
      if ( typeof n === "undefined" ) {
        // Single 8-bit unsigned little-endian integer.
        return new Restruct( this , 1 , {
          unpack : function ( binary , struct ) {
            // Unpack an 8-bit unsigned value.
            struct[k] = unpack8( binary ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack the unsigned 8-bit value.
            pack8( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of 8-bit unsigned little-endian integers.
      return new Restruct( this , 1 * n , {
        unpack : function ( binary , struct ) {
          // Check for buffer or initialize new array.
          if ( typeof buf !== "undefined" ) {
            struct[k] = buf ;
          } else {
            struct[k] = [ ] ;
          }

          // Unpack 'n' unsigned integers in reverse order.
          for ( var i = n - 1 ; i >= 0 ; --i ) {
            struct[k][i] = unpack8( binary ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Pack 'n' unsigned integers in reverse order.
          for ( var i = n - 1 ; i >= 0 ; --i ) {
            pack8( struct[k][i] || 0 , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * int8bs(k, n, buf) method:
     * Defines an 8-bit signed big-endian integer field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of integers.
     * 'buf' is an optional buffer to use for the array.
     */
    int8bs : function ( k , n , buf ) {
      if ( typeof n === "undefined" ) {
        // Single 8-bit signed big-endian integer.
        return new Restruct( this , 1 , {
          unpack : function ( binary , struct ) {
            // Unpack an 8-bit value and convert to signed.
            struct[k] = sign8( unpack8( binary ) ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack the signed 8-bit value.
            pack8( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of 8-bit signed big-endian integers.
      return new Restruct( this , 1 * n , {
        unpack : function ( binary , struct ) {
          // Check for buffer or initialize new array.
          if ( typeof buf !== "undefined" ) {
            struct[k] = buf ;
          } else {
            struct[k] = [ ] ;
          }

          // Unpack 'n' signed integers in forward order.
          for ( var i = 0 ; i < n ; ++i ) {
            struct[k][i] = sign8( unpack8( binary ) ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Pack 'n' signed integers in forward order.
          for ( var i = 0 ; i < n ; ++i ) {
            pack8( struct[k][i] || 0 , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * int8bu(k, n, buf) method:
     * Defines an 8-bit unsigned big-endian integer field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of integers.
     * 'buf' is an optional buffer to use for the array.
     */
    int8bu : function ( k , n , buf ) {
      if ( typeof n === "undefined" ) {
        // Single 8-bit unsigned big-endian integer.
        return new Restruct( this , 1 , {
          unpack : function ( binary , struct ) {
            // Unpack an 8-bit unsigned value.
            struct[k] = unpack8( binary ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack the unsigned 8-bit value.
            pack8( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of 8-bit unsigned big-endian integers.
      return new Restruct( this , 1 * n , {
        unpack : function ( binary , struct ) {
          // Check for buffer or initialize new array.
          if ( typeof buf !== "undefined" ) {
            struct[k] = buf ;
          } else {
            struct[k] = [ ] ;
          }

          // Unpack 'n' unsigned integers in forward order.
          for ( var i = 0 ; i < n ; ++i ) {
            struct[k][i] = unpack8( binary ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Pack 'n' unsigned integers in forward order.
          for ( var i = 0 ; i < n ; ++i ) {
            pack8( struct[k][i] || 0 , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * int16ls(k, n, buf) method:
     * Defines a 16-bit signed little-endian integer field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of integers.
     * 'buf' is an optional buffer to use for the array.
     */
    int16ls : function ( k , n , buf ) {
      if ( typeof n === "undefined" ) {
        // Single 16-bit signed little-endian integer.
        return new Restruct( this , 2 , {
          unpack : function ( binary , struct ) {
            // Unpack a 16-bit little-endian value and convert to signed.
            struct[k] = sign16( unpack16l( binary ) ) ;
          } ,

          pack : function ( struct , binary ) {
            // Pack the signed 16-bit little-endian value.
            pack16l( struct[k] , binary ) ;
          }
        } ) ;
      }

      // Array of 16-bit signed little-endian integers.
      return new Restruct( this , 2 * n , {
        unpack : function ( binary , struct ) {
          // Check for buffer or initialize new array.
          if ( typeof buf !== "undefined" ) {
            struct[k] = buf ;
          } else {
            struct[k] = [ ] ;
          }

          // Unpack 'n' signed integers in reverse order.
          for ( var i = n - 1 ; i >= 0 ; --i ) {
            struct[k][i] = sign16( unpack16l( binary ) ) ;
          }
        } ,

        pack : function ( struct , binary ) {
          // Pack 'n' signed integers in reverse order.
          for ( var i = n - 1 ; i >= 0 ; --i ) {
            pack16l( struct[k][i] || 0 , binary ) ;
          }
        }
      } ) ;
    } ,

    /*
     * int16lu(k, n, buf) method:
     * Defines a 16-bit unsigned little-endian integer field.
     * 'k' is the key for the struct property.
     * 'n' is the optional count for an array of integers.
     * 'buf' is an optional buffer to use for the array.
     */
    int16lu : function ( k , n , buf ) {
      if ( typeof n === "undefined" ) {
        // Single 16-bit unsigned little-endian integer.
        // ... (rest of the code was truncated in the original,
        //     but would follow the same pattern)