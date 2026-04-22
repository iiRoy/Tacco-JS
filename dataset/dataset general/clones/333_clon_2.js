/*
 * Segmented Data Retrieval Utility 0.2.1
 * Copyright (c) 2010 António Afonso, antonio.afonso gmail, http://www.aadsm.net/
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 * Derived from Binary Ajax 0.1.5
 */

/*
 * This function sets up a SegmentedFileAccessor object for reading data from the URL provided.
 *
 * @param {String} resourcePath The URL pointing to the file to be accessed.
 * @param {function(SegmentedFileAccessor)} completionHandler The function to be called when the SegmentedFileAccessor is ready.
 * @param {function()} errorHandler The function to be called if an error occurs, e.g., the URL is invalid or file is unreachable.
 */
var CachedByteLoader = function ( resourcePath, completionHandler, errorHandler ) {

 function dispatchRequest( requestURL, completionHandler, errorHandler, byteRange, supportsRanges, totalFileSize, isAsynchronous ) {
  var httpRequest = buildXHR();
  if ( httpRequest ) {
   var dataStartPosition = 0;
   if ( byteRange && !supportsRanges ) {
    dataStartPosition = byteRange[0];
   }
   var dataLength = 0;
   if ( byteRange ) {
    dataLength = byteRange[1] - byteRange[0] + 1;
   }
   if ( typeof isAsynchronous === "undefined" ) {
    isAsynchronous = true;
   }

   if ( completionHandler ) {
    if ( typeof ( httpRequest.onload ) != "undefined" ) {
     httpRequest.onload = function () {

      if ( httpRequest.status == "200" || httpRequest.status == "206" ) {
       httpRequest.fileSize = totalFileSize || httpRequest.getResponseHeader( "Content-Length" );
       completionHandler( httpRequest );
      } else {
       if ( errorHandler ) {
        errorHandler( { issue: "xhr_failure", "xhr_obj": httpRequest } );
       }
      }
      httpRequest = null;
     };
     if ( errorHandler ) {
      httpRequest.onerror = function () {
       errorHandler( { issue: "xhr_failure", "xhr_obj": httpRequest } );
       httpRequest = null;
      };
     }
    } else {
     httpRequest.onreadystatechange = function () {
      if ( httpRequest.readyState == 4 ) {
       if ( httpRequest.status == "200" || httpRequest.status == "206" ) {
        httpRequest.fileSize = totalFileSize || httpRequest.getResponseHeader( "Content-Length" );
        completionHandler( httpRequest );
       } else {
        if ( errorHandler ) {
         errorHandler( { issue: "xhr_failure", "xhr_obj": httpRequest } );
        }
       }
       httpRequest = null;
      }
     };
    }
   }
   httpRequest.open( "GET", requestURL, isAsynchronous );

   if ( httpRequest.overrideMimeType ) {
    httpRequest.overrideMimeType( 'text/plain; charset=x-user-defined' );
   }

   if ( byteRange && supportsRanges ) {
    httpRequest.setRequestHeader( "Range", "bytes=" + byteRange[0] + "-" + byteRange[1] );
   }

   httpRequest.setRequestHeader( "If-Modified-Since", "Sat, 01 Jan 1970 00:00:00 GMT" );

   httpRequest.send( null );
  } else {
   if ( errorHandler ) {
    errorHandler( { issue: "XHR_object_creation_failed" } );
   }
  }
 }
 function buildXHR() {
  var httpRequest = null;
  if ( window.XMLHttpRequest ) {
   httpRequest = new XMLHttpRequest();
  } else if ( window.ActiveXObject ) {
   httpRequest = new ActiveXObject( "Microsoft.XMLHTTP" );
  }
  return httpRequest;
 }

 function fetchHeader( requestURL, completionHandler, errorHandler ) {
  var httpRequest = buildXHR();
  if ( httpRequest ) {
   if ( completionHandler ) {
    if ( typeof ( httpRequest.onload ) != "undefined" ) {
     httpRequest.onload = function () {
      if ( httpRequest.status == "200" || httpRequest.status == "206" ) {
       completionHandler( this );
      } else {
       if ( errorHandler ) {
        errorHandler( { issue: "xhr_failure", "xhr_obj": httpRequest } );
       }
      }
      httpRequest = null;
     };
     if ( errorHandler ) {
      httpRequest.onerror = function () {
       errorHandler( { issue: "xhr_failure", "xhr_obj": httpRequest } );
       httpRequest = null;
      };
     }
    } else {
     httpRequest.onreadystatechange = function () {
      if ( httpRequest.readyState == 4 ) {
       if ( httpRequest.status == "200" || httpRequest.status == "206" ) {
        completionHandler( this );
       } else {
        if ( errorHandler ) {
         errorHandler( { issue: "xhr_failure", "xhr_obj": httpRequest } );
        }
       }
       httpRequest = null;
      }
     };
    }
   }
   httpRequest.open( "HEAD", requestURL, true );
   httpRequest.send( null );
  } else {
   if ( errorHandler ) {
    errorHandler( { issue: "XHR_object_creation_failed" } );
   }
  }
 }

 /*
  * @class Allows reading a remote file without full download.
  *
  * Constructs a new SegmentedFileAccessor that loads portions of the file from the given URL only as needed.
  *
  * @param {string} resourcePath The URL specifying the location of the file to be read.
  * @param {number} overallLength The total size of the file in bytes.
  * @param {number} [segmentSize=2048] The size of each data segment that will be fetched during a read operation.
  * @param {number} [segmentBuffer=0] The number of additional segments (before and after the requested one) to also fetch.
  *
  * @constructor
  * @augments BinaryFile (conceptual)
  */
 function SegmentedFileAccessor( resourcePath, overallLength, segmentSize, segmentBuffer ) {
  var voidValue;
  var bytesFetchedTotal = 0;
  var baseFileObject = new BinaryFile( "", 0, overallLength );
  var dataSegments = [];

  segmentSize = segmentSize || 1024 * 2;
  segmentBuffer = ( typeof segmentBuffer === "undefined" ) ? 0 : segmentBuffer;
  totalSegments = ~~ ( ( overallLength - 1 ) / segmentSize ) + 1;

  function getSegmentRangeForByteRange( byteInterval ) {
   var segmentInitial = ~~ ( byteInterval[0] / segmentSize ) - segmentBuffer;
   var segmentFinal = ~~ ( byteInterval[1] / segmentSize ) + 1 + segmentBuffer;

   if ( segmentInitial < 0 ) {
    segmentInitial = 0;
   }
   if ( segmentFinal >= totalSegments ) {
    segmentFinal = totalSegments - 1;
   }

   return [ segmentInitial, segmentFinal ];
  }

  // TODO: Consider if a "recently accessed segment" cache could optimize performance here.
  function getSegmentAtPosition( bytePosition ) {
   var segmentInterval = getSegmentRangeForByteRange( [ bytePosition, bytePosition ] );
   awaitSegments( segmentInterval );
   return dataSegments[ ~~ ( bytePosition / segmentSize ) ];
  }

  /*
   * @param {?function()} processCompletion If provided, this function will be asynchronous and the processCompletion invoked when segments are loaded, otherwise it blocks script execution until the request completes.
   */
  function awaitSegments( segmentInterval, processCompletion ) {
   // Filter out already downloaded segments or return if the entire interval is already present.
   while ( dataSegments[ segmentInterval[0] ] ) {
    segmentInterval[0]++;
    if ( segmentInterval[0] > segmentInterval[1] ) {
     return processCompletion ? processCompletion() : voidValue;
    }
   }
   while ( dataSegments[ segmentInterval[1] ] ) {
    segmentInterval[1]--;
    if ( segmentInterval[0] > segmentInterval[1] ) {
     return processCompletion ? processCompletion() : voidValue;
    }
   }
   var byteInterval = [ segmentInterval[0] * segmentSize, ( segmentInterval[1] + 1 ) * segmentSize - 1 ];
   //console.log("Requesting: " + byteInterval[0] + " to " + byteInterval[1]);
   dispatchRequest(
    resourcePath,
    function ( responseObj ) {
     var receivedSize = parseInt( responseObj.getResponseHeader( "Content-Length" ), 10 );
     // Range header not supported by server
     if ( receivedSize == overallLength ) {
      segmentInterval[0] = 0;
      segmentInterval[1] = totalSegments - 1;
      byteInterval[0] = 0;
      byteInterval[1] = overallLength - 1;
     }
     var currentSegment = {
      segmentData: responseObj.responseBody || responseObj.responseText,
      offset: byteInterval[0]
     };

     for ( var j = segmentInterval[0]; j <= segmentInterval[1]; j++ ) {
      dataSegments[j] = currentSegment;
     }
     bytesFetchedTotal += byteInterval[1] - byteInterval[0] + 1;
     if ( processCompletion ) {
      processCompletion();
     }
    },
    errorHandler,
    byteInterval,
    "bytes",
    voidValue,
    !!processCompletion
   );
  }

  // Mixin all baseFileObject's methods.
  // Not using prototype linking as the constructor requires
  // the file's overall length.
  for ( var propName in baseFileObject ) {
   if ( baseFileObject.hasOwnProperty( propName ) &&
    typeof baseFileObject[propName] === "function" ) {
    this[propName] = baseFileObject[propName];
   }
  }
  /*
   * @override
   */
  this.retrieveByteAt = function ( byteIndex ) {
   var currentSegment = getSegmentAtPosition( byteIndex );
   if ( currentSegment && typeof currentSegment.segmentData == "string" ) {
    return currentSegment.segmentData.charCodeAt( byteIndex - currentSegment.offset ) & 0xFF;
   } else if ( currentSegment && typeof currentSegment.segmentData == "unknown" ) {
    return MSXHR_getByteAt( currentSegment.segmentData, byteIndex - currentSegment.offset );
   } else {
    return "";
   }
  };

  /*
   * Gets the total number of bytes that have been downloaded so far.
   *
   * @returns The cumulative count of bytes downloaded.
   */
  this.getFetchedBytesTotal = function () {
   return bytesFetchedTotal;
  };

  /*
   * Downloads the specified byte interval. Useful for pre-caching.
   *
   * @param {Array} byteInterval A two-element array defining the starting and ending byte positions (inclusive). E.g., [2, 5] fetches bytes 2, 3, 4, and 5.
   * @param {?function()} processCompletion The function to invoke once the segments have been downloaded, making this call asynchronous.
   */
  this.preloadInterval = function ( byteInterval, processCompletion ) {
   var segmentInterval = getSegmentRangeForByteRange( byteInterval );
   awaitSegments( segmentInterval, processCompletion );
  };
 }

 function initializeLoader() {
  fetchHeader(
   resourcePath,
   function ( responseObj ) {
    var overallLength = parseInt( responseObj.getResponseHeader( "Content-Length" ), 10 ) || -1;
    completionHandler( new SegmentedFileAccessor( resourcePath, overallLength ) );
   },
   errorHandler
  );
 }

 initializeLoader();
};