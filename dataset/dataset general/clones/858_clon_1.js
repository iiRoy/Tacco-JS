/*
 *  This is a Type I clone of the original jQuery OwlCarousel v1.3.3.
 *  The core functionality and structure are preserved.
 *
 *  Original Author: Bartosz Wojciechowski
 *  Project URL: http://www.owlgraphic.com/owlcarousel/
 *
 *  License Information:
 *  This software is licensed under the MIT License.
 *  (Please refer to the original source for full license text.)
 *
 *  Changes made: Extensive modifications to whitespace and comments only.
 *
 */


/* JSLint Global Declarations and Options Configuration: */
/*global
    dragMove: false,    // External function (e.g., from a drag-and-drop library)
    dragEnd: false,     // External function for drag completion
    $: true,            // jQuery library reference
    jQuery: true,       // jQuery library reference
    alert: false,       // Browser alert function (not used for logic, potentially for debugging)
    window: false,      // Global window object
    document: false     // Global document object
*/
/*jslint
    nomen: true,        // Allow dangling underscores in identifiers
    continue: true      // Allow 'continue' statement in loops
*/


// Polyfill for Object.create method, if it's not natively supported
// This ensures compatibility across various JavaScript environments.
if  ( typeof  Object.create  !==  "function"  )
{
    Object.create  =  function  (  obj  )
    {
        // Define a temporary constructor function
        function  F  ()  {  }
        // Set the prototype of the constructor to the provided object
        F.prototype  =  obj;
        // Return a new instance of F, effectively creating an object
        // with 'obj' as its prototype.
        return  new  F  ();
    };
}


