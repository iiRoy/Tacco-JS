if ( typeof ( DeviceInfo ) != 'object' )
{
    // If DeviceInfo is not yet defined as an object, initialize it.
    DeviceInfo = {};
}

/*
 * This object serves as the main entry point for the PhoneGap API.
 * It establishes a global namespace for interacting with PhoneGap functionalities
 * and managing its internal state.
 *
 * @class Global API object for PhoneGap operations.
 */
PhoneGap =
{
    queue :
    {
        ready    : true,
        commands : [],  // Array to hold pending commands.
        timer    : null
    },
    _constructors : [] // List of functions to run upon PhoneGap initialization.
};


// This flag indicates whether the PhoneGap API is fully loaded and ready for use.
// It relies on the presence of a UUID within the DeviceInfo object.
PhoneGap . available = ( DeviceInfo . uuid != undefined ) ;
// TODO: Consider deprecating or refactoring this flag for better clarity in future versions.

/**
 * @function PhoneGap.addConstructor
 * @description Queues a function to be executed once the PhoneGap environment is fully initialized.
 *              This mechanism ensures that application-specific setup code runs at the correct time.
 * @param {Function} func - The callback function to be invoked after PhoneGap initialization.
 * @returns {void}
 */
PhoneGap.addConstructor = function ( func )
{
    var state = document.readyState ;

    if ( state === 'loaded' || state === 'complete' )
    {
        // If the document is already loaded, execute the function immediately.
        func();
    }
    else
    {
        // Otherwise, add it to the internal queue for later execution.
        PhoneGap._constructors.push( func );
    }
};

( function ( )
{
    // Set up a timer to periodically check the document's ready state.
    var timer = setInterval( function ( )
    {
        var state = document.readyState ;

        // Once the document is fully loaded or complete, proceed with initialization.
        if ( state === 'loaded' || state === 'complete' )
        {
            clearInterval( timer ) ; // Stop the interval timer as we're done checking.

            // Execute all queued constructor functions.
            while ( PhoneGap . _constructors . length > 0 )
            {
                var constructor = PhoneGap . _constructors . shift ( ) ; // Get the next constructor.

                try
                {
                    constructor ( ) ; // Attempt to run the constructor function.
                }
                catch ( e )
                {
                    // Handle any errors that occur during constructor execution.
                    if ( typeof ( debug [ 'log' ] ) === 'function' )
                    {
                        debug . log ( "Failed to run constructor: " + debug . processMessage ( e ) ) ;
                    }
                    else
                    {
                        alert ( "Failed to run constructor: " + e . message ) ;
                    }
                }
            }

            // After all constructors have run, dispatch the 'deviceready' event.
            // This signals that PhoneGap is fully initialized and ready for use.
            var e = document . createEvent ( 'Events' ) ;
            e . initEvent ( 'deviceready' ) ;
            document . dispatchEvent ( e ) ;
        }
    } , 5 ) ; // Check every 5 milliseconds.
} ) ( ) ;


/**
 * @function PhoneGap.exec
 * @description Queues a PhoneGap command for execution. This method ensures commands
 *              are processed sequentially, preventing race conditions and ensuring
 *              they run only when PhoneGap's internal queue is ready.
 * @param {String} command - The command string, typically in "Service.Action" format.
 * @param {Array<any>} [args] - Optional arguments to pass to the command's method.
 * @returns {void}
 */
PhoneGap . exec = function ( )
{
    PhoneGap . queue . commands . push ( arguments ) ; // Add the command and its arguments to the queue.

    // If the command processing timer isn't running, start it.
    if ( PhoneGap . queue . timer === null )
    {
        PhoneGap . queue . timer = setInterval ( PhoneGap . run_command , 10 ) ; // Process queue every 10ms.
    }
} ;

/**
 * @private
 * @function PhoneGap.run_command
 * @description This is an internal function responsible for dispatching queued PhoneGap commands.
 *              It takes the next command from the queue, constructs a URL-based request,
 *              and initiates the communication with the native bridge.
 *              Arguments can be passed as URL path segments or as a query string dictionary.
 * @returns {void}
 */
