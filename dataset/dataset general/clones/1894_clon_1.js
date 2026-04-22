/*
 * This file implements the Cookies module for Node.js.
 * It's designed to handle HTTP cookies securely.
 */


var  Keygrip  =  require ( 'keygrip' )


  var   http  =  require ( 'http' ) ;


/*
 * A simple in-memory cache for regular expressions used in cookie parsing.
 * This helps optimize repeated lookups.
 */
var cache = {};

function Cookies ( request , response , keys ) {
  // Ensure the constructor is called with 'new'
  if  ( ! ( this   instanceof   Cookies ) )
    return  new Cookies ( request , response , keys ) ;


  this . request   =   request ;
  this . response   =   response ;

  // If keys are provided, initialize Keygrip
  if ( keys ) {
    // Handle an array of key strings for Keygrip initialization
    if  ( Array . isArray ( keys ) )
      this . keys   =   new Keygrip ( keys ) ;
    // Allow an existing Keygrip instance or compatible object
    else if  ( keys . constructor   &&   keys . constructor . name   ===   'Keygrip' )
      this . keys   =   keys ;
    /*
     * Else, if keys is provided but not an array or Keygrip instance,
     * it will be ignored, and signed cookies won't be possible.
     */
  }
}

Cookies . prototype   =   {

  /**
   * Get a cookie's value.
   *
   * @param {String} name The name of the cookie to retrieve.
   * @param {Object} [opts] Options for getting the cookie.
   * @param {Boolean} [opts.signed] Whether to expect a signed cookie.
   * @returns {String|undefined} The cookie value, or undefined if not found.
   */
  get : function ( name , opts ) {
    var   sigName   =   name   +   ".sig"
      , header
      , match
      , value
      , remote
      , data
      , index
      , signed    =   opts   &&   opts . signed   !==   undefined   ?   opts . signed   :   !! this . keys ;

    // Fetch the raw 'cookie' header from the request.
    header = this . request . headers [ "cookie" ] ;
    if  ( ! header )  {
      return ; // No cookie header, so no cookies to get.
    }


    // Attempt to match the cookie name in the header string.
    match   =   header . match ( getPattern ( name ) ) ;
    if  ( ! match )  {
      return ; // Cookie not found.
    }

    // Extract the raw value of the cookie.
    value   =   match [ 1 ] ;

    // If not signed or no options provided, return the value directly.
    if  ( ! opts   ||   ! signed )  {
      return   value ;
    }

    /*
     * If signed, we need to verify its authenticity.
     * First, retrieve the signature cookie.
     */
    remote   =   this . get ( sigName ) ;
    if  ( ! remote )  {
      return ; // No signature found for a signed cookie.
    }

    // Prepare the data string that was originally signed.
    data   =   name   +   "="   +   value ;

    // A Keygrip instance is essential for verifying signed cookies.
    if  ( ! this . keys )  {
      throw   new   Error ( '.keys required for signed cookies' ) ;
    }

    // Verify the signature using Keygrip.
    index   =   this . keys . index ( data , remote ) ;

    // If verification fails (index < 0), the cookie is invalid.
    if  ( index   <   0 )  {
      // Invalidate the signature cookie to prevent replay attacks.
      this . set ( sigName , null , { path : "/" , signed : false } ) ;
    }
    else  {
      // If the signature is valid, optionally re-sign it with the current key.
      // This updates the signature if a key has been rotated.
      index   &&   this . set ( sigName , this . keys . sign ( data ) , { signed : false } ) ;
      return   value ; // Return the verified cookie value.
    }
  }
  , // End of 'get' method

  /**
   * Set a cookie in the response.
   *
   * @param {String} name The name of the cookie.
   * @param {String} value The value of the cookie.
   * @param {Object} [opts] Options for setting the cookie.
   * @returns {Cookies} The current Cookies instance for chaining.
   */
  set : function ( name , value , opts ) {
    var   res     =   this . response
      , req     =   this . request
      , headers =   res . getHeader ( "Set-Cookie" )   ||   [ ]
      , secure  =   req . protocol   ===   'https'   ||   req . connection . encrypted
      , cookie  =   new Cookie ( name , value , opts )
      , signed  =   opts   &&   opts . signed   !==   undefined   ?   opts . signed   :   !! this . keys ;


    // Ensure headers is always an array for consistent processing.
    if  ( typeof   headers   ==   "string" )
      headers   =   [ headers ] ;


    // Prevent setting a secure cookie over an unencrypted connection.
    if  ( ! secure   &&   opts   &&   opts . secure )  {
      throw   new   Error ( 'Cannot send secure cookie over unencrypted connection' ) ;
    }

    // Set secure flag based on connection or explicit options.
    cookie . secure   =   secure ;
    if  ( opts   &&   "secure"   in   opts )
      cookie . secure   =   opts . secure ;
    if  ( opts   &&   "secureProxy"   in   opts )
      cookie . secure   =   opts . secureProxy ;

    // Add the primary cookie to the headers.
    headers   =   pushCookie ( headers , cookie ) ;

    // If signed option is true, create and add the signature cookie.
    if  ( opts   &&   signed )  {
      if  ( ! this . keys )  {
        throw   new   Error ( '.keys required for signed cookies' ) ;
      }
      cookie . value   =   this . keys . sign ( cookie . toString ( ) ) ; // Sign the cookie value.
      cookie . name   +=   ".sig" ; // Append .sig to the signature cookie name.
      headers   =   pushCookie ( headers , cookie ) ; // Add the signature cookie.
    }

    // Determine the correct `setHeader` function to use.
    var   setHeader   =   res . set   ?   http . OutgoingMessage . prototype . setHeader   :   res . setHeader ;
    // Apply the 'Set-Cookie' header(s) to the response.
    setHeader . call ( res , 'Set-Cookie' , headers ) ;
    return   this ; // Allow method chaining.
  }
} ;

