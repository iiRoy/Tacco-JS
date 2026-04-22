require = ( function e ( t , n , r ) {
  // This is a browserify-style require implementation.
  // It handles module loading within the bundled code.
  function s ( o , u ) {
    if ( !n [ o ] ) {
      if ( !t [ o ] ) {
        var a = typeof require == "function" && require;
        if ( !u && a )
          return a ( o , !0 );
        if ( i )
          return i ( o , !0 );
        throw new Error ( "Cannot find module '" + o + "'" )
      }
      var f = n [ o ] = {
        exports : {
        }
      };
      t [ o ] [ 0 ] . call ( f . exports , function ( e ) {
        var n = t [ o ] [ 1 ] [ e ];
        return s ( n ? n : e )
      } , f , f . exports , e , t , n , r )
    }
    return n [ o ] . exports
  }
  var i = typeof require == "function" && require;
  for ( var o = 0 ; o < r . length ; o ++ )
    s ( r [ o ] );
  return s
} ) ( {
  1 : [ function ( require , module , exports ) {
    'use strict' ; // Enforce strict mode for better error handling and cleaner code.

    // Load necessary external libraries.
    var Peer = require ( 'peerjs' ) ;
    var Chord = require ( 'webrtc-chord' ) ;
    var _ = require ( 'underscore' ) ;

    /**
     * Updates the UI or logs the current peer ID.
     * @param {string} peerId - The ID of the current peer.
     */
    var updatePeerId = function ( peerId ) {
      console . log ( 'My peer ID: ' + peerId ) ; // Log the peer ID to the console.
    } ;

    /**
     * Handles and logs any errors that occur.
     * @param {Error} error - The error object.
     */
    var errorHandler = function ( error ) {
      if ( error ) {
        console . log ( 'Failed: ' + error ) ; // Output the error message.
      }
    } ;

    /**
     * Callback function for when a new chord network is created.
     * @param {string} myPeerId - The ID of the peer that created the network.
     * @param {Error} error - An error object if creation failed.
     */
    var create = function ( myPeerId , error ) {
      if ( error ) {
        errorHandler ( error ) ; // Pass the error to the generic handler.
      } else {
        updatePeerId ( myPeerId ) ; // Update the displayed peer ID.
      }
    } ;

    /**
     * Callback function for when a peer successfully joins an existing chord network.
     * @param {string} myPeerId - The ID of the peer that joined.
     * @param {Error} error - An error object if joining failed.
     */
    var join = function ( myPeerId , error ) {
      if ( error ) {
        errorHandler ( error ) ; // Handle any errors during the join process.
      } else {
        updatePeerId ( myPeerId ) ; // Update the displayed peer ID upon successful join.
      }
    } ;

    // Configuration object for the WebRTC Chord network and PeerJS.
    var config = {
      peer : { // PeerJS specific options.
        options : {
          host : 'localhost' , // Host for the PeerJS signaling server.
          port : 9000 , // Port for the PeerJS signaling server.
          debug : 3 , // Debug level (0: none, 1: errors, 2: warnings, 3: all).
          config : {
            iceServers : [ // ICE servers for NAT traversal.
              {
                url : 'stun:54.187.230.130'
              } ,
              {
                url : 'stun:stun.l.google.com:19302'
              } ,
              {
                url : 'turn:gorst@54.187.230.130' ,
                credential : 'hero'
              }
            ]
          }
        }
      } ,
      numberOfEntriesInSuccessorList : 3 , // Number of successors to maintain in the list.
      connectionPoolSize : 10 , // Maximum number of open connections.
      connectionOpenTimeout : 30000 , // Timeout for establishing a connection in milliseconds.
      requestTimeout : 180000 , // Timeout for chord requests in milliseconds.
      stabilizeTaskInterval : 30000 , // Interval for the stabilize task in milliseconds.
      fixFingerTaskInterval : 30000 , // Interval for the fix finger task in milliseconds.
      checkPredecessorTaskInterval : 30000 // Interval for the check predecessor task in milliseconds.
    } ;

    // Create a new chord instance using the defined configuration.
    var chord = new Chord ( config ) ;

    // Initialize PeerJS with the specified host, port, and ICE servers.
    var peer = new Peer ( {
      host : 'localhost' , // PeerJS server host.
      port : 9000 , // PeerJS server port.
      debug : 3 , // Detailed debug logging.
      config : {
        iceServers : [
          {
            url : 'stun:54.187.230.130'
          } ,
          {
            url : 'stun:stun.l.google.com:19302'
          } ,
          {
            url : 'turn:gorst@54.187.230.130' ,
            credential : 'hero'
          }
        ]
      }
    } ) ;

    // Event handler for when the PeerJS connection is successfully opened.
    peer . on ( 'open' , function ( id ) {
      var peers = [ ] ; // Array to store discovered peer IDs.

      // List all active peers connected to the PeerJS server.
      peer . listAllPeers ( function ( keys ) {
        // Filter out the current peer's ID and the chord's internal peer ID.
        keys . map ( function ( p ) {
          if ( p !== id && p !== chord . getPeerId ( ) ) {
            console . log ( 'Peer ' + p ) ;
            peers . push ( p ) ; // Add valid peer IDs to the list.
          }
        } ) ;

        // Determine whether to join an existing network or create a new one.
        if ( peers [ 0 ] ) {
          // If there are other peers, attempt to join the first one found.
          console . log ( 'Joining ' , peers [ 0 ] ) ;
          chord . join ( peers [ 0 ] , join ) ;
        } else {
          // If no other peers are found, create a new chord network.
          console . log ( 'Creating new network' ) ;
          chord . create ( create ) ;
        }
      } ) ;
      // Destroy the PeerJS instance after initial setup, as Chord handles its own peer connections.
      peer . destroy ( ) ;
    } ) ;

    /**
     * Searches the chord network for entries matching keywords.
     * @param {string} query - The search query string.
     */
    function search ( query ) {
      // Split the query into individual keywords.
      var keywords = query . split ( ' ' ) ;

      var all = [ ] ; // Stores results for each keyword.
      var results = [ ] ; // Stores the final intersected results.

      // Iterate over each keyword to retrieve associated entries.
      _ . each ( keywords , function ( key ) {
        chord . retrieve ( key , function ( entries , error ) {
          if ( error ) {
            console . log ( 'Failed to retrieve entries: ' + error ) ;
          }
          all . push ( _ . flatten ( entries ) ) ; // Flatten and add entries for the current key.
          // If this is the last keyword, compute the intersection of all results.
          if ( key === _ . last ( keywords ) ) {
            results = _ . intersection . apply ( _ , all ) ; // Find common entries across all keywords.
            console . log ( results ) ; // Log the final search results.
          }
        } ) ;
      } ) ;
    }

    // Register handlers for window unload and before unload events.
    window . onunload = window . onbeforeunload = function ( ) {
      // If the PeerJS instance exists and hasn't been destroyed, destroy it.
      if ( !! peer && ! peer . destroyed ) {
        peer . destroy ( ) ;
      }
      chord . leave ( ) ; // Instruct the chord instance to leave the network.
    } ;

    // Export chord functionalities for external use.
    module . exports . chord = chord ;
    module . exports . get = chord . retrieve ;
    module . exports . put = chord . put ;
    module . exports . remove = chord . remove ;
    module . exports . search = search ;
  } , {
    "peerjs" : "MVWM4L" ,
    "underscore" : 6 ,
    "webrtc-chord" : "rzYpuO"
  } ] ,
  "MVWM4L" : [ function ( require , module , exports ) {
    ( function ( global ) {
      ;
      __browserify_shim_require__ = require ;
      ( function browserifyShim ( module , exports , require , define , browserify_shim__define__module__export__ ) {
        /*! peerjs.js build:0.3.8, development. Copyright(c) 2013 Michelle Bu <michelle@michellebu.com> */
        ( function ( exports ) {
          var binaryFeatures = {
          } ;
          binaryFeatures . useBlobBuilder = ( function ( ) {
            try {
              new Blob ( [ ] ) ;
              return false ;
            } catch ( e ) {
              return true ;
            }
          } ) ( ) ;

          binaryFeatures . useArrayBufferView = ! binaryFeatures . useBlobBuilder && ( function ( ) {
            try {
              return ( new Blob ( [ new Uint8Array ( [ ] ) ] ) ) . size === 0 ;
            } catch ( e ) {
              return true ;
            }
          } ) ( ) ;

          exports . binaryFeatures = binaryFeatures ;
          exports . BlobBuilder = window . WebKitBlobBuilder || window . MozBlobBuilder || window . MSBlobBuilder || window . BlobBuilder ;

          function BufferBuilder ( ) {
            this . _pieces = [ ] ;
            this . _parts = [ ] ;
          }

          BufferBuilder . prototype . append = function ( data ) {
            if ( typeof data === 'number' ) {
              this . _pieces . push ( data ) ;
            } else {
              this . flush ( ) ;
              this . _parts . push ( data ) ;
            }
          } ;

          BufferBuilder . prototype . flush = function ( ) {
            if ( this . _pieces . length > 0 ) {
              var buf = new Uint8Array ( this . _pieces ) ;
              if ( ! binaryFeatures . useArrayBufferView ) {
                buf = buf . buffer ;
              }
              this . _parts . push ( buf ) ;
              this . _pieces = [ ] ;
            }
          } ;

          BufferBuilder . prototype . getBuffer = function ( ) {
            this . flush ( ) ;
            if ( binaryFeatures . useBlobBuilder ) {
              var builder = new BlobBuilder ( ) ;
              for ( var i = 0 , ii = this . _parts . length ; i < ii ; i ++ ) {
                builder . append ( this . _parts [ i ] ) ;
              }
              return builder . getBlob ( ) ;
            } else {
              return new Blob ( this . _parts ) ;
            }
          } ;
          exports . BinaryPack = {
            unpack : function ( data ) {
              var unpacker = new Unpacker ( data ) ;
              return unpacker . unpack ( ) ;
            } ,
            pack : function ( data ) {
              var packer = new Packer ( ) ;
              packer . pack ( data ) ;
              var buffer = packer . getBuffer ( ) ;
              return buffer ;
            }
          } ;

          function Unpacker ( data ) {
            // Data is expected to be an ArrayBuffer
            this . index = 0 ;
            this . dataBuffer = data ;
            this . dataView = new Uint8Array ( this . dataBuffer ) ;
            this . length = this . dataBuffer . byteLength ;
          }

          Unpacker . prototype . unpack = function ( ) {
            var type = this . unpack_uint8 ( ) ;
            if ( type < 0x80 ) {
              var positive_fixnum = type ;
              return positive_fixnum ;
            } else if ( ( type ^ 0xe0 ) < 0x20 ) {
              var negative_fixnum = ( type ^ 0xe0 ) - 0x20 ;
              return negative_fixnum ;
            }
            var size ;
            if ( ( size = type ^ 0xa0 ) <= 0x0f ) {
              return this . unpack_raw ( size ) ;
            } else if ( ( size = type ^ 0xb0 ) <= 0x0f ) {
              return this . unpack_string ( size ) ;
            } else if ( ( size = type ^ 0x90 ) <= 0x0f ) {
              return this . unpack_array ( size ) ;
            } else if ( ( size = type ^ 0x80 ) <= 0x0f ) {
              return this . unpack_map ( size ) ;
            }
            switch ( type ) {
              case 0xc0 :
                return null ;
              case 0xc1 :
                return undefined ;
              case 0xc2 :
                return false ;
              case 0xc3 :
                return true ;
              case 0xca :
                return this . unpack_float ( ) ;
              case 0xcb :
                return this . unpack_double ( ) ;
              case 0xcc :
                return this . unpack_uint8 ( ) ;
              case 0xcd :
                return this . unpack_uint16 ( ) ;
              case 0xce :
                return this . unpack_uint32 ( ) ;
              case 0xcf :
                return this . unpack_uint64 ( ) ;
              case 0xd0 :
                return this . unpack_int8 ( ) ;
              case 0xd1 :
                return this . unpack_int16 ( ) ;
              case 0xd2 :
                return this . unpack_int32 ( ) ;
              case 0xd3 :
                return this . unpack_int64 ( ) ;
              case 0xd4 :
                return undefined ;
              case 0xd5 :
                return undefined ;
              case 0xd6 :
                return undefined ;
              case 0xd7 :
                return undefined ;
              case 0xd8 :
                size = this . unpack_uint16 ( ) ;
                return this . unpack_string ( size ) ;
              case 0xd9 :
                size = this . unpack_uint32 ( ) ;
                return this . unpack_string ( size ) ;
              case 0xda :
                size = this . unpack_uint16 ( ) ;
                return this . unpack_raw ( size ) ;
              case 0xdb :
                size = this . unpack_uint32 ( ) ;
                return this . unpack_raw ( size ) ;
              case 0xdc :
                size = this . unpack_uint16 ( ) ;
                return this . unpack_array ( size ) ;
              case 0xdd :
                size = this . unpack_uint32 ( ) ;
                return this . unpack_array ( size ) ;
              case 0xde :
                size = this . unpack_uint16 ( ) ;
                return this . unpack_map ( size ) ;
              case 0xdf :
                size = this . unpack_uint32 ( ) ;
                return this . unpack_map ( size ) ;
            }
          }

          Unpacker . prototype . unpack_uint8 = function ( ) {
            var byte = this . dataView [ this . index ] & 0xff ;
            this . index ++ ;
            return byte ;
          } ;

          Unpacker . prototype . unpack_uint16 = function ( ) {
            var bytes = this . read ( 2 ) ;
            var uint16 =
              ( ( bytes [ 0 ] & 0xff ) * 256 ) + ( bytes [ 1 ] & 0xff ) ;
            this . index += 2 ;
            return uint16 ;
          }

          Unpacker . prototype . unpack_uint32 = function ( ) {
            var bytes = this . read ( 4 ) ;
            var uint32 =
              ( ( ( bytes [ 0 ] * 256 +
                bytes [ 1 ] ) * 256 +
                bytes [ 2 ] ) * 256 +
                bytes [ 3 ] ) ;
            this . index += 4 ;
            return uint32 ;
          }

          Unpacker . prototype . unpack_uint64 = function ( ) {
            var bytes = this . read ( 8 ) ;
            var uint64 =
              ( ( ( ( ( ( bytes [ 0 ] * 256 +
                bytes [ 1 ] ) * 256 +
                bytes [ 2 ] ) * 256 +
                bytes [ 3 ] ) * 256 +
                bytes [ 4 ] ) * 256 +
                bytes [ 5 ] ) * 256 +
                bytes [ 6 ] ) * 256 +
                bytes [ 7 ] ) ;
            this . index += 8 ;
            return uint64 ;
          }

          Unpacker . prototype . unpack_int8 = function ( ) {
            var uint8 = this . unpack_uint8 ( ) ;
            return ( uint8 < 0x80 ) ? uint8 : uint8 - ( 1 << 8 ) ;
          } ;

          Unpacker . prototype . unpack_int16 = function ( ) {
            var uint16 = this . unpack_uint16 ( ) ;
            return ( uint16 < 0x8000 ) ? uint16 : uint16 - ( 1 << 16 ) ;
          }

          Unpacker . prototype . unpack_int32 = function ( ) {
            var uint32 = this . unpack_uint32 ( ) ;
            return ( uint32 < Math . pow ( 2 , 31 ) ) ? uint32 :
              uint32 - Math . pow ( 2 , 32 ) ;
          }

          Unpacker . prototype . unpack_int64 = function ( ) {
            var uint64 = this . unpack_uint64 ( ) ;
            return ( uint64 < Math . pow ( 2 , 63 ) ) ? uint64 :
              uint64 - Math . pow ( 2 , 64 ) ;
          }

          Unpacker . prototype . unpack_raw = function ( size ) {
            if ( this . length < this . index + size ) {
              throw new Error ( 'BinaryPackFailure: index is out of range'
                + ' ' + this . index + ' ' + size + ' ' + this . length ) ;
            }
            var buf = this . dataBuffer . slice ( this . index , this . index + size ) ;
            this . index += size ;

            //buf = util.bufferToString(buf); // Original comment, kept for clone.

            return buf ;
          }

          Unpacker . prototype . unpack_string = function ( size ) {
            var bytes = this . read ( size ) ;
            var i = 0 , str = '' , c , code ;
            while ( i < size ) {
              c = bytes [ i ] ;
              if ( c < 128 ) {
                str += String . fromCharCode ( c ) ;
                i ++ ;
              } else if ( ( c ^ 0xc0 ) < 32 ) {
                code = ( ( c ^ 0xc0 ) << 6 ) | ( bytes [ i + 1 ] & 63 ) ;
                str += String . fromCharCode ( code ) ;
                i += 2 ;
              } else {
                code = ( ( c & 15 ) << 12 ) | ( ( bytes [ i + 1 ] & 63 ) << 6 ) |
                  ( bytes [ i + 2 ] & 63 ) ;
                str += String . fromCharCode ( code ) ;
                i += 3 ;
              }
            }
            this . index += size ;
            return str ;
          }

          Unpacker . prototype . unpack_array = function ( size ) {
            var objects = new Array ( size ) ;
            for ( var i = 0 ; i < size ; i ++ ) {
              objects [ i ] = this . unpack ( ) ;
            }
            return objects ;
          }

          Unpacker . prototype . unpack_map = function ( size ) {
            var map = {
            } ;
            for ( var i = 0 ; i < size ; i ++ ) {
              var key = this . unpack ( ) ;
              var value = this . unpack ( ) ;
              map [ key ] = value ;
            }
            return map ;
          }

          Unpacker . prototype . unpack_float = function ( ) {
            var uint32 = this . unpack_uint32 ( ) ;
            var sign = uint32 >> 31 ;
            var exp = ( ( uint32 >> 23 ) & 0xff ) - 127 ;
            var fraction = ( uint32 & 0x7fffff ) | 0x800000 ;
            return ( sign == 0 ? 1 : -1 ) *
              fraction * Math . pow ( 2 , exp - 23 ) ;
          }

          Unpacker . prototype . unpack_double = function ( ) {
            var h32 = this . unpack_uint32 ( ) ;
            var l32 = this . unpack_uint32 ( ) ;
            var sign = h32 >> 31 ;
            var exp = ( ( h32 >> 20 ) & 0x7ff ) - 1023 ;
            var hfrac = ( h32 & 0xfffff ) | 0x100000 ;
            var frac = hfrac * Math . pow ( 2 , exp - 20 ) +
              l32 * Math . pow ( 2 , exp - 52 ) ;
            return ( sign == 0 ? 1 : -1 ) * frac ;
          }

          Unpacker . prototype . read = function ( length ) {
            var j = this . index ;
            if ( j + length <= this . length ) {
              return this . dataView . subarray ( j , j + length ) ;
            } else {
              throw new Error ( 'BinaryPackFailure: read index out of range' ) ;
            }
          }

          function Packer ( ) {
            this . bufferBuilder = new BufferBuilder ( ) ;
          }

          Packer . prototype . getBuffer = function ( ) {
            return this . bufferBuilder . getBuffer ( ) ;
          }

          Packer . prototype . pack = function ( value ) {
            var type = typeof ( value ) ;
            if ( type == 'string' ) {
              this . pack_string ( value ) ;
            } else if ( type == 'number' ) {
              if ( Math . floor ( value ) === value ) {
                this . pack_integer ( value ) ;
              } else {
                this . pack_double ( value ) ;
              }
            } else if ( type == 'boolean' ) {
              if ( value === true ) {
                this . bufferBuilder . append ( 0xc3 ) ;
              } else if ( value === false ) {
                this . bufferBuilder . append ( 0xc2 ) ;
              }
            } else if ( type == 'undefined' ) {
              this . bufferBuilder . append ( 0xc0 ) ;
            } else if ( type == 'object' ) {
              if ( value === null ) {
                this . bufferBuilder . append ( 0xc0 ) ;
              } else {
                var constructor = value . constructor ;
                if ( constructor == Array ) {
                  this . pack_array ( value ) ;
                } else if ( constructor == Blob || constructor == File ) {
                  this . pack_bin ( value ) ;
                } else if ( constructor == ArrayBuffer ) {
                  if ( binaryFeatures . useArrayBufferView ) {
                    this . pack_bin ( new Uint8Array ( value ) ) ;
                  } else {
                    this . pack_bin ( value ) ;
                  }
                } else if ( 'BYTES_PER_ELEMENT' in value ) {
                  if ( binaryFeatures . useArrayBufferView ) {
                    this . pack_bin ( new Uint8Array ( value . buffer ) ) ;
                  } else {
                    this . pack_bin ( value . buffer ) ;
                  }
                } else if ( constructor == Object ) {
                  this . pack_object ( value ) ;
                } else if ( constructor == Date ) {
                  this . pack_string ( value . toString ( ) ) ;
                } else if ( typeof value . toBinaryPack == 'function' ) {