PhoneGap . run_command = function ( )
{
    // Prevent execution if PhoneGap is not available or the queue is not ready.
    if ( ! PhoneGap . available || ! PhoneGap . queue . ready )
    {
        return ;
    }

    PhoneGap . queue . ready = false ; // Mark the queue as busy.

    var args = PhoneGap . queue . commands . shift ( ) ; // Retrieve the next command from the front of the queue.

    // If the queue is now empty, stop the timer.
    if ( PhoneGap . queue . commands . length === 0 )
    {
        clearInterval ( PhoneGap . queue . timer ) ;
        PhoneGap . queue . timer = null ;
    }

    var uri  = [ ] ;    // Array to store URI path segments.
    var dict = null ;   // Object to store dictionary arguments for the query string.

    // Process arguments, starting from the second element (first is the command string).
    for ( var i = 1 ; i < args . length ; i ++ )
    {
        var arg = args [ i ] ;

        // Normalize undefined or null arguments to empty strings.
        if ( arg === undefined || arg === null )
        {
            arg = '' ;
        }

        // If an argument is an object, it becomes the dictionary for query parameters.
        if ( typeof ( arg ) === 'object' )
        {
            dict = arg ;
        }
        else
        {
            // Otherwise, encode and add it as a URI path segment.
            uri . push ( encodeURIComponent ( arg ) ) ;
        }
    }

    // Construct the base URL for the command.
    var url = "gap://" + args [ 0 ] + "/" + uri . join ( "/" ) ;

    // If a dictionary object was provided, append its properties as query parameters.
    if ( dict !== null )
    {
        var query_args = [ ] ;

        for ( var name in dict )
        {
            // Ensure the property name is a string before processing.
            if ( typeof ( name ) !== 'string' )
            {
                continue ;
            }
            query_args . push ( encodeURIComponent ( name ) + "=" + encodeURIComponent ( dict [ name ] ) ) ;
        }

        // Append query string if there are any parameters.
        if ( query_args . length > 0 )
        {
            url += "?" + query_args . join ( "&" ) ;
        }
    }

    // Finally, trigger the command by navigating to the constructed URL.
    document . location = url ;

} ;
// Defines the Acceleration object constructor.
function Acceleration ( x , y , z )
{
    this . x = x ; // X-axis acceleration component.
    this . y = y ; // Y-axis acceleration component.
    this . z = z ; // Z-axis acceleration component.

    this . timestamp = new Date ( ) . getTime ( ) ; // Timestamp of when this acceleration data was captured.

    this . win  = null ; // Success callback for acceleration data.
    this . fail = null ; // Error callback for acceleration data.
}

// Global array to hold active accelerometer listeners/watchers.
var accelListeners = [ ] ;

/**
 * @class Accelerometer
 * @description Provides an interface to access the device's accelerometer sensor data.
 *              Allows retrieval of current acceleration and setting up continuous watches.
 * @constructor
 */
function Accelerometer ( )
{
    /**
     * @property {Acceleration} lastAcceleration - Stores the most recently acquired acceleration data.
     */
    this . lastAcceleration = null ;
}

/**
 * @method Accelerometer.prototype.getCurrentAcceleration
 * @description Asynchronously retrieves the device's current acceleration.
 *              It will either return the last known acceleration or initiate a watch
 *              to get new data if none is available.
 * @param {Function} successCallback - Callback function to be invoked with the Acceleration object on success.
 * @param {Function} errorCallback - Callback function to be invoked on error.
 * @param {Object} [options] - Optional parameters for data acquisition (e.g., timeout).
 * @returns {void}
 */
Accelerometer . prototype . getCurrentAcceleration = function ( successCallback , errorCallback , options )
{
    // This implementation is primarily designed for platforms where _accel obj literal is passed.
    // It attempts to use the last known acceleration if available.
    if ( typeof successCallback === "function" )
    {
        if ( this . lastAcceleration )
        {
            successCallback ( accel ) ; // Assuming 'accel' is defined globally or passed somehow.
        }
        else
        {
            // If no last acceleration, start a temporary watch to get current data.
            // Note: 'watchAcceleration' and 'this.fail' might need to be scoped correctly.
            watchAcceleration ( this . gotCurrentAcceleration , this . fail ) ;
        }
    }
} ;


