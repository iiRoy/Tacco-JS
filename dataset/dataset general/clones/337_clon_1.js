/*
 * lazyLoad
 * @description     Loads images onto the page as the user scrolls them into view.
 * @version         2.0.0 - Released 2014 / 09 / 11
 * @author          Aaron Barker
 * @requires        jQuery (version 1.8 or later)
 * @copyright       Copyright 2013 by Intellectual Reserve, Inc. All rights reserved.
 *                  This software is proprietary and confidential.
 */
; (  function   (   $  ,  window  ,  document  ,  undefined   )    {

    "use strict"  ; /* Ensure strict mode for better code quality */

    // Cache the jQuery window object for performance
    var $window       =  $ ( window  )  ,

        // Define the plugin's name to avoid conflicts
        pluginName    =  "lazyLoad"  ,

        // Default options for the plugin
        defaults      =  {
            lazyClass       :  "lazy"  ,          // CSS class applied to lazy-loaded images
            doneClass       :  "lazyLoadDone"  ,  // CSS class added once an image is loaded
            placeholder     :  "data:image/gif;base64,R0lGODlhAQABAPAAAAAAAAAAACH/C1hNUCBEYXRhWE1QRT94cGFja2V0IDE2MDZCIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZERDQ1MzVGMkZGMTExRTFBQTE4OTE5ODk4MQAh+QQFAAAAACwAAAAAAQABAEACAkQBADs="  , // A tiny transparent GIF placeholder
            updateOnResize  :  true  ,            // Re-check image positions on window resize
            secondaryScroll :  ""  ,              // Optional: selector for an additional scrollable element (e.g., horizontal scroller)
            attList         :  [ "src"  ,  "width"  ,  "height"  ,  "alt"  ,  "class"  ]  , // Attributes to transfer from data-* to <img>

            // Timing and threshold configurations
            threshold       :  300  ,             // Pixels above/below the viewport to start loading images
            resizeDelay     :  100  ,             // Debounce delay for scroll/resize events (in ms)
            fadeSpeed       :  250  ,             // Speed of the fade-in animation (in ms)
            loadHidden      :  false  ,           // If true, loads images even if they are hidden (display: none, visibility: hidden)
            mustForce       :  false  ,           // If true, images won't load unless explicitly forced (e.g., via loadNow method)
            srcs            :  [ "2x"  ,  "desktop"  ,  "mobile"  ]  , // Ordered list of data-src attributes to check
            srcFallback     :  "desktop"  ,       // Default source to use if no other `srcs` match
            tests           :  { // High-level tests for determining which `src` to use; can be extended or overridden
                "2x"        :  function (  )  {
                    return   window.devicePixelRatio   >   1  ;
                }  ,
                "mobile"    :  function (  )  {
                    return   $ ( window  )  . width (  )   <   600  ;
                }  ,
                "desktop"   :  function (  )  {
                    return   $ ( window  )  . width (  )   >   600  ;
                }
            }
        }  ;

    /*
     * Plugin constructor function.
     * @param {HTMLElement} element - The DOM element to which the plugin is attached.
     * @param {Object} options - User-defined options to override defaults.
     */
    function   Plugin (   element  ,  options   )   {
        this.element     =   $ (  element  )  ; // Wrap the element in a jQuery object
        this.options     =   $ . extend  (  {  }  ,  defaults  ,  options  )  ; // Merge options
        this._defaults   =   defaults  ; // Keep a reference to the original defaults
        this._name       =   pluginName  ; // Store the plugin name
        this.init (  )  ; // Initialize the plugin
    }

    // Extend the Plugin prototype with methods
    $ . extend (  Plugin . prototype  ,  {
        // Primary initialization method
        init  :  function   (  )   {
            this . _create (  )  ; // Setup initial elements and event listeners
            this . _init (  )  ;   // Perform initial checks and loading
        }  ,

        // Create method: sets up event handlers and initial state
        _create  :  function   (  )   {
            var   opts          =  this . options  ,    // Cache options for quicker access
                self          =  this  ,              // Reference to the plugin instance
                elem          =  self . element  ,      // The element the plugin is bound to
                widgetName    =  self . widgetName  ,    // The plugin's widget name (currently undefined, but good practice)
                doneClass     =  opts . doneClass  ,    // Class for loaded images
                images        =  "img."  +  opts . lazyClass  , // Selector for all lazy images
                imageSelector  ;                        // Selector for images to be processed

            // Determine if hidden images should be loaded based on options
            self . imageSelector   =   (  opts . loadHidden  )   ?   images   :   images  +  ":visible"  ;

            // Assign the determined selector
            imageSelector   =   self . imageSelector  ;

            // Attach event handlers for 'update' and 'loadNow' to all matched images
            $ ( elem  )
                . on (  "update."  +  widgetName  ,  images  ,  function   (  event  ,  force  )   {
                    var   $this   =   $ ( this  )  ;

                    // Default `force` parameter to false if not provided
                    force   =   (  force   ===   undefined  )   ?   false   :   force  ;

                    // If the image is already marked as done, just ensure its source is set
                    if   (   $this . hasClass (  doneClass  )   )   {
                        self . setSrc (  $this  ,  self . getSrc (  $this  )  ,  force  )  ;
                    }   else   {
                        // Otherwise, check if it's in the viewport
                        self . checkLocation (  this  ,  force  )  ;
                    }
                }  )
                . on (  "loadNow."  +  widgetName  ,  images  ,  function   (  )   {
                    // Handle explicit 'loadNow' requests
                    self . loadNow (  this  )  ;
                }  )  ;

            // Attach scroll, resize, and orientationchange events to the window
            // and any secondary scroll elements, debouncing them with a timeout.
            $window . add (  opts . secondaryScroll  )
                . on (  [  "scroll"  ,  "resize"  ,  "orientationchange"  ] . join (  "."  +  widgetName  +  " "  )  ,  function   (  )   {

                    clearTimeout (  self . scrollTimer  )  ; // Clear any existing timer

                    self . scrollTimer   =   setTimeout (  function   (  )   {
                        var   $images   =   $ ( imageSelector  )  ;

                        // If `updateOnResize` is false, only re-check unloaded images
                        if   (  ! opts . updateOnResize  )   {
                            $images   =   $images . not (  "."  +  doneClass  )  ;
                        }

                        // Update viewport dimensions and scroll positions
                        self . viewportHeight   =   $window . height (  )  ;
                        self . viewportTopY     =   $window . scrollTop (  )  ;
                        self . viewportWidth    =   $window . width (  )  ;
                        self . viewportLeftX    =   $window . scrollLeft (  )  ;

                        // Trigger an update on all relevant images
                        $images . trigger (  "update."  +  widgetName  )  ;

                    }  ,  self . initialized   ?   opts . resizeDelay   :   0  )  ; // Use delay if already initialized
                }  )  ;

            self . initialized   =   true  ; // Mark the plugin as initialized
        }  ,

        // _init method: performs initial setup like processing noscript tags and initial image checks
        _init  :  function   (  )   {
            var   self        =  this  ,
                elem        =  self . element  ,
                opts        =  self . options  ,
                widgetName  =  self . widgetName  ,
                noscript    =  "noscript."  +  opts . lazyClass  ; // Selector for noscript tags

            // Get initial viewport dimensions and scroll positions
            self . viewportHeight   =   $window . height (  )  ;
            self . viewportTopY     =   $window . scrollTop (  )  ;
            self . viewportWidth    =   $window . width (  )  ;
            self . viewportLeftX    =   $window . scrollLeft (  )  ;

            // Iterate over noscript elements to replace them with actual image tags
            $ ( noscript  ,  elem  ) . each (  function   (  )   {
                var   $cur   =   $ ( this  )  ,    // Current noscript element
                    $img   =   $ ( "<img>"  )  , // New image element to create
                    h      =   $img . attr (  "height"  )   ||   opts . minHeight   ||   ""  ; // Get height, or use minHeight

                // Apply attributes from the `attList` array to the new image
                opts . attList . forEach (  function   (  attr  )   {
                    $img . attr (  attr  ,  $cur . data (  attr  )   ||   ""  )  ;
                }  )  ;

                // Transfer all data attributes from the noscript to the new image
                $img . data (  $cur . data (  )  )  ;

                // Add the lazyClass and set the placeholder src
                $img . addClass (  opts . lazyClass  )
                    . attr (  "src"  ,  opts . placeholder  )  ;

                // If height wasn't explicitly set, apply minHeight from options
                $img . height (  h  )  ;

                // Replace the noscript tag with the new image
                $cur . replaceWith (  $img  )  ;
                $img . css (  "opacity"  ,  "0.01"  )  ; // Initially hide for fade-in effect
            }  )  ;

            // Trigger an update for all lazy images that are not yet loaded
            $ ( self . imageSelector  ,  elem  ) . not (  "."  +  self . options . doneClass  ) . each (  function   (  )   {
                var   $this   =   $ ( this  )  ,
                    newSrc  =  self . getSrc (  $this  )  ,

                    // Check if the image source is already in session storage (meaning it was loaded before)
                    // This allows for immediate loading from cache without visual delay.
                    isForce   =   (  function   (  )   {
                        try   {
                            return   !! sessionStorage . getItem (  newSrc  )  ;
                        }   catch   (  e  )   {
                            return   false  ; // sessionStorage might be unavailable in some private browsing modes
                        }
                    }  )  (  )  ;

                $this . trigger (  "update."  +  widgetName  ,  isForce  )  ; // Trigger update with force flag
            }  )  ;

            // Trigger a resize event to ensure initial images in view are loaded
            $window . trigger (  "resize."  +  widgetName  )  ;
        }  ,

        // checkLocation: Determines if an image should be loaded based on its position
        checkLocation  :  function   (  elem  ,  force  )   {
            var   opts        =  this . options  ,
                self        =  this  ,
                newSrc  ,
                // Extra buffer for iOS devices due to address bar behavior
                extra       =  (  /iphone|ipod/i . test (  navigator . userAgent . toLowerCase (  )  )  )   ?   60   :   0  ,
                $theTarget  =  $ ( elem  )  , // jQuery object for the target image
                // Determine if loading should be prevented without explicit force
                dontForce   =  ! opts . mustForce   &&   ! $theTarget . data (  "mustforce"  )  ,

                // Helper function to check if the target element is within the viewport bounds
                isInBounds  =  function   (  )   {
                    var   isInBoundsY   =   (  $theTarget . offset (  ) . top   <   (  self . viewportTopY   +   self . viewportHeight  )   +   opts . threshold   +   extra  )  ,
                        isInBoundsX   =   (  $theTarget . offset (  ) . left   <   (  self . viewportLeftX   +   self . viewportWidth  )   +   opts . threshold   +   extra  )  ;

                    return   isInBoundsY   &&   isInBoundsX  ; // Both X and Y must be in bounds
                }  ;

            // Check conditions for loading the image, optimized for short-circuiting logic:
            if   (
                // Condition 1: Is loading explicitly forced?
                force
                ||
                (
                    // Condition 2: Has there been a resize OR the target isn't already loaded?
                    (  opts . updateOnResize   ||   ! $theTarget . hasClass (  opts . doneClass  )  )
                    &&
                    // Condition 3: Are hidden images allowed to load OR is the target visible?
                    (  opts . loadHidden   ||   $theTarget . is (  ":visible"  )  )
                    &&
                    // Condition 4: Is the target element currently within the calculated bounds?
                    isInBounds (  )
                    &&
                    // Condition 5: Is loading *not* being suppressed by `mustForce` option or data attribute?
                    dontForce
                )
            )   {
                // If all conditions met, get the appropriate source for the image
                newSrc   =   self . getSrc (  $theTarget  )  ;

                // Set the image's source attribute
                self . setSrc (  $theTarget  ,  newSrc  ,  force  )  ;

                // If minHeight was used and no height was originally set, remove the height attribute
                if   (  opts . minHeight   &&   ! $theTarget . data (  "height"  )  )   {
                    $theTarget . removeAttr (  "height"  )  ;
                }

                // Mark the image as done to prevent re-processing
                $theTarget . addClass (  opts . doneClass  )  ;
            }
        }  ,

        // getSrc: Determines the best source URL for an image based on defined tests
        getSrc  :  function   (  elem  )   {
            var   opts        =  this . options  ,
                newSrc  ,
                testResult  ;

            // Iterate through the `srcs` array using `some` (stops on first true)
            opts . srcs . some (  function   (  src  )   {

                var   elSrc   =   elem . data (  src  )  ; // Get the data attribute value

                // Execute the test function (if it exists) or use the boolean value directly
                testResult   =   typeof   opts . tests [ src ]   ===   "function"   ?
                    !! opts . tests [ src ] . call (  elem  )   :
                    !! opts . tests [ src ]  ;

                // If the test passes and a source is found, assign it
                if   (  testResult   &&   elSrc  )   {
                    newSrc   =   elSrc  ;
                }

                // Return true to stop `some` iteration if a source was found
                return   !! newSrc  ;
            }  )  ;

            // Return the found source or fall back to the default
            return   newSrc   ||   elem . data (  opts . srcFallback  )  ;
        }  ,

        // setSrc: Actually updates the image's src attribute and handles fade-in
        setSrc  :  function   (  $elem  ,  newSrc  )   {
            var   opts   =  this . options  ;

            // Only proceed if a new source is provided and it's different from the current src
            if   (  newSrc   &&   newSrc   !==   $elem . attr (  "src"  )  )   {

                // Attach a one-time load event to fade in the image once it's loaded
                $elem . on (  "load"  ,  function   (  )   {
                    $elem . stop (  true  ) . fadeTo (  opts . fadeSpeed  ,  1  )  ;
                }  )  ;

                // Fade out the image slightly, then set the new source to trigger loading
                $elem . fadeTo (  opts . fadeSpeed  ,  0.01  ) . attr (  "src"  ,  newSrc  )  ;

                // Handle IE8's behavior of setting 1px height/width if not provided
                if   (  ! $elem . data (  "width"  )  )   {
                    $elem . removeAttr (  "width"  )  ;
                }
                if   (  ! $elem . data (  "height"  )  )   {
                    $elem . removeAttr (  "height"  )  ;
                }

                // Attempt to store the loaded image's source in session storage
                // This helps avoid re-loading the same image in the same session
                try   {
                    sessionStorage . setItem (  newSrc  ,  "loaded"  )  ;
                }   catch   (  e  )   {
                    /* sessionStorage might be disabled or unavailable; gracefully ignore */
                }

                // Re-bind the load event to trigger the optional onload callback
                $elem . off (  "load."  +  pluginName  ) . on (  "load."  +  pluginName  ,  function   (  )   {
                    // Execute user-defined onload callback if it's a function
                    if (  $ . isFunction (  opts . onload  )  )  {
                        opts . onload . call (  $elem  ,  false  )  ;
                    }
                }  )  ;
            }
        }  ,

        // Public method to force an image to load immediately
        loadNow  :  function   (  elem  )   {
            // Call checkLocation with `force` set to true
            this . checkLocation (  elem  ,  true  )  ;
        }
    }  )  ;

    /*
     * A lightweight wrapper around the constructor to prevent multiple instantiations
     * and allow for jQuery chaining.
     */
    $ . fn [ pluginName ]   =   function   (  options  )   {
        this . each (  function   (  )   {
            // Only instantiate if the plugin has not already been initialized on this element
            if   (  ! $ . data (  this  ,  "plugin_"  +  pluginName  )  )   {
                $ . data (  this  ,  "plugin_"  +  pluginName  ,  new   Plugin (  this  ,  options  )  )  ;
            }
        }  )  ;

        // Return `this` for jQuery method chaining
        return   this  ;
    }  ;

    // Expose the plugin version number via jQuery.fn
    $ . fn [ pluginName ] . version   =   "2.0.0"  ;

}  )  (  jQuery  ,  window  ,  document  )  ;