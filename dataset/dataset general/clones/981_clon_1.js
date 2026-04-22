/*
 * Geolocation Utility Script
 *
 * This file provides cross-platform geolocation capabilities.
 *
 * Originally based on work by J. Esteban Acosta Villafañe (MIT License)
 * and Stan Wiechers (geo-location-javascript v0.4.8).
 *
 * Date of original revision: 2012-09-07
 */

var bb = {
  success: 0,
  error: 0,
  blackberryTimeoutId: -1 // Identifier for the timeout
};

function handleBlackBerryLocationTimeout( ) {
  // Check if a timeout has been set
  if (bb.blackberryTimeoutId != -1) {
    // Invoke the error callback with a timeout message
    bb.error( {
      message: "Timeout error",
      code: 3
    } );
  }
}

// Handler for BlackBerry location updates
function handleBlackBerryLocation( ) {
  // Clear any pending timeout for location acquisition
  clearTimeout( bb.blackberryTimeoutId );
  bb.blackberryTimeoutId = -1; // Reset timeout ID

  // Proceed only if both success and error callbacks are available
  if ( bb.success && bb.error ) {
    // Special case for BlackBerry: (0,0) often means position unavailable
    if ( blackberry.location.latitude == 0 && blackberry.location.longitude == 0 ) {
      // W3C Geolocation API spec: POSITION_UNAVAILABLE (code 2)
      bb.error( { message: "Position unavailable", code: 2 } );
    } else {
      var timestamp = null; // Initialize timestamp
      // BlackBerry OS 4.6+ provides a timestamp
      if ( blackberry.location.timestamp ) {
        timestamp = new Date( blackberry.location.timestamp );
      }
      // Call the success callback with the position data
      bb.success( {
        timestamp: timestamp,
        coords: {
          latitude: blackberry.location.latitude,
          longitude: blackberry.location.longitude
        }
      } );
    }
    // After location is obtained (or error), nullify callbacks to prevent re-use
    // This is a workaround as blackberry.location.removeLocationUpdate() is unreliable
    bb.success = null;
    bb.error = null;
  }
}