// Callback method for when acceleration data is received from the native side.
Accelerometer . prototype . gotAccel = function ( key , x , y , z )
{
    console . log ( 'we won' ) ; // Debugging message.

    var a = new Acceleration ( x , y , z ) ; // Create a new Acceleration object.

    // Note: there's a potential typo here: 'a.x = z;' overwrites 'a.x = x;'. Assuming 'a.z = z;' was intended.
    a . x = x ;
    a . y = y ;
    a . x = z ; // This looks like a bug. Should probably be `a.z = z;`

    // Assign success and error callbacks from the corresponding listener entry.
    a . win  = accelListeners [ key ] . win ;
    a . fail = accelListeners [ key ] . fail ;

    this . timestamp = new Date ( ) . getTime ( ) ; // Update the timestamp.
    this . lastAcceleration = a ;                   // Store this as the last known acceleration.
    accelListeners [ key ] = a ;                    // Update the listener entry with the new data.

    // If a success callback is defined, invoke it with the new acceleration data.
    if ( typeof a . win === "function" )
    {
        a . win ( a ) ;
    }
} ;


/**
 * @method Accelerometer.prototype.watchAcceleration
 * @description Starts asynchronously acquiring acceleration data at regular intervals.
 *              The provided success callback will be invoked each time new data is available.
 * @param {Function} successCallback - Function to call with new Acceleration data.
 * @param {Function} errorCallback - Function to call if an error occurs.
 * @param {Object} [options] - Configuration options, including `frequency` (interval in ms).
 * @returns {void}
 */
Accelerometer . prototype . watchAcceleration = function ( successCallback , errorCallback , options )
{
    // TODO: Implement a mechanism to store watch IDs, allowing multiple watches to be managed and cleared.

    var frequency = ( options !== undefined ) ? options . frequency : 10000 ; // Default frequency: 10 seconds.

    var accel = new Acceleration ( 0 , 0 , 0 ) ; // Create a new Acceleration instance to store watch details.

    accel . win  = successCallback ; // Assign the success callback.
    accel . fail = errorCallback ;   // Assign the error callback.
    accel . opts = options ;         // Store the options.

    // Add this watch to the global listeners array and get its unique key.
    var key = accelListeners . push ( accel ) - 1 ;

    // Initiate the native accelerometer watch with the specified frequency and key.
    Accel . start ( frequency , key ) ;
} ;

/**
 * @method Accelerometer.prototype.clearWatch
 * @description Stops a previously initiated accelerometer watch.
 * @param {String} watchId - The identifier of the watch to clear, obtained from `watchAcceleration`.
 * @returns {void}
 */
Accelerometer . prototype . clearWatch = function ( watchId )
{
    Accel . stop ( watchId ) ; // Call the native method to stop the watch.
} ;

// Error callback for accelerometer watches.
Accelerometer . prototype . epicFail = function ( watchId , message )
{
    // Note: 'accelWatcher' and 'key' are undefined here. This might be a placeholder or a bug.
    accelWatcher [ key ] . fail ( ) ; // Invoke the error callback associated with the watch.
} ;

// Register the Accelerometer plugin with PhoneGap.
PhoneGap . addConstructor ( function ( )
{
    // If navigator.accelerometer is not already defined, instantiate a new Accelerometer object.
    if ( typeof navigator . accelerometer === "undefined" )
    {
        navigator . accelerometer = new Accelerometer ( ) ;
    }
} ) ;


/**
 * @class Camera
 * @description Provides an interface to access the device's camera functionality,
 *              allowing applications to capture images.
 * @constructor
 */
function Camera ( )
{
    // Constructor for the Camera object. Currently empty as methods are on the prototype.
}