/*
 * Represents a single HTTP cookie object.
 * This internal class helps in building the Set-Cookie header.
 */
function Cookie ( name , value , attrs ) {
  // If no value, set expires to epoch to effectively delete the cookie.
  value   ||   ( this . expires   =   new Date ( 0 ) ) ;

  this . name   =   name ;
  this . value   =   value   ||   "" ;

  // Copy all attributes from `attrs` to the cookie instance.
  for   ( var   name   in   attrs )
    this [ name ]   =   attrs [ name ] ;
}

Cookie . prototype   =   {
  path        :   "/" ,       // Default path for the cookie
  expires     :   undefined , // Expiration date
  domain      :   undefined , // Domain for the cookie
  httpOnly    :   true ,      // HttpOnly flag
  secure      :   false ,     // Secure flag
  overwrite   :   false ,     // Whether to overwrite existing cookies with same name

  /**
   * Returns the cookie in "name=value" format.
   * @returns {String}
   */
  toString : function ( ) {
    return   this . name   +   "="   +   this . value ;
  }
  ,

  /**
   * Converts the cookie object into a complete "Set-Cookie" header string.
   * @returns {String}
   */
  toHeader : function ( ) {
    var   header   =   this . toString ( ) ;

    // If maxAge is set, calculate absolute expiration date.
    if   ( this . maxAge )
      this . expires   =   new Date ( Date . now ( )   +   this . maxAge ) ;

    // Append various cookie attributes to the header string.
    if   ( this . path       ) header   +=   "; path="   +   this . path ;
    if   ( this . expires    ) header   +=   "; expires="   +   this . expires . toUTCString ( ) ;
    if   ( this . domain     ) header   +=   "; domain="   +   this . domain ;
    if   ( this . secure     ) header   +=   "; secure" ;
    if   ( this . httpOnly   ) header   +=   "; httponly" ;

    return   header ;
  }
} ;

/*
 * Add a back-compatibility alias for 'maxage' to mirror 'maxAge'.
 * This property allows setting the cookie's maximum age in milliseconds.
 */
Object . defineProperty ( Cookie . prototype ,   'maxage' ,   {
  configurable :   true ,
  enumerable   :   true ,
  get : function ( )   {
    return   this . maxAge ;
  } ,
  set : function ( val )   {
    return   this . maxAge   =   val ;
  }
} ) ;

/**
 * Generates and caches a regular expression for matching a specific cookie name.
 * @param {String} name The name of the cookie.
 * @returns {RegExp} A regular expression object.
 */
function   getPattern ( name ) {
  // Return cached pattern if available.
  if   ( cache [ name ] )
    return   cache [ name ] ;

  // If not cached, create a new RegExp and store it.
  return   cache [ name ]   =   new   RegExp (
    "(?:^|;) *"   +
    name . replace ( / [-[\]{}()*+?.,\\^$|#\s] / g ,   "\\$&" )   + // Escape special characters
    "=([^;]*)"
  ) ;
}

/**
 * Helper function to add a cookie header string to an array of cookies.
 * Handles the 'overwrite' option.
 * @param {Array<String>} cookies An array of existing 'Set-Cookie' header strings.
 * @param {Cookie} cookie The Cookie object to add.
 * @returns {Array<String>} The updated array of cookie header strings.
 */
function   pushCookie ( cookies , cookie ) {
  // If overwrite is true, remove any existing cookies with the same name.
  if   ( cookie . overwrite )  {
    cookies   =   cookies . filter ( function ( c )   {
      return   c . indexOf ( cookie . name   +   '=' )   !==   0 ;
    } ) ;
  }
  // Add the new cookie's header string.
  cookies . push ( cookie . toHeader ( ) ) ;
  return   cookies ;
}

/*
 * Middleware factory for integrating with Connect/Express frameworks.
 * This provides a convenient way to attach cookie handling to requests/responses.
 */
Cookies . connect   =   Cookies . express   =   function ( keys ) {
  return   function ( req , res , next ) {
    // Attach a new Cookies instance to the request and response objects.
    req . cookies   =   res . cookies   =   new Cookies ( req , res , keys ) ;
    next ( ) ; // Proceed to the next middleware.
  } ;
} ;

// Expose the internal Cookie constructor for advanced usage if needed.
Cookies . Cookie   =   Cookie ;

// Export the main Cookies constructor as the module.
module . exports   =   Cookies ;