var geoPosition = function( ) {
  var pub = {}; // Public interface object
  var provider = null; // Geolocation provider
  var u = "undefined"; // String constant for type checking
  var ipGeolocationSrv = 'http://freegeoip.net/json/?callback=JSONPCallback'; // Default IP geolocation service

  // Public method to get current position
  pub.getCurrentPosition = function( success, error, opts ) {
    provider.getCurrentPosition( success, error, opts );
  };

  // JSONP utility for fetching data from cross-domain services
  pub.jsonp = {
    callbackCounter: 0, // Counter for unique callback function names

    fetch: function( url, callback ) {
      var fn = 'JSONPCallback_' + this.callbackCounter++; // Generate unique callback name
      window[fn] = this.evalJSONP( callback ); // Assign callback function to window scope
      url = url.replace( '=JSONPCallback', '=' + fn ); // Update URL with unique callback name

      var scriptTag = document.createElement( 'SCRIPT' ); // Create script element
      scriptTag.src = url; // Set script source
      document.getElementsByTagName( 'HEAD' )[0].appendChild( scriptTag ); // Append to head to execute
    },

    evalJSONP: function( callback ) {
      return function( data ) {
        callback( data ); // Execute the provided callback with fetched data
      };
    }
  };

  // Confirmation dialog for location access
  pub.confirmation = function( ) {
    return confirm( 'This Webpage wants to track your physical location.\nDo you allow it?' );
  };

  // Initialization function to detect and set up the geolocation provider
  pub.init = function( ) {
    try {
      var hasGeolocation = typeof( navigator.geolocation ) != u; // Check for W3C Geolocation API

      // If no native geolocation, prompt user for permission
      if ( !hasGeolocation ) {
        if ( !pub.confirmation( ) ) {
          return false; // User denied permission
        }
      }

      // Priority order for geolocation providers:
      // 1. Simulator (for testing)
      if ( ( typeof( geoPositionSimulator ) != u ) && ( geoPositionSimulator.length > 0 ) ) {
        provider = geoPositionSimulator;
      }
      // 2. Bondi API (e.g., Opera Mobile)
      else if ( typeof( bondi ) != u && typeof( bondi.geolocation ) != u ) {
        provider = bondi.geolocation;
      }
      // 3. W3C Geolocation API (navigator.geolocation)
      else if ( hasGeolocation ) {
        provider = navigator.geolocation;
        // Override getCurrentPosition to normalize Mozilla Geode output
        pub.getCurrentPosition = function( success, error, opts ) {
          function _success( p ) {
            var params;
            if ( typeof( p.latitude ) != u ) { // If coordinates are direct properties
              params = {
                timestamp: p.timestamp,
                coords: {
                  latitude: p.latitude,
                  longitude: p.longitude
                }
              };
            } else { // Assume it's already in the desired format
              params = p;
            }
            success( params ); // Call original success callback
          }
          provider.getCurrentPosition( _success, error, opts ); // Call native API
        };
      }
      // 4. BlackBerry API
      else if ( typeof( window.blackberry ) != u && blackberry.location.GPSSupported ) {
        // Set BlackBerry location to autonomous mode
        if ( typeof( blackberry.location.setAidMode ) == u ) {
          return false; // setAidMode not available
        }
        blackberry.location.setAidMode( 2 ); // Set to autonomous mode (GPS only)

        // Override getCurrentPosition for BlackBerry
        pub.getCurrentPosition = function( success, error, opts ) {
          // Callbacks must be stored externally for BlackBerry due to API quirks
          bb.success = success;
          bb.error = error;

          // Set timeout for location acquisition
          if ( opts && opts['timeout'] ) {
            bb.blackberryTimeoutId = setTimeout( "handleBlackBerryLocationTimeout()", opts['timeout'] );
          } else {
            // Default timeout to prevent hanging script
            bb.blackberryTimeoutId = setTimeout( "handleBlackBerryLocationTimeout()", 60000 );
          }

          // Register location update listener
          blackberry.location.onLocationUpdate( "handleBlackBerryLocation()" );
          blackberry.location.refreshLocation( ); // Request immediate location update
        };
        provider = blackberry.location; // Set provider
      }
      // 5. Palm webOS Mojo API
      else if ( typeof( Mojo ) != u && typeof( Mojo.Service.Request ) != "Mojo.Service.Request" ) {
        provider = true; // Indicate provider is available
        pub.getCurrentPosition = function( success, error, opts ) {
          var parameters = {};
          if ( opts ) {
            // Map W3C options to Mojo parameters
            if ( opts.enableHighAccuracy && opts.enableHighAccuracy == true ) {
              parameters.accuracy = 1;
            }
            if ( opts.maximumAge ) {
              parameters.maximumAge = opts.maximumAge;
            }
            if ( opts.responseTime ) {
              if ( opts.responseTime < 5 ) {
                parameters.responseTime = 1;
              } else if ( opts.responseTime < 20 ) {
                parameters.responseTime = 2;
              } else {
                parameters.timeout = 3;
              }
            }
          }

          // Make Mojo service request
          var r = new Mojo.Service.Request( 'palm://com.palm.location', {
            method: "getCurrentPosition",
            parameters: parameters,
            onSuccess: function( p ) {
              success( {
                timestamp: p.timestamp,
                coords: {
                  latitude: p.latitude,
                  longitude: p.longitude,
                  heading: p.heading
                }
              } );
            },
            onFailure: function( e ) {
              // Map Mojo error codes to W3C error codes
              if ( e.errorCode == 1 ) {
                error( { code: 3, message: "Timeout" } );
              } else if ( e.errorCode == 2 ) {
                error( { code: 2, message: "Position unavailable" } );
              } else {
                error( { code: 0, message: "Unknown Error: webOS-code" + e.errorCode } );
              }
            }
          } );
        };
      }
      // 6. Windows Mobile / Phone API (device.getServiceObject)
      else if ( typeof( device ) != u && typeof( device.getServiceObject ) != u ) {
        provider = device.getServiceObject( "Service.Location", "ILocation" );

        // Override getCurrentPosition for Windows Mobile
        pub.getCurrentPosition = function( success, error, opts ) {
          function callback( transId, eventCode, result ) {
            if ( eventCode == 4 ) { // Error event code
              error( { message: "Position unavailable", code: 2 } );
            } else {
              // Success with location data
              success( {
                timestamp: null, // Timestamp might not be available
                coords: {
                  latitude: result.ReturnValue.Latitude,
                  longitude: result.ReturnValue.Longitude,
                  altitude: result.ReturnValue.Altitude,
                  heading: result.ReturnValue.Heading
                }
              } );
            }
          }

          var criteria = new Object( ); // Location criteria object
          criteria.LocationInformationClass = "BasicLocationInformation";
          provider.ILocation.GetLocation( criteria, callback ); // Request location
        };
      }
      // 7. Fallback to IP Geolocation (if no other provider found)
      else {
        pub.getCurrentPosition = function( success, error, opts ) {
          pub.jsonp.fetch( ipGeolocationSrv,
            function( p ) {
              success( {
                timestamp: p.timestamp,
                coords: {
                  latitude: p.latitude,
                  longitude: p.longitude,
                  heading: p.heading
                }
              } );
            } );
        };
        provider = true; // Indicate IP geolocation is the provider
      }
    } catch ( e ) {
      // Log any errors during initialization
      if ( typeof( console ) != u ) {
        console.log( e );
      }
      return false; // Initialization failed
    }
    return provider != null; // Return true if a provider was successfully set
  };

  return pub; // Return the public interface
}( ); // Immediately-invoked function expression (IIFE)