/**
 * @method Camera.prototype.getPicture
 * @description Initiates the process of taking a picture using the device's camera.
 *              The result (image data or error) is returned via the provided callbacks.
 * @param {Function} successCallback - Function to call with the image data (e.g., base64 string) on success.
 * @param {Function} errorCallback - Function to call if an error occurs during picture capture.
 * @param {Object} [options] - Optional parameters, such as `quality` (0-100).
 * @returns {void}
 */
Camera . prototype . getPicture = function ( successCallback , errorCallback , options )
{
    this . winCallback  = successCallback ; // Store the success callback.
    this . failCallback = errorCallback ;   // Store the error callback.

    // Determine the picture quality, defaulting to 80 if not specified.
    if ( options . quality )
    {
        GapCam . takePicture ( options . quality ) ;
    }
    else
    {
        GapCam . takePicture ( 80 ) ; // Default quality.
    }
} ;

// Internal success handler for the camera operation.
Camera . prototype . win = function ( picture )
{
    this . winCallback ( picture ) ; // Invoke the stored success callback with the picture data.
} ;

// Internal error handler for the camera operation.
Camera . prototype . fail = function ( err )
{
    this . failCallback ( err ) ; // Invoke the stored error callback with the error message.
} ;

// Register the Camera plugin with PhoneGap.
PhoneGap . addConstructor ( function ( )
{
    // Ensure navigator.camera is initialized only once.
    if ( typeof navigator . camera === "undefined" )
    {
        navigator . camera = new Camera ( ) ;
    }
} ) ;


/**
 * @class Compass
 * @description Provides an interface to access the device's magnetic compass data (heading).
 * @constructor
 */
function Compass ( )
{
    /**
     * @property {number} lastHeading - Stores the last known compass heading (in degrees).
     */
    this . lastHeading = null ;

    /**
     * @property {string} lastError - Stores the last error message encountered.
     */
    this . lastError = null ;

    /**
     * @property {Object} callbacks - Object to manage event callbacks for heading changes and errors.
     */
    this . callbacks =
    {
        onHeadingChanged : [ ] , // Array of functions to call when heading changes.
        onError          : [ ]   // Array of functions to call when an error occurs.
    } ;
} ;

/**
 * @method Compass.prototype.getCurrentHeading
 * @description Asynchronously retrieves the device's current magnetic heading.
 *              If a heading is already known, it's returned immediately; otherwise,
 *              a new acquisition process is initiated.
 * @param {Function} successCallback - Callback function to be invoked with the heading data on success.
 * @param {Function} errorCallback - Callback function to be invoked on error.
 * @param {Object} [options] - Optional parameters for data acquisition (e.g., timeout).
 * @returns {void}
 */
Compass . prototype . getCurrentHeading = function ( successCallback , errorCallback , options )
{
    if ( this . lastHeading === null )
    {
        // If no heading is known yet, start the compass (assuming 'this.start' exists).
        this . start ( options ) ;
    }
    else if ( typeof successCallback === "function" ) // Check if successCallback is a function.
    {
        successCallback ( this . lastHeading ) ; // Return the last known heading.
    }
} ;

/**
 * @method Compass.prototype.watchHeading
 * @description Starts asynchronously acquiring heading data at regular intervals.
 *              The provided success callback will be invoked each time new data is available.
 * @param {Function} successCallback - Function to call with new heading data.
 * @param {Function} errorCallback - Function to call if an error occurs.
 * @param {Object} [options] - Configuration options, including `frequency` (interval in ms).
 * @returns {number} The ID of the interval timer, which can be used to clear the watch.
 */
Compass . prototype . watchHeading = function ( successCallback , errorCallback , options )
{
    // Immediately get the current heading once.
    this . getCurrentHeading ( successCallback , errorCallback , options ) ;

    var frequency = 100 ; // Default frequency for watch is 100 milliseconds.

    // Override default frequency if provided in options.
    if ( typeof ( options ) === 'object' && options . frequency )
    {
        frequency = options . frequency ;
    }

    var self = this ; // Capture 'this' for use within the interval callback.

    // Set up an interval to repeatedly call getCurrentHeading.
    return setInterval ( function ( )
    {
        self . getCurrentHeading ( successCallback , errorCallback , options ) ;
    } , frequency ) ;
} ;