// Immediately Invoked Function Expression (IIFE) to encapsulate the plugin logic.
// This creates a private scope for the plugin, preventing global variable pollution.
(  function  (  $,  window,  document  )
{

    // Define the main Carousel object and its methods.
    var  Carousel  =
    {
        // The initialization method for the carousel plugin.
        // It sets up the basic properties and starts the content loading process.
        init  :  function  (  options,  el  )
        {
            var  base  =  this; // Store a reference to the current instance (this)

            base.$elem  =  $(  el  ); // Store the jQuery-wrapped element
            // Extend default options with user-provided options and data attributes.
            base.options  =  $.extend  (  {},  $.fn.owlCarousel.options,  base.$elem.data  (),  options  );

            base.userOptions  =  options; // Keep a reference to the original user options
            base.loadContent  (); // Initiate the content loading sequence
        },

        // Method responsible for loading carousel content, either via JSON or directly.
        loadContent  :  function  ()
        {
            var  base  =  this,  // Reference to the current instance
                 url;          // Variable to hold the JSON URL

            // Nested helper function to process retrieved JSON data.
            function  getData  (  data  )
            {
                var  i,       // Loop counter
                     content  =  ""; // Accumulator for HTML content

                // Check if a custom JSON success callback is provided.
                if  (  typeof  base.options.jsonSuccess  ===  "function"  )
                {
                    // Execute the custom callback with the data.
                    base.options.jsonSuccess.apply  (  this,  [  data  ]  );
                }
                else
                {
                    // Iterate through the 'owl' property of the data object.
                    for  (  i  in  data.owl  )
                    {
                        // Ensure the property belongs to data.owl and not its prototype chain.
                        if  (  data.owl.hasOwnProperty  (  i  )  )
                        {
                            // Append the 'item' content to the main content string.
                            content  +=  data.owl[i].item;
                        }
                    }
                    // Insert the generated HTML content into the carousel element.
                    base.$elem.html  (  content  );
                }
                // Proceed to the next setup step, regardless of content loading method.
                base.logIn  ();
            }

            // Trigger the 'beforeInit' callback if it's defined.
            if  (  typeof  base.options.beforeInit  ===  "function"  )
            {
                base.options.beforeInit.apply  (  this,  [  base.$elem  ]  );
            }

            // Check if a JSON path is provided for dynamic content loading.
            if  (  typeof  base.options.jsonPath  ===  "string"  )
            {
                url  =  base.options.jsonPath; // Assign the JSON path
                $.getJSON  (  url,  getData  ); // Fetch JSON data and process it with getData
            }
            else
            {
                // If no JSON path, proceed directly to login (initial setup).
                base.logIn  ();
            }
        },

        // This method prepares the carousel for operation after content is loaded.
        logIn  :  function  ()
        {
            var  base  =  this; // Cache 'this' for consistent access

            // Store original inline styles and classes to restore them later if needed.
            base.$elem.data  (  "owl-originalStyles",  base.$elem.attr  (  "style"  )  );
            base.$elem.data  (  "owl-originalClasses",  base.$elem.attr  (  "class"  )  );

            // Temporarily hide the element to prevent flickering during setup.
            base.$elem.css  (  {  opacity:  0  }  );
            // Store the initial number of items as configured.
            base.orignalItems  =  base.options.items;
            // Perform browser-specific checks (e.g., touch support).
            base.checkBrowser  ();
            // Initialize wrapper width, will be calculated later.
            base.wrapperWidth  =  0;
            // Initialize visibility checker.
            base.checkVisible  =  null;
            // Proceed to set up all necessary variables and elements.
            base.setVars  ();
        },

        // Sets up various internal variables and prepares the DOM structure.
        setVars  :  function  ()
        {
            var  base  =  this; // Current instance reference

            // If there are no children elements, there's nothing to carousel.
            if  (  base.$elem.children  ().length  ===  0  )
            {
                return  false; // Exit early if no items are found.
            }

            // Apply base CSS classes to the main element.
            base.baseClass  ();
            // Determine and set up event types (e.g., touch vs. mouse).
            base.eventTypes  ();

            // Store references to user-provided items and their count.
            base.$userItems  =  base.$elem.children  ();
            base.itemsAmount  =  base.$userItems.length;

            // Wrap the items with carousel-specific markup.
            base.wrapItems  ();

            // After wrapping, find the newly created owl-items and owl-wrapper elements.
            base.$owlItems  =  base.$elem.find  (  ".owl-item"  );
            base.$owlWrapper  =  base.$elem.find  (  ".owl-wrapper"  );

            // Initialize carousel state variables.
            base.playDirection  =  "next"; // Default play direction
            base.prevItem  =  0;         // Previous item index
            base.prevArr  =  [0];        // Array to store previous states (for navigation)
            base.currentItem  =  0;      // Current item index

            // Set up custom event handlers.
            base.customEvents  ();
            // Proceed to the startup routine.
            base.onStartup  ();
        },

        // The main startup routine, executed after initial setup.
        onStartup  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Update item configuration based on responsive settings.
            base.updateItems  ();
            // Calculate all necessary dimensions and positions.
            base.calculateAll  ();
            // Build navigation and pagination controls.
            base.buildControls  ();
            // Update the state of controls (e.g., active pagination dot).
            base.updateControls  ();
            // Set up responsive behavior.
            base.response  ();
            // Attach event handlers for moving the carousel.
            base.moveEvents  ();
            // Implement 'stop on hover' functionality if enabled.
            base.stopOnHover  ();
            // Update the data attributes for current item status.
            base.owlStatus  ();

            // If a custom transition style is specified, apply it.
            if  (  base.options.transitionStyle  !==  false  )
            {
                base.transitionTypes  (  base.options.transitionStyle  );
            }
            // Normalize autoPlay option: if true, set default interval to 5000ms.
            if  (  base.options.autoPlay  ===  true  )
            {
                base.options.autoPlay  =  5000;
            }
            // Start the auto-play functionality.
            base.play  ();

            // Ensure the owl-wrapper is visible after initial setup.
            base.$elem.find  (  ".owl-wrapper"  ).css  (  "display",  "block"  );

            // If the element is not visible initially, monitor its visibility.
            if  (  !base.$elem.is  (  ":visible"  )  )
            {
                base.watchVisibility  ();
            }
            else
            {
                // Otherwise, make it fully opaque.
                base.$elem.css  (  "opacity",  1  );
            }
            // Mark startup as complete.
            base.onstartup  =  false;
            // Perform updates required after each move (and initially).
            base.eachMoveUpdate  ();
            // Trigger the 'afterInit' callback if it's defined.
            if  (  typeof  base.options.afterInit  ===  "function"  )
            {
                base.options.afterInit.apply  (  this,  [  base.$elem  ]  );
            }
        },

        // This method is called after every carousel movement and at startup.
        // It handles features like lazy loading, auto height, and visibility checks.
        eachMoveUpdate  :  function  ()
        {
            var  base  =  this; // Current instance reference

            // If lazy loading is enabled, process images for the current view.
            if  (  base.options.lazyLoad  ===  true  )
            {
                base.lazyLoad  ();
            }
            // If auto height is enabled, adjust the wrapper height to the tallest visible item.
            if  (  base.options.autoHeight  ===  true  )
            {
                base.autoHeight  ();
            }
            // Trigger events or callbacks related to currently visible items.
            base.onVisibleItems  ();

            // Execute the 'afterAction' callback if it's provided in options.
            if  (  typeof  base.options.afterAction  ===  "function"  )
            {
                base.options.afterAction.apply  (  this,  [  base.$elem  ]  );
            }
        },

        // Updates all internal variables and re-calculates carousel state.
        // Typically called on window resize or when options change.
        updateVars  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Trigger the 'beforeUpdate' callback if it's defined.
            if  (  typeof  base.options.beforeUpdate  ===  "function"  )
            {
                base.options.beforeUpdate.apply  (  this,  [  base.$elem  ]  );
            }
            // Re-check and potentially re-enable visibility monitoring.
            base.watchVisibility  ();
            // Re-evaluate the number of visible items based on responsive settings.
            base.updateItems  ();
            // Recalculate widths, positions, and loops.
            base.calculateAll  ();
            // Adjust the carousel position to the current item.
            base.updatePosition  ();
            // Refresh the state of navigation and pagination controls.
            base.updateControls  ();
            // Perform post-move updates (lazy load, auto height, visible items).
            base.eachMoveUpdate  ();
            // Trigger the 'afterUpdate' callback if it's defined.
            if  (  typeof  base.options.afterUpdate  ===  "function"  )
            {
                base.options.afterUpdate.apply  (  this,  [  base.$elem  ]  );
            }
        },

        // Reloads the carousel by forcing an update of all variables.
        // Uses a setTimeout with 0 delay to defer the update, allowing the browser
        // to finish current tasks before recalculating.
        reload  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            window.setTimeout  (  function  ()
            {
                base.updateVars  (); // Call the update method after a short delay.
            },  0  );
        },

        // Monitors the visibility of the carousel element.
        // If it becomes hidden, auto-play and visibility checks are paused.
        // If it becomes visible again, the carousel reloads and becomes active.
        watchVisibility  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Check if the carousel element is currently not visible.
            if  (  base.$elem.is  (  ":visible"  )  ===  false  )
            {
                base.$elem.css  (  {  opacity:  0  }  ); // Hide it completely.
                // Clear any active auto-play interval.
                window.clearInterval  (  base.autoPlayInterval  );
                // Clear any existing visibility check interval.
                window.clearInterval  (  base.checkVisible  );
            }
            else
            {
                // If it's already visible, there's no need to watch.
                return  false;
            }

            // Set up an interval to periodically check for visibility changes.
            base.checkVisible  =  window.setInterval  (  function  ()
            {
                // If the element becomes visible again:
                if  (  base.$elem.is  (  ":visible"  )  )
                {
                    base.reload  (); // Reload the carousel to re-calculate dimensions etc.
                    // Fade in the carousel element.
                    base.$elem.animate  (  {  opacity:  1  },  200  );
                    // Stop checking visibility once it's visible.
                    window.clearInterval  (  base.checkVisible  );
                }
            },  500  ); // Check every 500 milliseconds.
        },

        // Wraps the user-provided items with the necessary Owl Carousel markup
        // to create the slider structure.
        wrapItems  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Wrap all user items in an 'owl-wrapper' div,
            // then wrap each individual item in an 'owl-item' div.
            base.$userItems
                .wrapAll  (  "<div class=\"owl-wrapper\">"  )
                .wrap  (  "<div class=\"owl-item\"></div>"  );

            // Wrap the 'owl-wrapper' with an 'owl-wrapper-outer' div.
            base.$elem.find  (  ".owl-wrapper"  )
                .wrap  (  "<div class=\"owl-wrapper-outer\">"  );

            // Store a reference to the newly created outer wrapper.
            base.wrapperOuter  =  base.$elem.find  (  ".owl-wrapper-outer"  );
            // Ensure the main carousel element is displayed as a block.
            base.$elem.css  (  "display",  "block"  );
        },

        // Applies the base CSS classes to the main carousel element.
        // This includes the primary plugin class and the theme class.
        baseClass  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 hasBaseClass  =  base.$elem.hasClass  (  base.options.baseClass  ), // Check for base class presence
                 hasThemeClass  =  base.$elem.hasClass  (  base.options.theme  );   // Check for theme class presence

            // If the base class is not already present, add it.
            if  (  !hasBaseClass  )
            {
                base.$elem.addClass  (  base.options.baseClass  );
            }

            // If the theme class is not already present, add it.
            if  (  !hasThemeClass  )
            {
                base.$elem.addClass  (  base.options.theme  );
            }
        },

        // Determines the number of items to display based on responsiveness settings
        // and current viewport width.
        updateItems  :  function  ()
        {
            var  base  =  this,  // Reference to the current instance
                 width,          // Current width of the responsive base element
                 i;              // Loop counter

            // If responsive mode is explicitly disabled, do nothing.
            if  (  base.options.responsive  ===  false  )
            {
                return  false;
            }

            // If 'singleItem' mode is enabled, override all other item settings.
            if  (  base.options.singleItem  ===  true  )
            {
                base.options.items  =  base.orignalItems  =  1; // Force one item.
                // Disable all responsive item configurations.
                base.options.itemsCustom  =  false;
                base.options.itemsDesktop  =  false;
                base.options.itemsDesktopSmall  =  false;
                base.options.itemsTablet  =  false;
                base.options.itemsTabletSmall  =  false;
                base.options.itemsMobile  =  false;
                return  false;
            }

            // Get the width of the element specified as the responsive base.
            width  =  $(  base.options.responsiveBaseWidth  ).width  ();

            // If the width is greater than the desktop item breakpoint (or original items),
            // revert to the original number of items.
            if  (  width  >  (  base.options.itemsDesktop[0]  ||  base.orignalItems  )  )
            {
                base.options.items  =  base.orignalItems;
            }

            // Handle custom item breakpoints if specified.
            if  (  base.options.itemsCustom  !==  false  )
            {
                // Reorder the custom breakpoints array by screen size for correct evaluation.
                base.options.itemsCustom.sort  (  function  (  a,  b  )  {  return  a[0]  -  b[0];  }  );

                // Iterate through custom breakpoints and apply the matching item count.
                for  (  i  =  0;  i  <  base.options.itemsCustom.length;  i  +=  1  )
                {
                    if  (  base.options.itemsCustom[i][0]  <=  width  )
                    {
                        base.options.items  =  base.options.itemsCustom[i][1];
                    }
                }

            }
            else
            {
                // Fallback to predefined responsive breakpoints if no custom ones are used.

                // Desktop breakpoint check.
                if  (  width  <=  base.options.itemsDesktop[0]  &&  base.options.itemsDesktop  !==  false  )
                {
                    base.options.items  =  base.options.itemsDesktop[1];
                }

                // Small desktop breakpoint check.
                if  (  width  <=  base.options.itemsDesktopSmall[0]  &&  base.options.itemsDesktopSmall  !==  false  )
                {
                    base.options.items  =  base.options.itemsDesktopSmall[1];
                }

                // Tablet breakpoint check.
                if  (  width  <=  base.options.itemsTablet[0]  &&  base.options.itemsTablet  !==  false  )
                {
                    base.options.items  =  base.options.itemsTablet[1];
                }

                // Small tablet breakpoint check.
                if  (  width  <=  base.options.itemsTabletSmall[0]  &&  base.options.itemsTabletSmall  !==  false  )
                {
                    base.options.items  =  base.options.itemsTabletSmall[1];
                }

                // Mobile breakpoint check.
                if  (  width  <=  base.options.itemsMobile[0]  &&  base.options.itemsMobile  !==  false  )
                {
                    base.options.items  =  base.options.itemsMobile[1];
                }
            }

            // Adjust the number of items if it exceeds the total available items,
            // and 'itemsScaleUp' is enabled.
            if  (  base.options.items  >  base.itemsAmount  &&  base.options.itemsScaleUp  ===  true  )
            {
                base.options.items  =  base.itemsAmount;
            }
        },

        // Handles responsive adjustments by listening to window resize events.
        // It debounces the resize event to prevent excessive recalculations.
        response  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 smallDelay,     // Timer for debouncing resize events
                 lastWindowWidth; // Stores the window width from the last check

            // If responsive mode is not explicitly enabled, exit.
            if  (  base.options.responsive  !==  true  )
            {
                return  false;
            }

            // Capture the initial window width.
            lastWindowWidth  =  $(  window  ).width  ();

            // Define the resizer function that will be attached to the window resize event.
            base.resizer  =  function  ()
            {
                // Only act if the window width has actually changed.
                if  (  $(  window  ).width  ()  !==  lastWindowWidth  )
                {
                    // If auto-play is active, pause it during resize.
                    if  (  base.options.autoPlay  !==  false  )
                    {
                        window.clearInterval  (  base.autoPlayInterval  );
                    }
                    // Clear any pending resize timeout to debounce the event.
                    window.clearTimeout  (  smallDelay  );
                    // Set a new timeout to trigger updates after a delay.
                    smallDelay  =  window.setTimeout  (  function  ()
                    {
                        lastWindowWidth  =  $(  window  ).width  (); // Update last width.
                        base.updateVars  (); // Recalculate all carousel variables.
                    },  base.options.responsiveRefreshRate  ); // Use the configured refresh rate.
                }
            };
            // Attach the debounced resizer function to the window's resize event.
            $(  window  ).resize  (  base.resizer  );
        },

        // Updates the physical position of the carousel to display the current item.
        updatePosition  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Move the carousel to the position of the current item.
            base.jumpTo  (  base.currentItem  );
            // If auto-play is enabled, check and restart its interval.
            if  (  base.options.autoPlay  !==  false  )
            {
                base.checkAp  ();
            }
        },

        // Calculates and applies width to each individual carousel item
        // and assigns data attributes for pagination.
        appendItemsSizes  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 roundPages  =  0, // Counter for pagination rounds/pages
                 lastItem  =  base.itemsAmount  -  base.options.items; // Index of the last item in the last visible group

            // Iterate over each owl-item element.
            base.$owlItems.each  (  function  (  index  )
            {
                var  $this  =  $(  this  ); // jQuery wrapper for the current item

                // Apply the calculated item width and store its index.
                $this
                    .css  (  {  "width":  base.itemWidth  }  )
                    .data  (  "owl-item",  Number  (  index  )  );

                // Determine pagination 'roundPages' for the current item.
                // A new round/page starts every 'base.options.items' or at the very last item.
                if  (  index  %  base.options.items  ===  0  ||  index  ===  lastItem  )
                {
                    // Ensure we don't increment for items beyond the actual last item.
                    if  (  !(  index  >  lastItem  )  )
                    {
                        roundPages  +=  1;
                    }
                }
                // Store the calculated round/page number on the item.
                $this.data  (  "owl-roundPages",  roundPages  );
            }  );
        },

        // Sets the width of the main carousel wrapper element.
        appendWrapperSizes  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 // Calculate the total width needed for all items.
                 // Multiplied by 2 to allow for infinite looping illusion.
                 width  =  base.$owlItems.length  *  base.itemWidth;

            // Apply the calculated width and reset the left position.
            base.$owlWrapper.css  (  {
                "width":  width  *  2, // Double width for seamless looping
                "left":  0             // Start at the beginning
            }  );
            // After setting wrapper size, ensure individual item sizes are also correct.
            base.appendItemsSizes  ();
        },

        // Orchestrates the calculation of all dimensions and positions
        // necessary for the carousel's layout.
        calculateAll  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            base.calculateWidth  ();    // Determine individual item width.
            base.appendWrapperSizes  (); // Set wrapper width and item sizes.
            base.loops  ();             // Calculate loop positions for smooth transitions.
            base.max  ();               // Determine the maximum scrollable position.
        },

        // Calculates the width of a single carousel item.
        calculateWidth  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Divide the main carousel element's width by the number of items to show.
            // Round to the nearest whole number to avoid fractional pixel issues.
            base.itemWidth  =  Math.round  (  base.$elem.width  ()  /  base.options.items  );
        },

        // Calculates the maximum scrollable pixel position for the carousel.
        max  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 // Calculate the maximum negative pixel offset.
                 // This represents the point where the last item is fully visible.
                 maximum  =  (  (  base.itemsAmount  *  base.itemWidth  )  -  base.options.items  *  base.itemWidth  )  *  -1;

            // If the number of items to display is greater than the total items available,
            // then there's no scrolling needed, so maximums are zero.
            if  (  base.options.items  >  base.itemsAmount  )
            {
                base.maximumItem  =  0;      // No maximum item index to scroll to.
                maximum  =  0;               // No negative pixel offset.
                base.maximumPixels  =  0;    // No maximum pixel value.
            }
            else
            {
                // Otherwise, calculate the actual maximum item index and pixel offset.
                base.maximumItem  =  base.itemsAmount  -  base.options.items;
                base.maximumPixels  =  maximum;
            }
            return  maximum; // Return the calculated maximum pixel offset.
        },

        // Returns the minimum scrollable pixel position for the carousel, which is always 0.
        min  :  function  ()
        {
            return  0; // The carousel always starts at position 0.
        },

        // Calculates the scroll positions for each item and for pagination pages.
        loops  :  function  ()
        {
            var  base  =  this,     // Reference to the current instance
                 prev  =  0,         // Stores the previous round page number
                 elWidth  =  0,      // Accumulates the total width of items processed
                 i,                  // Loop counter
                 item,               // Current item being processed
                 roundPageNum;       // Pagination round page number for the current item

            // Initialize arrays to store pixel positions for each item and each page.
            base.positionsInArray  =  [0]; // Start with position 0.
            base.pagesInArray  =  [];      // Array for page-based scroll positions.

            // Iterate through all carousel items.
            for  (  i  =  0;  i  <  base.itemsAmount;  i  +=  1  )
            {
                elWidth  +=  base.itemWidth; // Add current item's width to total.
                // Store the negative cumulative width as a scroll position.
                base.positionsInArray.push  (  -elWidth  );

                // If scrolling per page is enabled, calculate page-specific positions.
                if  (  base.options.scrollPerPage  ===  true  )
                {
                    item  =  $(  base.$owlItems[i]  ); // Get the current jQuery item.
                    roundPageNum  =  item.data  (  "owl-roundPages"  ); // Get its assigned page number.
                    // If a new round/page is encountered:
                    if  (  roundPageNum  !==  prev  )
                    {
                        // Store the pixel position at the start of this new page.
                        base.pagesInArray[prev]  =  base.positionsInArray[i];
                        prev  =  roundPageNum; // Update the previous round page number.
                    }
                }
            }
        },

        // Constructs the navigation (next/prev buttons) and pagination (dots) controls
        // if they are enabled in the options.
        buildControls  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Only create the main controls container if either navigation or pagination is enabled.
            if  (  base.options.navigation  ===  true  ||  base.options.pagination  ===  true  )
            {
                base.owlControls  =  $(  "<div class=\"owl-controls\"/>"  )
                                     .toggleClass  (  "clickable",  !base.browser.isTouch  ) // Add 'clickable' class if not a touch device.
                                     .appendTo  (  base.$elem  ); // Append controls to the main carousel element.
            }

            // If pagination is enabled, build the pagination dots.
            if  (  base.options.pagination  ===  true  )
            {
                base.buildPagination  ();
            }

            // If navigation buttons are enabled, build the next/previous buttons.
            if  (  base.options.navigation  ===  true  )
            {
                base.buildButtons  ();
            }
        },

        // Creates and attaches the 'next' and 'previous' navigation buttons.
        buildButtons  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 // Create a wrapper for the navigation buttons.
                 buttonsWrapper  =  $(  "<div class=\"owl-buttons\"/>"  );

            // Append the button wrapper to the main controls container.
            base.owlControls.append  (  buttonsWrapper  );

            // Create the 'Previous' button element.
            base.buttonPrev  =  $(  "<div/>",  {
                "class"  :  "owl-prev", // CSS class for styling
                "html"   :  base.options.navigationText[0]  ||  "" // Text content, or empty string if not provided.
            }  );

            // Create the 'Next' button element.
            base.buttonNext  =  $(  "<div/>",  {
                "class"  :  "owl-next", // CSS class for styling
                "html"   :  base.options.navigationText[1]  ||  "" // Text content, or empty string.
            }  );

            // Append both buttons to their wrapper.
            buttonsWrapper
                .append  (  base.buttonPrev  )
                .append  (  base.buttonNext  );

            // Prevent default touch/mouse down behavior on buttons.
            buttonsWrapper.on  (  "touchstart.owlControls mousedown.owlControls",  "div[class^=\"owl\"]",  function  (  event  )
            {
                event.preventDefault  ();
            }  );

            // Handle touch/mouse up events on buttons to trigger navigation.
            buttonsWrapper.on  (  "touchend.owlControls mouseup.owlControls",  "div[class^=\"owl\"]",  function  (  event  )
            {
                event.preventDefault  (); // Prevent default action (e.g., text selection).
                // Determine which button was clicked and trigger the corresponding action.
                if  (  $(  this  ).hasClass  (  "owl-next"  )  )
                {
                    base.next  (); // Move to the next item.
                }
                else
                {
                    base.prev  (); // Move to the previous item.
                }
            }  );
        },

        // Creates the pagination dots container and attaches event handlers.
        buildPagination  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // Create the main pagination wrapper element.
            base.paginationWrapper  =  $(  "<div class=\"owl-pagination\"/>"  );
            // Append the pagination wrapper to the main controls container.
            base.owlControls.append  (  base.paginationWrapper  );

            // Attach event handlers to the pagination dots for navigation.
            base.paginationWrapper.on  (  "touchend.owlControls mouseup.owlControls",  ".owl-page",  function  (  event  )
            {
                event.preventDefault  (); // Prevent default touch/mouse behavior.
                // If the clicked pagination dot corresponds to a different item than the current one:
                if  (  Number  (  $(  this  ).data  (  "owl-page"  )  )  !==  base.currentItem  )
                {
                    // Navigate to the item associated with the clicked page.
                    base.goTo  (  Number  (  $(  this  ).data  (  "owl-page"  )  ),  true  );
                }
            }  );
        },

        // Generates and updates the pagination dots based on the current number of items
        // and items per page setting.
        updatePagination  :  function  ()
        {
            var  base  =  this, // Reference to the current instance
                 counter,           // Counts the pagination page numbers
                 lastPage,          // Index of the starting item for the last "full" page
                 lastItem,          // Index of the last item in the carousel
                 i,                 // Loop counter
                 paginationButton,  // jQuery object for a single pagination dot
                 paginationButtonInner; // jQuery object for the inner span (for numbers)

            // If pagination is disabled, do not proceed.
            if  (  base.options.pagination  ===  false  )
            {
                return  false;
            }

            // Clear any existing pagination dots before rebuilding.
            base.paginationWrapper.html  (  ""  );

            counter  =  0; // Initialize page counter.
            // Calculate the starting index of the last page that contains a full set of items.
            lastPage  =  base.itemsAmount  -  base.itemsAmount  %  base.options.items;

            // Iterate through all items to determine where pagination dots should be placed.
            for  (  i  =  0;  i  <  base.itemsAmount;  i  +=  1  )
            {
                // A new pagination dot is created for every 'items' count or at the start of a new page.
                if  (  i  %  base.options.items  ===  0  )
                {
                    counter  +=  1; // Increment the page counter.
                    // Special handling for the last page to ensure it points to the correct item.
                    if  (  lastPage  ===  i  )
                    {
                        lastItem  =  base.itemsAmount  -  base.options.items;
                    }

                    // Create the main pagination button (dot) element.
                    paginationButton  =  $(  "<div/>",  {
                        "class"  :  "owl-page" // Assign CSS class.
                    }  );

                    // Create the inner span for pagination numbers if enabled.
                    paginationButtonInner  =  $(  "<span></span>",  {
                        "text":  base.options.paginationNumbers  ===  true  ?  counter  :  "", // Display number or empty.
                        "class":  base.options.paginationNumbers  ===  true  ?  "owl-numbers"  :  "" // Assign class for numbers.
                    }  );

                    // Append the inner span to the button.
                    paginationButton.append  (  paginationButtonInner  );

                    // Store the associated item index and round page number as data attributes.
                    paginationButton.data  (  "owl-page",  lastPage  ===  i  ?  lastItem  :  i  );
                    paginationButton.data  (  "owl-roundPages",  counter  );

                    // Append the newly created pagination button to the wrapper.
                    base.paginationWrapper.append  (  paginationButton  );
                }
            }
            // After creating all buttons, update their active state.
            base.checkPagination  ();
        },

        // Checks the current item and updates the active state of pagination dots.
        checkPagination  :  function  ()
        {
            var  base  =  this; // Reference to the current instance

            // If pagination is disabled, do nothing.
            if  (  base.options.pagination  ===  false  )
            {
                return  false;
            }

            // Iterate over each pagination dot.
            base.paginationWrapper.find  (  ".owl-page"  ).each  (  function  ()
            {
                // If the current pagination dot's round page number matches
                // the round page number of the currently displayed item:
                if  (  $(  this  ).data  (  "owl-roundPages"  )  ===  $(  base.$owlItems[base.currentItem]  ).data  (  "owl-roundPages"  )  )
                {
                    // Remove 'active' class from all other dots and add it to the current one.
                    base.paginationWrapper
                        .find  (  ".owl-page"  )
                        .removeClass  (  "active"  );
                    $(  this  ).addClass  (  "active"  );
                }
            }  );
        }
    };
}(jQuery, window, document));