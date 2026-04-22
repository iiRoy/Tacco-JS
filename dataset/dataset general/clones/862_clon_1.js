/*
 * !
 * This is the History API JavaScript Library, version 4.2.0.
 *
 * It provides support for various browsers including:
 *   - Internet Explorer 8 and later (IE8+)
 *   - Firefox 3 and later (FF3+)
 *   - Opera 9 and later
 *   - Safari
 *   - Chrome
 *   - And other modern browsers.
 *
 * Copyright details:
 *   (C) 2011-2014, Dmitrii Pakhtinov ( spb.piksel@gmail.com )
 *
 * Project homepage:
 *   http://spb-piksel.ru/
 *
 * This software is dual licensed, meaning it can be used under either:
 *   - The MIT License: http://www.opensource.org/licenses/mit-license.php
 *   - The GNU General Public License (GPL): http://www.gnu.org/licenses/gpl.html
 *
 * Last updated: 2014-11-06 21:35
 *
 * This file contains the core logic for the HTML5 History API emulation and enhancement.
 *
 */
( function ( factory )
{
  if  (  typeof  define  ===  'function'  &&  define[  'amd'  ]  )
  {
    // AMD module definition.
    // A fix for certain AMD loading scenarios, particularly when document might not be ready.
    // Reference: https://github.com/devote/HTML5-History-API/issues/57#issuecomment-43133600
    define(  typeof  document  !==  "object"  ||  document.readyState  !==  "loading"  ?  [  ]  :  "html5-history-api",  factory  ) ;
  }
  else
  {
    // If AMD is not available, execute the factory function directly.
    factory(  ) ;
  }
} ) ( function ( )
{
  // Define a reference to the global object, which is typically 'window' in a browser environment.
  var  global  =  (  typeof  window  ===  'object'  ?  window  :  this  )  ||  {  } ;

  // Exit early if the native History API is not available or if this library has already been loaded
  // and initialized (indicated by the presence of an "emulate" property).
  if  (  !  global.history  ||  "emulate"  in  global.history  )  return  global.history  ;

  // Create a symbolic link to the document object from the global scope.
  var  document  =  global.document  ;

  // Cache a reference to the root HTML element (document.documentElement).
  var  documentElement  =  document.documentElement  ;

  // Create a symlink to the native Object constructor for consistency.
  var  Object  =  global[  'Object'  ]  ;

  // Create a symlink to the native JSON object.
  var  JSON  =  global[  'JSON'  ]  ;

  // Store a reference to the browser's native window.location object.
  var  windowLocation  =  global.location  ;

  // Store a reference to the browser's native window.history object.
  var  windowHistory  =  global.history  ;

  // Initialize historyObject. By default, it points to the native window.history.
  // This might be replaced later if emulation is necessary.
  var  historyObject  =  windowHistory  ;

  // Cache the native history.pushState method.
  var  historyPushState  =  windowHistory.pushState  ;

  // Cache the native history.replaceState method.
  var  historyReplaceState  =  windowHistory.replaceState  ;

  // Determine if the browser natively supports the HTML5 History API (pushState/replaceState).
  var  isSupportHistoryAPI  =  !!  historyPushState  ;

  // Check if the 'state' object is supported directly within the History interface.
  var  isSupportStateObjectInHistory  =  'state'  in  windowHistory  ;

  // Cache the native Object.defineProperty method for later use.
  var  defineProperty  =  Object.defineProperty  ;

  // Initialize locationObject. For IE8, it will be an HTMLAnchorElement; otherwise, a plain object.
  // The `redefineProperty({}, 't')` call is a check for defineProperty's behavior.
  var  locationObject  =  redefineProperty(  {  } ,  't'  )  ?  {  }  :  document.createElement(  'a'  )  ;

  // Initialize the event name prefix (e.g., 'on' for attachEvent).
  var  eventNamePrefix  =  ''  ;

  // Determine the correct method name for adding event listeners (addEventListener or attachEvent).
  var  addEventListenerName  =  global.addEventListener  ?  'addEventListener'  :  (  eventNamePrefix  =  'on'  )  &&  'attachEvent'  ;

  // Determine the correct method name for removing event listeners.
  var  removeEventListenerName  =  global.removeEventListener  ?  'removeEventListener'  :  'detachEvent'  ;

  // Determine the correct method name for dispatching events.
  var  dispatchEventName  =  global.dispatchEvent  ?  'dispatchEvent'  :  'fireEvent'  ;

  // Create references to the native event handling methods from the global object.
  var  addEvent  =  global[  addEventListenerName  ]  ;
  var  removeEvent  =  global[  removeEventListenerName  ]  ;
  var  dispatch  =  global[  dispatchEventName  ]  ;

  // Default configuration settings for the library.
  var  settings  =  {  "basepath" :  '/' ,  "redirect" :  0 ,  "type" :  '/' ,  "init" :  0  }  ;

  // The key used for storing data in sessionStorage.
  var  sessionStorageKey  =  '__historyAPI__'  ;

  // A temporary HTMLAnchorElement used by the parseURL function to easily parse URLs.
  var  anchorElement  =  document.createElement(  'a'  )  ;

  // Stores the last known URL before a change, useful for comparison.
  var  lastURL  =  windowLocation.href  ;

  // A control URL used to fix a specific bug observed in Opera browsers.
  var  checkUrlForPopState  =  ''  ;

  // Flag to manage event triggering in window attributes, specifically for Safari 8.
  var  triggerEventsInWindowAttributes  =  1  ;

  // A boolean flag indicating whether the initial 'popstate' event should be fired on page load.
  var  isFireInitialState  =  false  ;

  // A flag to detect if 'history.location' is being accessed or used by other parts of the code.
  var  isUsedHistoryLocationFlag  =  0  ;

  // An object to store 'state' objects associated with URLs within the current session.
  var  stateStorage  =  {  }  ;

  // An object that will hold custom event handlers registered with the library.
  var  eventsList  =  {  }  ;

  // Stores the document's title, primarily for restoring it after state changes.
  var  lastTitle  =  document.title  ;


  /**
   * Properties that will be replaced or added to the global 'window' object.
   * This is done to prevent potential conflicts with existing browser implementations
   * or to provide enhanced functionality.
   *
   * @type {Object}
   */
  var  eventsDescriptors  =  {
    "onhashchange" :  null ,
    "onpopstate" :  null
  } ;


  /**
   * Provides a specific fix for Chrome browsers, particularly on iOS,
   * addressing an issue where `global.history` might not be the same as `windowHistory`.
   * See: https://github.com/devote/HTML5-History-API/issues/29 for more context.
   *
   * @param {Function} method - The history method (e.g., pushState, replaceState) to call.
   * @param {Array} args - The arguments to pass to the history method.
   */
  var  fastFixChrome  =  function ( method ,  args )
  {
    var  isNeedFix  =  global.history  !==  windowHistory  ;

    if  (  isNeedFix  )
    {
      global.history  =  windowHistory  ;
    }

    // Apply the original history method with the provided arguments.
    method.apply(  windowHistory ,  args  )  ;

    if  (  isNeedFix  )
    {
      global.history  =  historyObject  ;
    }
  } ;


  /**
   * Properties and methods that will be either replaced or added to the
   * `window.history` object. This includes the `history.location` object,
   * which is crucial for comprehensive URL manipulation capabilities.
   *
   * @type {Object}
   */
  var  historyDescriptors  =  {
    /**
     * Configures the library's initialization settings.
     * This method allows custom configuration of base paths and redirection behavior.
     *
     * @param {null|String} [basepath] - The base path for the site; defaults to the root "/".
     * @param {null|String} [type] - A string to substitute after the anchor; defaults to "/".
     * @param {null|Boolean} [redirect] - A flag to enable or disable link translation.
     */
    "setup" :  function ( basepath ,  type ,  redirect )
    {
      // Set the base path, ensuring it ends with a slash.
      settings[  "basepath"  ]  =  (  ''  +  (  basepath  ==  null  ?  settings[  "basepath"  ]  :  basepath  )  )
        .replace(  /(?:^|\/)[^\/]*$/ ,  '/'  )  ;

      // Set the type, using the default if not provided.
      settings[  "type"  ]  =  type  ==  null  ?  settings[  "type"  ]  :  type  ;

      // Set the redirect flag, converting to boolean.
      settings[  "redirect"  ]  =  redirect  ==  null  ?  settings[  "redirect"  ]  :  !!  redirect  ;
    } ,

    /**
     * Initiates a redirection based on the configured basepath and type.
     * This function checks the current URL and redirects if it matches certain patterns.
     *
     * @namespace history
     * @param {String} [type] - Optional type parameter to override the default.
     * @param {String} [basepath] - Optional basepath parameter to override the default.
     */
    "redirect" :  function ( type ,  basepath )
    {
      // Apply setup if parameters are provided.
      historyObject[  'setup'  ]  (  basepath ,  type  )  ;

      basepath  =  settings[  "basepath"  ]  ;

      // Only perform redirection if the current window is the top-level window.
      if  (  global.top  ==  global.self  )
      {
        var  relative  =  parseURL(  null ,  false ,  true  )._relative  ;
        var  path  =  windowLocation.pathname  +  windowLocation.search  ;

        if  (  isSupportHistoryAPI  )
        {
          path  =  path.replace(  /([^\/])$/ ,  '$1/'  )  ;

          // If the relative path doesn't match the basepath and the path tests positive against basepath.
          if  (  relative  !=  basepath  &&  (  new  RegExp(  "^"  +  basepath  +  "$" ,  "i"  )  ).test(  path  )  )
          {
            windowLocation.replace(  relative  )  ;
          }
        }
        else  if  (  path  !=  basepath  )
        {
          path  =  path.replace(  /([^\/])\?/ ,  '$1/?'  )  ;

          // If the path starts with the basepath (case-insensitive).
          if  (  (  new  RegExp(  "^"  +  basepath ,  "i"  )  ).test(  path  )  )
          {
            // Perform a hash-based redirection for older browsers.
            windowLocation.replace(  basepath  +  '#'  +  path.
              replace(  new  RegExp(  "^"  +  basepath ,  "i"  ) ,  settings[  "type"  ]  )  +  windowLocation.hash  )  ;
          }
        }
      }
    } ,

    /**
     * The `pushState()` method adds an entry to the browser's session history stack.
     * This method is part of the HTML5 History API specification.
     *
     * @namespace history
     * @param {Object} state - A state object associated with the history entry.
     * @param {string} title - A title for the history entry, largely ignored by browsers.
     * @param {string} [url] - The new URL for the history entry.
     */
    pushState :  function ( state ,  title ,  url )
    {
      var  t  =  document.title  ;

      if  (  lastTitle  !=  null  )
      {
        document.title  =  lastTitle  ;
      }

      // Call the native pushState if available, applying the Chrome fix if needed.
      historyPushState  &&  fastFixChrome(  historyPushState ,  arguments  )  ;

      // Update the internal state and URL.
      changeState(  state ,  url  )  ;

      document.title  =  t  ; // Restore the original title temporarily.
      lastTitle  =  title  ;  // Store the new title.
    } ,

    /**
     * The `replaceState()` method updates the state object, title, and optionally
     * the URL of the current entry in the browser's session history.
     *
     * @namespace history
     * @param {Object} state - A state object associated with the history entry.
     * @param {string} title - A title for the history entry.
     * @param {string} [url] - The new URL for the history entry.
     */
    replaceState :  function ( state ,  title ,  url )
    {
      var  t  =  document.title  ;

      if  (  lastTitle  !=  null  )
      {
        document.title  =  lastTitle  ;
      }

      // Remove the old state from storage before replacing.
      delete  stateStorage[  windowLocation.href  ]  ;

      // Call the native replaceState if available, applying the Chrome fix if needed.
      historyReplaceState  &&  fastFixChrome(  historyReplaceState ,  arguments  )  ;

      // Update the internal state and URL, marking it as a replacement.
      changeState(  state ,  url ,  true  )  ;

      document.title  =  t  ; // Restore the original document title.
      lastTitle  =  title  ;  // Update the stored last title.
    } ,

    /**
     * The `history.location` object is an emulated or enhanced version of `window.location`.
     * In HTML4-compatible browsers, it provides a consistent interface using hash-based routing.
     *
     * @namespace history
     */
    "location" :  {
      set :  function ( value )
      {
        // Set a flag to indicate that history.location has been used.
        if  (  isUsedHistoryLocationFlag  ===  0  )  isUsedHistoryLocationFlag  =  1  ;

        // Delegate setting to the global location object.
        global.location  =  value  ;
      } ,
      get :  function ( )
      {
        // Set a flag to indicate that history.location has been accessed.
        if  (  isUsedHistoryLocationFlag  ===  0  )  isUsedHistoryLocationFlag  =  1  ;

        // Return native window.location if History API is supported, otherwise return the emulated locationObject.
        return  isSupportHistoryAPI  ?  windowLocation  :  locationObject  ;
      }
    } ,

    /**
     * The `state` object represents a user interface state associated with the current
     * history entry. It can be any JavaScript object.
     *
     * @namespace history
     */
    "state" :  {
      get :  function ( )
      {
        // Retrieve the state object from session storage based on the current URL, or return null if not found.
        return  stateStorage[  windowLocation.href  ]  ||  null  ;
      }
    }
  } ;


  /**
   * Descriptors for properties of the `history.location` object.
   * This object mimics the `window.location` interface but with additional
   * logic for HTML4 browsers and hash-based routing.
   *
   * @type {Object}
   */
  var  locationDescriptors  =  {
    /**
     * Navigates the browser to the given URL.
     * If the URL is a hash, it updates the state without a full page reload.
     *
     * @namespace history.location
     * @param {string} url - The URL to navigate to.
     */
    assign :  function ( url )
    {
      if  (  (  ''  +  url  ).indexOf(  '#'  )  ===  0  )
      {
        // If it's a hash-only change, update the state directly.
        changeState(  null ,  url  )  ;
      }
      else
      {
        // Otherwise, use the native window.location.assign.
        windowLocation.assign(  url  )  ;
      }
    } ,

    /**
     * Reloads the current page.
     * This method directly calls the native `window.location.reload()`.
     *
     * @namespace history.location
     */
    reload :  function ( )
    {
      windowLocation.reload(  )  ;
    } ,

    /**
     * Replaces the current page in the session history with a new URL.
     * Similar to `assign`, but it doesn't add a new entry to the history.
     *
     * @namespace history.location
     * @param {string} url - The URL to replace the current one with.
     */
    replace :  function ( url )
    {
      if  (  (  ''  +  url  ).indexOf(  '#'  )  ===  0  )
      {
        // If it's a hash-only change, update the state as a replacement.
        changeState(  null ,  url ,  true  )  ;
      }
      else
      {
        // Otherwise, use the native window.location.replace.
        windowLocation.replace(  url  )  ;
      }
    } ,

    /**
     * Returns the full URL of the current page.
     * This is typically the same as the `href` property.
     *
     * @namespace history.location
     * @returns {string} The full URL.
     */
    toString :  function ( )
    {
      return  this.href  ;
    } ,

    /**
     * Represents the entire URL of the current page.
     * Setting this property will navigate the browser to the new URL.
     *
     * @namespace history.location
     */
    "href" :  {
      get :  function ( )
      {
        // Retrieves the full href from the parsed URL object.
        return  parseURL(  )._href  ;
      }
    } ,

    /**
     * Represents the protocol scheme of the URL (e.g., "http:", "https:").
     *
     * @namespace history.location
     */
    "protocol" :  null , // This property will be dynamically populated.

    /**
     * Represents the host name and port number of the URL (e.g., "example.com:8080").
     *
     * @namespace history.location
     */
    "host" :  null , // This property will be dynamically populated.

    /**
     * Represents the host name of the URL (e.g., "example.com").
     *
     * @namespace history.location
     */
    "hostname" :  null , // This property will be dynamically populated.

    /**
     * Represents the port number of the URL (e.g., "8080").
     *
     * @namespace history.location
     */
    "port" :  null , // This property will be dynamically populated.

    /**
     * Represents the path component of the URL (e.g., "/path/to/page.html").
     *
     * @namespace history.location
     */
    "pathname" :  {
      get :  function ( )
      {
        // Retrieves the pathname from the parsed URL object.
        return  parseURL(  )._pathname  ;
      }
    } ,

    /**
     * Represents the query string of the URL, starting with '?'
     * (e.g., "?param1=value1&param2=value2").
     *
     * @namespace history.location
     */
    "search" :  {
      get :  function ( )
      {
        // Retrieves the search query string from the parsed URL object.
        return  parseURL(  )._search  ;
      }
    } ,

    /**
     * Represents the fragment identifier (hash) of the URL, starting with '#'.
     * Setting this property will update the hash without a full page reload.
     *
     * @namespace history.location
     */
    "hash" :  {
      set :  function ( value )
      {
        // Update the state with the new hash value.
        // Ensure the hash starts with '#' (or is empty).
        changeState(  null ,  (  ''  +  value  ).replace(  /^(#|)/ ,  '#'  ) ,  false ,  lastURL  )  ;
      } ,
      get :  function ( )
      {
        // Retrieves the hash fragment from the parsed URL object.
        return  parseURL(  )._hash  ;
      }
    }
  } ;


  /**
   * A simple, empty function used as a placeholder or default callback.
   * It performs no operation.
   *
   * @returns {void}
   */
  function  emptyFunction ( )
  {
    // This function intentionally does nothing. It's a dummy.
  }


  /**
   * Parses a given URL (or the current window.location) into its constituent parts.
   * It normalizes relative URLs and handles differences between History API-enabled
   * and older browsers (using hash-based routing).
   *
   * @param {string} [href] - The URL string to parse. If null or undefined, uses window.location.href.
   * @param {boolean} [isWindowLocation] - If true, treats `href` as the literal window.location.href.
   * @param {boolean} [isNotAPI] - If true, forces parsing as if History API is not supported.
   * @returns {Object} An object containing parsed URL components (e.g., _href, _protocol, _host, etc.).
   */
  function  parseURL ( href ,  isWindowLocation ,  isNotAPI )
  {
    // Regular expression to break down a URL into its components:
    // protocol, host, port, pathname, search, hash.
    var  re  =  /(?:(\w+\:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/  ;

    // Process the URL if 'href' is provided and not specifically treated as window.location.
    if  (  href  !=  null  &&  href  !==  ''  &&  !  isWindowLocation  )
    {
      var  current  =  parseURL(  )  ;
      var  base  =  document.getElementsByTagName(  'base'  ) [  0  ]  ;

      // Handle base tag for relative URLs, especially for IE.
      if  (  !  isNotAPI  &&  base  &&  base.getAttribute(  'href'  )  )
      {
        // Fix for IE ignoring relative base tags.
        // See: http://stackoverflow.com/questions/3926197/html-base-tag-and-local-folder-path-with-internet-explorer
        base.href  =  base.href  ;
        current  =  parseURL(  base.href ,  null ,  true  )  ;
      }

      var  _pathname  =  current._pathname  ;
      var  _protocol  =  current._protocol  ;

      // Ensure href is a string type.
      href  =  ''  +  href  ;

      // Convert relative links to absolute URLs based on the current context.
      href  =  /^(?:\w+\:)?\/\//.test(  href  )  ?  href.indexOf(  "/"  )  ===  0
        ?  _protocol  +  href  :  href  :  _protocol  +  "//"  +  current._host  +  (
        href.indexOf(  "/"  )  ===  0  ?  href  :  href.indexOf(  "?"  )  ===  0
          ?  _pathname  +  href  :  href.indexOf(  "#"  )  ===  0
          ?  _pathname  +  current._search  +  href  :  _pathname.replace(  /[^\/]+$/g ,  ''  )  +  href
      )  ;
    }
    else
    {
      // If no href is provided, use window.location.href.
      href  =  isWindowLocation  ?  href  :  windowLocation.href  ;

      // If the current browser does not support the History API (or isNotAPI is true).
      if  (  !  isSupportHistoryAPI  ||  isNotAPI  )
      {
        // Extract the hash fragment.
        href  =  href.replace(  /^[^#]*/ ,  ''  )  ||  "#"  ;

        // Construct an absolute link from the hash for older browsers.
        // This addresses an issue: https://github.com/devote/HTML5-History-API/issues/50
        href  =  windowLocation.protocol.replace(  /:.*$|$/ ,  ':'  )  +  '//'  +  windowLocation.host  +  settings[  'basepath'  ]
          +  href.replace(  new  RegExp(  "^#[\/]?(?:"  +  settings[  "type"  ]  +  ")?"  ) ,  ""  )  ;
      }
    }

    // Assign the (potentially modified) href to the anchorElement.
    // This leverages the browser's native URL parsing capabilities.
    anchorElement.href  =  href  ;

    // Decompose the link into its various parts using the regular expression.
    var  result  =  re.exec(  anchorElement.href  )  ;

    // Extract the host name, including the port number if present.
    var  host  =  result[  2  ]  +  (  result[  3  ]  ?  ':'  +  result[  3  ]  :  ''  )  ;

    // Extract the path component, defaulting to '/' if empty.
    var  pathname  =  result[  4  ]  ||  '/'  ;

    // Extract the query string, defaulting to an empty string.
    var  search  =  result[  5  ]  ||  ''  ;

    // Extract the hash, ensuring it's an empty string if it's just '#'.
    var  hash  =  result[  6  ]  ===  '#'  ?  ''  :  (  result[  6  ]  ||  ''  )  ;

    // Construct the relative link (pathname + search + hash).
    var  relative  =  pathname  +  search  +  hash  ;

    // Generate a special link for hash-based routing in non-History API browsers.
    var  nohash  =  pathname.replace(  new  RegExp(  "^"  +  settings[  "basepath"  ] ,  "i"  ) ,  settings[  "type"  ]  )  +  search  ;

    // Return an object containing all parsed URL components.
    return  {
      _href :  result[  1  ]  +  '//'  +  host  +  relative ,
      _protocol :  result[  1  ] ,
      _host :  host ,
      _hostname :  result[  2  ] ,
      _port :  result[  3  ]  ||  '' ,
      _pathname :  pathname ,
      _search :  search ,
      _hash :  hash ,
      _relative :  relative ,
      _nohash :  nohash ,
      _special :  nohash  +  hash
    }
  }


  /**
   * Initializes the session storage mechanism for custom state objects.
   * This function attempts to use `sessionStorage` and falls back to cookies
   * if `sessionStorage` is unavailable or throws an error (e.g., due to disabled cookies).
   */
  function  storageInitialize ( )
  {
    var  sessionStorage  ;

    /**
     * sessionStorage can sometimes throw an error, especially when cookies are disabled.
     * This often occurs in specific environments like Facebook IFrames or Chrome with
     * restrictive content settings.
     * See: https://github.com/devote/HTML5-History-API/issues/34
     * And also: http://stackoverflow.com/a/12976988/669360
     */
    try
    {
      sessionStorage  =  global[  'sessionStorage'  ]  ;

      // Test sessionStorage availability by setting and removing a dummy item.
      sessionStorage.setItem(  sessionStorageKey  +  't' ,  '1'  )  ;
      sessionStorage.removeItem(  sessionStorageKey  +  't'  )  ;
    }
    catch ( _e_ )
    {
      // Fallback to a cookie-based storage mechanism if sessionStorage fails.
      sessionStorage  =  {
        getItem :  function ( key )
        {
          var  cookie  =  document.cookie.split(  key  +  "="  )  ;
          // Retrieve the value from the cookie string.
          return  cookie.length  >  1  &&  cookie.pop(  ).split(  ";"  ).shift(  )  ||  'null'  ;
        } ,
        setItem :  function ( key ,  value )
        {
          var  state  =  {  }  ;
          // Store the current state object in a cookie.
          if  (  state[  windowLocation.href  ]  =  historyObject.state  )
          {
            document.cookie  =  key  +  '='  +  JSON.stringify(  state  )  ;
          }
        }
      }
    }

    try
    {
      // Attempt to retrieve cached state data from sessionStorage.
      stateStorage  =  JSON.parse(  sessionStorage.getItem(  sessionStorageKey  )  )  ||  {  }  ;
    }
    catch ( _e_ )
    {
      // If parsing fails (e.g., corrupted data), initialize stateStorage as an empty object.
      stateStorage  =  {  }  ;
    }

    // Attach an event handler to the 'unload' event to persist state.
    addEvent(  eventNamePrefix  +  'unload' ,  function ( )
    {
      // On page unload, save the current state's object to session storage.
      sessionStorage.setItem(  sessionStorageKey ,  JSON.stringify(  stateStorage  )  )  ;
    } ,  false  )  ;
  }


  /**
   * This utility method attempts to override or add properties to an object,
   * particularly useful for browser inconsistencies where `Object.defineProperty`
   * might not fully work or be available. It tries to ensure the desired
   * property behavior (set/get) is achieved.
   *
   * @param {Object} object - The target object where the property will be modified or added.
   * @param {String} prop - The name of the property to be overridden or added.
   * @param {Object} [descriptor] - An object containing property descriptors (e.g., 'set', 'get').
   * @param {Function} [onWrapped] - An optional callback function to be invoked if a wrapper is created.
   * @returns {Object|Boolean} Returns the modified object on success, or `false` if the operation fails.
   */
  function  redefineProperty ( object ,  prop ,  descriptor ,  onWrapped )
  {
    var  testOnly  =  0  ;

    // If descriptor is not provided, this call is likely for testing purposes.
    if  (  !  descriptor  )
    {
      descriptor  =  {  set :  emptyFunction  }  ; // Use a dummy setter for testing.
    }