/**
 * @method Compass.prototype.clearWatch
 * @description Stops a previously initiated compass heading watch.
 * @param {String} watchId - The identifier of the watch to clear, obtained from `watchHeading`.
 * @returns {void}
 */
Compass . prototype . clearWatch = function ( watchId )
{
    clearInterval ( watchId ) ; // Clear the interval timer associated with the watch ID.
} ;


/**
 * @method Compass.prototype.setHeading
 * @description Internal method called by the native framework to update the current heading.
 *              It stores the new heading and invokes all registered `onHeadingChanged` callbacks.
 * @param {Object} heading - The current heading data object.
 * @returns {void}
 */
Compass . prototype . setHeading = function ( heading )
{
    this . lastHeading = heading ; // Update the last known heading.

    // Iterate and call all registered heading change callbacks.
    // Note: using shift() here means callbacks are one-time use.
    for ( var i = 0 ; i < this . callbacks . onHeadingChanged . length ; i ++ )
    {
        var f = this . callbacks . onHeadingChanged . shift ( ) ; // Get and remove the next callback.
        f ( heading ) ; // Execute the callback with the new heading.
    }
} ;

/**
 * @method Compass.prototype.setError
 * @description Internal method called by the native framework when an error occurs
 *              during heading acquisition. It stores the error message and invokes
 *              all registered `onError` callbacks.
 * @param {String} message - The error message string.
 * @returns {void}
 */
Compass . prototype . setError = function ( message )
{
    this . lastError = message ; // Store the last encountered error message.

    // Iterate and call all registered error callbacks.
    // Note: using shift() here means callbacks are one-time use.
    for ( var i = 0 ; i < this . callbacks . onError . length ; i ++ )
    {
        var f = this . callbacks . onError . shift ( ) ; // Get and remove the next error callback.
        f ( message ) ; // Execute the callback with the error message.
    }
} ;

// Register the Compass plugin with PhoneGap.
PhoneGap . addConstructor ( function ( )
{
    // Ensure navigator.compass is initialized only once.
    if ( typeof navigator . compass === "undefined" )
    {
        navigator . compass = new Compass ( ) ;
    }
} ) ;


// Constructor for the Contact object.
var Contact = function ( )
{
    this . name   = new ContactName ( ) ; // The contact's name details.
    this . emails = [ ] ;                 // Array to hold email addresses.
    this . phones = [ ] ;                 // Array to hold phone numbers.
} ;

// Constructor for the ContactName object, representing various parts of a contact's name.
var ContactName = function ( )
{
    this . formatted       = "" ; // Full formatted name.
    this . familyName      = "" ; // Last name.
    this . givenName       = "" ; // First name.
    this . additionalNames = [ ] ; // Middle names, etc.
    this . prefixes        = [ ] ; // Prefixes (e.g., Dr., Mr.).
    this . suffixes        = [ ] ; // Suffixes (e.g., Jr., III).
} ;


// Constructor for the ContactEmail object.
var ContactEmail = function ( )
{
    this . types   = [ ] ; // Array of email types (e.g., "home", "work").
    this . address = "" ;  // The email address itself.
} ;

// Constructor for the ContactPhoneNumber object.
var ContactPhoneNumber = function ( )
{
    this . types  = [ ] ; // Array of phone number types (e.g., "mobile", "home").
    this . number = "" ;  // The phone number string.
} ;


// Constructor for the Contacts manager object.
var Contacts = function ( )
{
    this . records = [ ] ; // Array to store retrieved contact records.
} ;

/**
 * @method Contacts.prototype.find
 * @description Searches for contacts based on a provided contact object.
 *              The search term is constructed from the contact's name details.
 * @param {Contact} obj - A Contact object containing search criteria (e.g., `name`).
 * @param {Function} win - Success callback function, invoked with an array of found contacts.
 * @param {Function} fail - Error callback function, invoked if the search fails.
 * @returns {void}
 */
