/*
 * This JavaScript library, 'ttlib', is designed to provide dynamic tooltip functionality
 * across a web application. It handles the creation, display, positioning,
 * and asynchronous loading of tooltip content, including integration with external
 * services like Wowhead for game-related data.
 *
 * This file represents a Type I clone, meaning its functionality and identifiers
 * are identical to the original, but its formatting (whitespace, indentation,
 * and comments) has been extensively altered for visual distinction.
 */

var ttlib =
{
        /**
         * Initializes the tooltip library. This method should be called once the DOM is ready.
         * It creates the main tooltip element and sets up initial state.
         */
        init: function   (   )
        {
            // First, check if the client device supports touch interactions.
            // If Modernizr (a feature detection library) indicates a touch device,
            // we disable the tooltip functionality by immediately returning.
            if  (   Modernizr.touch   )
            {
                return ; // Exit the initialization process for touch devices.
            }

            // Create a new div element to serve as the tooltip container.
            var tooltip = document . createElement   ( "div" ) ;

            // Assign a specific CSS class to the tooltip for styling.
            tooltip.className    =  "ea-tooltip"  ;

            // Store a reference to this newly created DOM element within the ttlib object
            // for easy access throughout the library.
            ttlib.jstooltip  =  tooltip ;

            // Ensure the tooltip is hidden by default when it is first initialized.
            ttlib.hide ( ) ;


            // Initialize internal data structures required for tooltip management:
            // 1. 'queue': An array to hold URLs of tooltip content requests that are pending.
            ttlib.queue =   [ ] ;
            // 2. 'cache': An object to store previously fetched tooltip data,
            //    keyed by their URL, to prevent redundant requests.
            ttlib.cache =   { } ;
            // 3. 'currentRequest': A variable to track the URL of the tooltip
            //    currently being fetched, preventing simultaneous requests.
            ttlib.currentRequest    =   null ;

            // Define the maximum allowed width for the tooltip element.
            ttlib.jstooltip.maxWidth    =   370 ;


            // Append the created tooltip element to the document's body.
            // It's placed in the body to allow for absolute positioning relative to the viewport.
            document.getElementsByTagName("body")[0] . appendChild   (tooltip) ;
        } , // End of the 'init' method.


        // --- Functions for managing tooltip visibility and content display ---

        /**
         * Makes the tooltip visible and positions it relative to its owner element.
         * This function assumes 'ttlib.jstooltip.owner' and its position data are available.
         */
        show: function ( )
        {
            // If the tooltip element has not been initialized, there's nothing to show.
            if  (   ! ttlib.jstooltip   )
            {
                return ;
            }

            // Get the current offset position (top and left) of the element that 'owns' this tooltip.
            var pos     =   ttlib.jstooltip.owner.offset ( ) ;
            // Retrieve the client width of the document body, useful for boundary checks.
            var dwidth  =   document.body.clientWidth ;


            // Calculate the initial 'left' position: place it to the right of the owner element.
            var left    =   pos.left    +   ttlib.jstooltip.owner.width ( ) +   30 ;
            // Set the 'top' position to align with the owner element's top edge.
            var top     =   pos.top ;

            // Perform a boundary check: if the tooltip would extend too far off the right edge of the screen,
            // reposition it to appear on the left side of the owner element instead.
            if  (   dwidth  -   left    <   400   )
            {
                left    =   pos.left    -   ttlib.jstooltip.offsetWidth -   30 ;
            }

            // Apply the calculated 'left' and 'top' coordinates to the tooltip.
            // This also handles clamping the tooltip within the viewport.
            ttlib.mouseMove (   left,   top   ) ;

            // Reset the tooltip's width style. This allows the tooltip to resize naturally
            // based on its content before potential maxWidth clamping in mouseMove.
            ttlib.jstooltip.style.width =   null ;
            // Finally, make the tooltip element visible.
            ttlib.jstooltip.style.visibility    =   "visible" ;
        } ,

        /**
         * Populates the tooltip with a given plain text string and then displays it.
         * The text will be wrapped in a styled div.
         * @param {string} text - The plain text content to be displayed in the tooltip.
         */
        showText: function  (   text    )
        {
            // Pre-check: Ensure the tooltip object is available before attempting any operations.
            if  (   ! ttlib.jstooltip   ) { return ; }

            // Set the innerHTML of the tooltip element. The text is wrapped in a div
            // with specific classes for consistent styling (border and text).
            ttlib.jstooltip.innerHTML   =   "<div class='border text'>"    +   text    +   "</div>" ;
            // Call the generic 'show' method to position and make the tooltip visible.
            ttlib.show ( ) ;
        } ,

        /**
         * Displays content that has been previously retrieved and cached.
         * @param {object} data - An object containing the 'tooltip' HTML string.
         */
        showCachedData: function    (   data    )
        {
            // Safety check: ensure the tooltip element exists.
            if  (   ! ttlib.jstooltip   ) { return ; }

            // Directly set the innerHTML of the tooltip using the 'tooltip' property from the data object.
            ttlib.jstooltip.innerHTML   =   data.tooltip ;
            // Display the tooltip with its new content.
            ttlib.show ( ) ;
        } ,

        /**
         * Processes new tooltip data, caches it, and then displays it.
         * This function also handles the post-processing of the data (e.g., adding wrappers).
         * @param {object} data - An object containing the raw tooltip content.
         */
        showData: function  (   data    )
        {
            // Ensure the tooltip element is initialized before proceeding.
            if  (   ! ttlib.jstooltip   ) { return ; }

            // Wrap the raw tooltip content with a 'border' div for consistent styling.
            data.tooltip    =   "<div class='border'>"  +   data.tooltip    +   "</div>" ;
            // Cache the processed data using the current request URL as the key.
            ttlib.cache [   ttlib.currentRequest    ]   =   data ;

            // Check if the element currently being moused over is the same one
            // for which this data was requested.
            if  (   ttlib.currentMouseover  ==  ttlib.currentRequest    )
            {
                // If so, display the cached data immediately.
                ttlib.showCachedData (   data    ) ;
            }

            // Clear the 'currentRequest' flag, indicating that no request is currently active.
            ttlib.currentRequest    =   null ;
            // Attempt to process any other pending requests in the queue.
            ttlib.processQueue ( ) ;
        } ,

        /**
         * Displays a generic error message in the tooltip.
         * This is typically called when an AJAX request for tooltip data fails.
         */
        showError: function (   )
        {
            // Guard clause: do nothing if the tooltip element isn't ready.
            if  (   ! ttlib.jstooltip   ) { return ; }

            // Reset the current request state, as the request has failed.
            ttlib.currentRequest    =   null ;
            // Display a predefined error message using the 'showText' method.
            ttlib.showText  (   "Error loading tooltip."    ) ;
        } ,

        /**
         * Hides the tooltip from view.
         * This also clears the 'currentMouseover' state.
         */
        hide: function  (   )
        {
            // Only proceed if the tooltip object is initialized.
            if  (   ! ttlib.jstooltip   ) { return ; }

            // Set the CSS visibility property to 'hidden' to conceal the tooltip.
            ttlib.jstooltip.style.visibility    =   "hidden" ;
            // Clear the reference to the element that was last moused over.
            ttlib.currentMouseover  =   null ;
        } ,


        // --- Tooltip Positioning Logic ---

        /**
         * Positions the tooltip on the screen at the given (x, y) coordinates.
         * This function also includes logic for clamping the tooltip within the viewport
         * and adjusting its width if it exceeds a maximum.
         * @param {number} x - The desired horizontal (left) position.
         * @param {number} y - The desired vertical (top) position.
         */
        mouseMove: function (   x,   y   )
        {
            // Obtain references to the document's root element and body for scroll and client dimensions.
            var de = document.documentElement ;
            var body = document.body ;

            // First, to accurately determine the tooltip's true width,
            // temporarily move it to the top-left corner (0,0).
            // This allows the browser to render and calculate its natural width
            // before any positioning or max-width constraints are applied.
            ttlib.jstooltip.style.left  =   "0px" ;
            ttlib.jstooltip.style.top   =   "0px" ;

            // Check if the tooltip's current width (either explicitly set via style or its rendered offsetWidth)
            // exceeds the predefined maximum width.
            if  (
                    (   ttlib.jstooltip.style.width     &&  ttlib.jstooltip.style.width   >   ttlib.jstooltip.maxWidth    )
                    ||
                    (   ttlib.jstooltip.offsetWidth     &&  ttlib.jstooltip.offsetWidth   >   ttlib.jstooltip.maxWidth    )
                )
            {
                // If it does, enforce the maximum width by setting the style.
                ttlib.jstooltip.style.width =   ttlib.jstooltip.maxWidth    +   "px" ;
            }


            // --- Vertical Clamping Logic ---

            // Bottom clamp: If the tooltip extends beyond the bottom of the visible viewport,
            // adjust its 'y' position upwards to keep it fully on screen.
            // This calculation accounts for scrolling of both the document element and the body.
            if  (   y   +   ttlib.jstooltip.offsetHeight    >   de.clientHeight +   body.scrollTop  +   de.scrollTop    )
            {
                y   +=  (   de.clientHeight +   body.scrollTop  +   de.scrollTop    )   -   (   y   +   ttlib.jstooltip.offsetHeight    ) ;
            }

            // Top clamp: Ensure the tooltip does not go above the top edge of the viewport.
            // If 'y' is negative, set it to 0.
            if  (   y   <   0   )
            {
                y   =   0 ;
            }


            // --- Horizontal Clamping Logic (Currently commented out in the original source) ---
            /*
             * The following block is commented out in the original code.
             * It represents a potential 'right clamp' adjustment that is not active.
             *
             * if ( x + ttlib.jstooltip.offsetWidth > de.clientWidth - 30 ) {
             *     x -= ttlib.jstooltip.offsetWidth + 40;
             * }
             */


            // Apply the final, adjusted 'left' and 'top' positions to the tooltip element.
            ttlib.jstooltip.style.left  =   x   +   "px" ;
            ttlib.jstooltip.style.top   =   y   +   "px" ;
        } ,


        // --- Queue Management Functions for Asynchronous Tooltip Loading ---

        /**
         * Initiates a request for tooltip data based on various data attributes
         * from the element that triggered the mouseover event.
         * This function constructs the URL and either displays cached data or queues a new request.
         */
        requestTooltip: function    (   )
        {
            // If the tooltip element isn't ready, we cannot process a request.
            if  (   !   ttlib.jstooltip   )
            {
                return ;
            }

            // Get the jQuery object representing the element that triggered this event.
            var $this   =   $   (   this   ) ;

            // Extract various tooltip-related data attributes from the element.
            var id      =   $this.data  (   "tooltip-id"    ) ;
            var spellid =   $this.data  (   "tooltip-spellid"   ) ; // Specific for spell tooltips.
            var rand    =   $this.data  (   "tooltip-rand"  ) ;     // Random enchantment ID.
            var upgd    =   $this.data  (   "tooltip-upgd"  ) ;     // Upgrade level.
            var bonus   =   $this.data  (   "tooltip-bonus" ) ;     // Bonus IDs for items.

            // If no primary 'tooltip-id' is found, there's no data to request.
            if  (   !   id   )
            {
                return ;
            }

            // Determine the type of tooltip (e.g., 'item', 'spell'). Defaults to 'item'.
            var t   =   $this.data  (   "tooltip-type"  )   ||  "item" ;

            // Construct the base URL for the Wowhead API request.
            var url =   "http://www.wowhead.com/"   +   t   +   "=" +   id  +   "&power" ;

            // Append optional parameters to the URL if they are provided and valid.
            if  (   rand    &&  rand    !=  "0"   )
            {
                url +=  "&rand="    +   rand ;
            }
            if  (   upgd    &&  upgd    !=  "0"   )
            {
                url +=  "&upgd="    +   upgd ;
            }
            if  (   bonus   )
            {
                url +=  "&bonus="   +   bonus ;
            }

            // Add a fixed level parameter to the URL (e.g., for item scaling).
            url +=  "&lvl=100" ;

            // Store the constructed URL as the 'currentMouseover' target.
            ttlib.currentMouseover  =   url ;

            // Reset the tooltip's width style to allow it to resize based on new content.
            ttlib.jstooltip.style.width =   null ;
            // Store a reference to the triggering element for positioning calculations later.
            ttlib.jstooltip.owner   =   $this ;

            // Check if the data for this URL is already present in the cache.
            if  (   ttlib.cache [   url   ]   )
            {
                // If cached, immediately display the data.
                ttlib.showCachedData (   ttlib.cache [   url   ]   ) ;
            }
            else
            {
                // If not cached, add the request URL to the processing queue.
                ttlib.queueRequest (   url   ) ;
                // Display a "Loading..." message to the user while the data is being fetched.
                ttlib.showText (   "Loading tooltip..."    ) ;
            }
        } ,

        /**
         * Adds a given URL to the request queue, ensuring no duplicate requests
         * are queued if one is already active for the same URL.
         * @param {string} url - The URL to be requested for tooltip data.
         */
        queueRequest: function  (   url   )
        {
            // Only add the URL to the queue if it's not already the current active request.
            if  (   ttlib.currentRequest    !=  url   )
            {
                // Push the URL onto the end of the queue array.
                ttlib.queue.push (   url   ) ;
                // Attempt to process the queue immediately.
                ttlib.processQueue ( ) ;
            }
        } ,

        /**
         * Processes the next pending request in the queue.
         * This function fetches the data and updates the tooltip.
         */
        processQueue: function  (   )
        {
            // If the queue is empty or if a request is already in progress,
            // there's nothing to process, so return early.
            if  (   ttlib.queue.length  === 0   ||  ttlib.currentRequest    )
            {
                return ;
            }

            // Pop the last URL from the queue (LIFO, or last-in, first-out)
            // and set it as the currently active request.
            ttlib.currentRequest    =   ttlib.queue.pop ( ) ;

            // Initiate an AJAX request using jQuery.
            $ . ajax ( {
                // The URL to fetch the tooltip data from.
                url:        ttlib.currentRequest ,
                // Expect the response to be a JavaScript script, which Wowhead provides.
                dataType:   "script" ,
                // Specify a callback function to handle any errors during the AJAX request.
                error:      ttlib.showError
            } ) ;
        } ,


        // --- Wowhead API Integration ---

        /**
         * A callback function designed to be used with Wowhead's external tooltip scripts.
         * It receives data from Wowhead and formats it for display.
         * @param {number} id - The ID of the item/spell/etc. (not directly used in this function).
         * @param {boolean} showIcon - Whether to show an icon (not directly used).
         * @param {object} data - The object containing tooltip data from Wowhead.
         */
        wowheadTooltip: function    (   id,   showIcon,   data    )
        {
            // Prioritize the English (US) tooltip content. If it's not available,
            // fall back to the beta tooltip content.
            data.tooltip    =   data.tooltip_enus   ||  data.tooltip_beta ;
            // Pass the processed data to the library's generic 'showData' method for display and caching.
            ttlib.showData (   data    ) ;
        }
} ; // Closing brace for the main 'ttlib' object.


// --- Wowhead Compatibility Object ---
// This global object, '$WowheadPower', is exposed to integrate with Wowhead's external
// JavaScript scripts. Wowhead expects to call methods on this object to register
// different types of tooltips (items, spells, etc.).
var $WowheadPower   =
{
    // Map all Wowhead registration methods to our single 'ttlib.wowheadTooltip' handler.
    registerItem:           ttlib.wowheadTooltip ,
    registerSpell:          ttlib.wowheadTooltip ,
    registerAchievement:    ttlib.wowheadTooltip ,
    registerStatistic:      ttlib.wowheadTooltip ,
    registerNpc:            ttlib.wowheadTooltip ,
    registerObject:         ttlib.wowheadTooltip ,
    registerQuest:          ttlib.wowheadTooltip
} ;


// --- Document Ready Handler ---
// Use jQuery's 'ready' method to ensure that the 'ttlib.init' function
// is called only after the entire DOM has been loaded and parsed.
$   (   document   ) . ready (   ttlib.init   ) ;