Contacts . prototype . find = function ( obj , win , fail )
{
    if ( obj . name !== null )
    {
        // Construct the search term for the native contact search.
        var searchTerm = '' ;

        if ( obj . name . givenName && obj . name . givenName . length > 0 )
        {
            searchTerm = obj . name . givenName . split ( ' ' ) . join ( '%' ) ;
        }

        if ( obj . name . familyName && obj . name . familyName . length > 0 )
        {
            searchTerm += obj . name . familyName . split ( ' ' ) . join ( '%' ) ;
        }

        if ( ! obj . name . familyName && ! obj . name . givenName && obj . name . formatted )
        {
            searchTerm = obj . name . formatted ;
        }

        // Call the native contact search method.
        ContactHook . search ( searchTerm , "" , "" ) ;
    }

    this . win  = win ;  // Store the success callback.
    this . fail = fail ; // Store the error callback.
} ;

// Internal method for Android to populate a found contact.
Contacts . prototype . droidFoundContact = function ( name , npa , email )
{
    var contact = new Contact ( ) ; // Create a new Contact object.
    contact . name = new ContactName ( ) ;

    contact . name . formatted = name ;
    contact . name . givenName = name ; // Assign the full name as given name for simplicity.

    var mail = new ContactEmail ( ) ;
    mail . types . push ( "home" ) ;
    mail . address = email ;
    contact . emails . push ( mail ) ; // Add the email to the contact.

    var phone = new ContactPhoneNumber ( ) ; // Declare phone with 'var'.
    phone . types . push ( "home" ) ;
    phone . number = npa ;
    contact . phones . push ( phone ) ; // Add the phone number to the contact.

    this . records . push ( contact ) ; // Add the newly created contact to the records array.
} ;

// Internal method for Android to signal that contact search is complete.
Contacts . prototype . droidDone = function ( )
{
    this . win ( this . records ) ; // Invoke the success callback with the array of found contacts.
} ;

// Register the Contacts plugin with PhoneGap.
PhoneGap . addConstructor ( function ( )
{
    // Ensure navigator.contacts is initialized only once.
    if ( typeof navigator . contacts === "undefined" )
    {
        navigator . contacts = new Contacts ( ) ;
    }
} ) ;


// Constructor for the Crypto object.
var Crypto = function ( )
{
    // No properties initialized directly in the constructor.
} ;

// Initiates an encryption operation.
Crypto . prototype . encrypt = function ( seed , string , callback )
{
    GapCrypto . encrypt ( seed , string ) ; // Call the native encryption method.
    this . encryptWin = callback ;         // Store the callback for when encryption completes.
} ;

// Initiates a decryption operation.
Crypto . prototype . decrypt = function ( seed , string , callback )
{
    GapCrypto . decrypt ( seed , string ) ; // Call the native decryption method.
    this . decryptWin = callback ;         // Store the callback for when decryption completes.
} ;

// Callback for when an encrypted string is returned from the native side.
Crypto . prototype . gotCryptedString = function ( string )
{
    this . encryptWin ( string ) ; // Invoke the stored encryption success callback.
} ;

// Callback for when a decrypted (plain) string is returned from the native side.
Crypto . prototype . getPlainString = function ( string )
{
    this . decryptWin ( string ) ; // Invoke the stored decryption success callback.
} ;

// Register the Crypto plugin with PhoneGap.
PhoneGap . addConstructor ( function ( )
{
    // Ensure navigator.Crypto is initialized only once.
    if ( typeof navigator . Crypto === "undefined" )
    {
        navigator . Crypto = new Crypto ( ) ;
    }
} ) ;


/**
 * This section of the PhoneGap API would typically define the 'Device' object.
 * It provides access to device-specific information such as:
 * - The device's model (e.g., "iPhone", "Droid").
 * - The operating system version.
 * - A unique device identifier (UUID).
 * - Other hardware and software characteristics.
 *
 * @class Device
 * @description Represents the physical mobile device.
 */