/*!
 * Salvattore 1.0.5 by @rnmp and @ppold
 * https://github.com/rnmp/salvattore
 */
// This is an Immediately Invoked Function Expression (IIFE)
// It sets up the module for various JavaScript environments (UMD pattern).
( function ( root, factory ) {

    // Check for AMD (Asynchronous Module Definition) / RequireJS
    if ( typeof define === 'function' && define.amd )
    {
        // Define the module for AMD loaders.
        define( [], factory );
    }
    // Check for CommonJS / Node.js environment
    else if ( typeof exports === 'object' )
    {
        // Export the module for Node.js-like environments.
        module.exports = factory();
    }
    // Fallback for browser global scope
    else
    {
        // Attach the module to the global object (e.g., window in browsers).
        root.salvattore = factory();
    }

// Pass the global context (e.g., 'window') and the factory function.
}( this, function () {
    // The factory function encapsulates the main logic of the Salvattore library.
    // All polyfills and the core functionality will be defined within this scope.

    /*!
     * matchMedia() polyfill - Tests a CSS media type/query in JavaScript.
     * Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight.
     * License: Dual MIT/BSD.
     */

    // Check if the native window.matchMedia API is not available in the browser.
    if ( !window.matchMedia )
    {
        // If not available, provide a polyfill implementation.
        window.matchMedia = function ()
        {
            "use strict"; // Enable strict mode for this function's scope.

            // Attempt to use native 'styleMedia' or 'media' properties for media queries.
            // These are supported in some browsers like IE9 and WebKit-based ones.
            var styleMedia = ( window.styleMedia || window.media );

            // If a native 'styleMedia' object is still not found, create a robust fallback.
            if ( !styleMedia )
            {
                // Create a temporary <style> element to test media queries via CSS.
                var style = document.createElement( 'style' ),
                    // Get the first script tag to insert the style element before it.
                    script = document.getElementsByTagName( 'script' )[0],
                    // Variable to hold computed style information.
                    info = null;

                // Set the type attribute for the style element.
                style.type = 'text/css';
                // Assign a unique ID for easy identification and targeting.
                style.id = 'matchmediajs-test';

                // Insert the dynamically created style element into the document's head.
                script.parentNode.insertBefore( style, script );

                // Get the computed style of the inserted element.
                // Uses 'window.getComputedStyle' for modern browsers (Chrome, Firefox, Safari)
                // and 'style.currentStyle' for older Internet Explorer versions (IE <= 8).
                info = ( 'getComputedStyle' in window ) && window.getComputedStyle( style, null ) || style.currentStyle;

                // Define the 'styleMedia' object with a 'matchMedium' method.
                styleMedia = {
                    matchMedium: function ( media )
                    {
                        // Construct a CSS rule that applies a specific width if the media query matches.
                        // The width '1px' is a distinct value used for testing.
                        var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                        // Apply the CSS text to the style element.
                        // 'style.styleSheet' is used by IE <= 8.
                        // 'style.textContent' is used by all other modern browsers.
                        if ( style.styleSheet )
                        {
                            style.styleSheet.cssText = text;
                        }
                        else
                        {
                            style.textContent = text;
                        }

                        // Test if the media query is true by checking the computed width.
                        // If it's '1px', the media query matched.
                        return info.width === '1px';
                    }
                };
            }

            // Return the function that the polyfilled window.matchMedia will be set to.
            // This function takes a media query string and returns a Media Query List object.
            return function ( media )
            {
                return {
                    matches: styleMedia.matchMedium( media || 'all' ), // Perform the media query test.
                    media: media || 'all' // Store the original media query string.
                };
            };
        }(); // Immediately invoke this function to assign its return value to window.matchMedia.
    }

    /*!
     * matchMedia() polyfill addListener/removeListener extension.
     * Author & copyright (c) 2012: Scott Jehl.
     * License: Dual MIT/BSD.
     */
    // This IIFE extends the `matchMedia` polyfill to include `addListener` and `removeListener` methods.
    ( function ()
    {
        "use strict"; // Enforce strict JavaScript semantics.

        // If the browser natively supports `addListener` on `matchMedia` (e.g., modern browsers),
        // then this polyfill is not needed, so we bail out.
        if ( window.matchMedia && window.matchMedia( 'all' ).addListener )
        {
            return false; // Indicate that the polyfill was not applied.
        }

        var localMatchMedia = window.matchMedia, // Store a reference to the (possibly polyfilled) `matchMedia`.
            hasMediaQueries = localMatchMedia( 'only all' ).matches, // Check if media queries are generally supported by the browser.
            isListening = false, // Flag to ensure only one global `resize` event listener is attached.
            timeoutID = 0, // Used for debouncing the `handleChange` function to optimize performance.
            queries = [], // An array to hold `mql` (MediaQueryList) objects and their associated listener functions.

            // `handleChange` function: this is the event handler for the global `resize` event.
            handleChange = function ( evt )
            {
                // Debounce mechanism: Clear any pending timeout to avoid rapid execution.
                clearTimeout( timeoutID );

                // Set a new timeout to process changes after a short delay.
                timeoutID = setTimeout( function ()
                {
                    // Iterate through all registered media query lists.
                    for ( var i = 0, il = queries.length; i < il; i++ )
                    {
                        var mql = queries[i].mql, // The MediaQueryList object.
                            listeners = queries[i].listeners || [], // Array of listener callbacks for this `mql`.
                            matches = localMatchMedia( mql.media ).matches; // Re-evaluate the media query's match status.

                        // Only trigger listeners if the `matches` state has actually changed.
                        // This prevents unnecessary calls when the window resizes but the media query state is the same.
                        if ( matches !== mql.matches )
                        {
                            mql.matches = matches; // Update the `matches` property of the `mql` object.

                            // Call each registered listener function.
                            for ( var j = 0, jl = listeners.length; j < jl; j++ )
                            {
                                listeners[j].call( window, mql ); // Execute listener with `window` as context and `mql` as argument.
                            }
                        }
                    }
                }, 30 ); // Debounce delay of 30 milliseconds.
            };

        // Override the global `window.matchMedia` function with our extended version.
        window.matchMedia = function ( media )
        {
            var mql = localMatchMedia( media ), // Get the base `MediaQueryList` object from the original `matchMedia`.
                listeners = [], // Initialize an empty array to store listeners for *this specific* `mql`.
                index = 0; // A flag to track if this `mql` has been added to the `queries` array.

            // Add an `addListener` method to the `mql` object.
            mql.addListener = function ( listener )
            {
                // If the browser does not support media queries at all (e.g., very old IE),
                // then changes won't occur, so return early.
                if ( !hasMediaQueries )
                {
                    return;
                }

                // Attach a single global `resize` event listener only once.
                // This optimizes performance by avoiding multiple listeners for every `mql`.
                if ( !isListening )
                {
                    isListening = true; // Set flag to true.
                    window.addEventListener( 'resize', handleChange, true ); // Attach the debounced handler.
                }

                // If this `mql` object hasn't been added to the `queries` array yet, add it.
                if ( index === 0 )
                {
                    index = queries.push( { // Push an object containing the `mql` and its `listeners` array.
                        mql: mql,
                        listeners: listeners
                    } );
                }

                listeners.push( listener ); // Add the new listener callback to this `mql`'s list.
            };

            // Add a `removeListener` method to the `mql` object.
            mql.removeListener = function ( listener )
            {
                // Iterate through the listeners to find and remove the specified one.
                for ( var i = 0, il = listeners.length; i < il; i++ )
                {
                    if ( listeners[i] === listener )
                    {
                        listeners.splice( i, 1 ); // Remove the listener from the array.
                    }
                }
            };

            return mql; // Return the enhanced `MediaQueryList` object.
        };
    }() ); // End of the `matchMedia` extension IIFE.


    // References for requestAnimationFrame polyfill:
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // This is a polyfill for `window.requestAnimationFrame` by Erik Möller,
    // with enhancements from Paul Irish and Tino Zijdel.
    // It helps in performing animations efficiently by synchronizing with the browser's repaint cycle.

    // License: MIT.

    ( function ()
    {
        "use strict"; // Enable strict mode for this IIFE.

        var lastTime = 0; // Keeps track of the last time a frame was requested, used for the setTimeout fallback.
        var vendors = [ 'ms', 'moz', 'webkit', 'o' ]; // Array of common browser prefixes.

        // Loop through the vendor prefixes to find and assign the native `requestAnimationFrame` and `cancelAnimationFrame`.
        for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x )
        {
            window.requestAnimationFrame = window[ vendors[x] + 'RequestAnimationFrame' ];
            window.cancelAnimationFrame = window[ vendors[x] + 'CancelAnimationFrame' ] ||
                window[ vendors[x] + 'CancelRequestAnimationFrame' ]; // Handle older 'cancelRequestAnimationFrame' naming.
        }

        // If `requestAnimationFrame` is still not defined after checking vendor prefixes,
        // provide a `setTimeout`-based polyfill. This aims for approximately 60 frames per second.
        if ( !window.requestAnimationFrame )
        {
            window.requestAnimationFrame = function ( callback, element )
            {
                var currTime = new Date().getTime(); // Get the current timestamp.
                // Calculate the time until the next frame should ideally be drawn (aiming for 16ms interval).
                var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
                // Schedule the callback using `setTimeout`.
                var id = window.setTimeout( function () { callback( currTime + timeToCall ); },
                    timeToCall );
                lastTime = currTime + timeToCall; // Update `lastTime` for the next frame calculation.
                return id; // Return the timeout ID, similar to native `requestAnimationFrame`.
            };
        }

        // If `cancelAnimationFrame` is not defined, provide a `clearTimeout`-based polyfill.
        if ( !window.cancelAnimationFrame )
        {
            window.cancelAnimationFrame = function ( id )
            {
                clearTimeout( id ); // Clear the scheduled timeout.
            };
        }
    }() ); // End of the `requestAnimationFrame` polyfill IIFE.


    // Documentation for CustomEvent: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

    // Provide a polyfill for the `CustomEvent` constructor if it's not natively supported.
    // This is often needed for older browsers like Internet Explorer.
    if ( typeof window.CustomEvent !== "function" )
    {
        ( function ()
        {
            "use strict"; // Strict mode for this polyfill.

            // CustomEvent constructor polyfill implementation.
            function CustomEvent( event, params )
            {
                // Set default parameters if none are provided.
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                // Create a generic CustomEvent using `document.createEvent`.
                var evt = document.createEvent( 'CustomEvent' );
                // Initialize the custom event with the provided details.
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                return evt; // Return the newly created event object.
            }

            // Ensure the polyfilled CustomEvent inherits from `Event.prototype`.
            CustomEvent.prototype = window.Event.prototype;

            // Expose the polyfilled CustomEvent constructor globally.
            window.CustomEvent = CustomEvent;
        } )(); // End of the CustomEvent polyfill IIFE.
    }

    /* jshint laxcomma: true */
    // This is the main Salvattore module, defined as an IIFE.
    // It accepts `global` (e.g., `window`), `document`, and `undefined` as arguments.
    var salvattore = ( function ( global, document, undefined )
    {
        "use strict"; // Apply strict mode to the main module for safer coding practices.

        var self = {}, // This object will hold all public methods and properties of Salvattore.
            grids = [], // An array to keep track of all grid elements managed by Salvattore.
            mediaRules = [], // Stores references to CSS media rules that affect grid layouts.
            mediaQueries = [], // Stores `MediaQueryList` objects and their associated rules for dynamic updates.

            // Helper function to add `data-*` attributes to an HTML element.
            // Provides a fallback for older browsers that don't fully support `element.dataset`.
            add_to_dataset = function ( element, key, value )
            {
                // Use the modern `dataset` API if available (IE10+ and other modern browsers).
                if ( element.dataset )
                {
                    element.dataset[key] = value;
                }
                // Fallback for older browsers (e.g., IE9) that require `setAttribute`.
                else
                {
                    element.setAttribute( "data-" + key, value );
                }
                return; // This function does not explicitly return a value.
            };

        /**
         * @function obtainGridSettings
         * @description Parses the grid configuration from the `content` property of the `::before` pseudo-element.
         * This method extracts the desired number of columns and any specific CSS classes for those columns.
         * @param {HTMLElement} element The grid container element (e.g., `div[data-columns]`).
         * @returns {Object} An object containing `numberOfColumns` (integer) and `columnClasses` (array of strings).
         */
        self.obtainGridSettings = function obtainGridSettings( element )
        {
            // This function returns the number of columns and the CSS classes that should be applied to each column.
            // It determines these settings by inspecting the computed style of the `::before` pseudo-element of the grid container.

            var computedStyle = global.getComputedStyle( element, ":before" ), // Get computed styles for the ::before pseudo-element.
                content = computedStyle.getPropertyValue( "content" ).slice( 1, -1 ), // Extract the 'content' string and remove surrounding quotes.
                matchResult = content.match( /^\s*(\d+)(?:\s?\.(.+))?\s*$/ ), // Regex to parse content like "3 .column-class" or "4".
                numberOfColumns = 1, // Default to 1 column if no specific number is found.
                columnClasses = []; // Initialize an empty array for column classes.

            if ( matchResult )
            {
                numberOfColumns = matchResult[1]; // The first captured group is the number of columns.
                columnClasses = matchResult[2]; // The second captured group contains dot-separated class names.
                // If column classes are found, split them by '.' and use 'column' as a fallback.
                columnClasses = columnClasses ? columnClasses.split( "." ) : [ "column" ];
            }
            else
            {
                // This block handles an alternative content format, e.g., ".column-class 4".
                matchResult = content.match( /^\s*\.(.+)\s+(\d+)\s*$/ );
                if ( matchResult )
                {
                    columnClasses = matchResult[1];
                    numberOfColumns = matchResult[2];
                    if ( numberOfColumns )
                    {
                        // Note: The original code has `numberOfColumns.split(".")` here, which seems like a potential bug
                        // if `numberOfColumns` is expected to be a number. Maintaining it as per Type I definition.
                        numberOfColumns = numberOfColumns.split( "." );
                    }
                }
            }

            // Return an object encapsulating the determined grid settings.
            return {
                numberOfColumns: numberOfColumns,
                columnClasses: columnClasses
            };
        };


        /**
         * @function addColumns
         * @description Creates column elements based on grid settings and distributes existing items into them.
         * This function is responsible for structuring the grid visually.
         * @param {HTMLElement} grid The main grid container element.
         * @param {HTMLElement} items A temporary container holding all the raw grid items.
         */
        self.addColumns = function addColumns( grid, items )
        {
            // This function takes the obtained settings, creates the necessary column elements,
            // and then distributes the provided list of items into these new columns.

            var settings = self.obtainGridSettings( grid ), // Retrieve the grid configuration (number of columns, classes).
                numberOfColumns = settings.numberOfColumns, // The total count of columns to create.
                columnClasses = settings.columnClasses, // An array of class names for each column.
                columnsItems = new Array( +numberOfColumns ), // An array to temporarily hold items destined for each column.
                columnsFragment = document.createDocumentFragment(), // A document fragment for efficient batch DOM insertion.
                i = numberOfColumns, // Loop counter, initialized to the number of columns.
                selector; // Variable to store the CSS selector string.

            // Distribute items into conceptual columns using CSS `nth-child` selectors.
            // This groups items that will belong to the same physical column.
            while ( i-- !== 0 )
            {
                // Example selector: `[data-columns] > *:nth-child(3n-0)`, `(3n-1)`, `(3n-2)` for 3 columns.
                selector = "[data-columns] > *:nth-child(" + numberOfColumns + "n-" + i + ")";
                columnsItems.push( items.querySelectorAll( selector ) ); // Select items for the current column `i`.
            }

            // For each set of items grouped for a column:
            columnsItems.forEach( function append_to_grid_fragment( rows )
            {
                var column = document.createElement( "div" ), // Create a new `div` element for the column.
                    rowsFragment = document.createDocumentFragment(); // Create a fragment for the rows within this column.

                column.className = columnClasses.join( " " ); // Apply all specified column classes.

                // Append each individual row (grid item) to the column's fragment.
                Array.prototype.forEach.call( rows, function append_to_column( row )
                {
                    rowsFragment.appendChild( row );
                } );
                column.appendChild( rowsFragment ); // Add all gathered rows to the column element.
                columnsFragment.appendChild( column ); // Add the fully populated column to the main grid fragment.
            } );

            grid.appendChild( columnsFragment ); // Finally, append all new columns to the actual grid element in the DOM.
            add_to_dataset( grid, 'columns', numberOfColumns ); // Update the `data-columns` attribute on the grid.
        };


        /**
         * @function removeColumns
         * @description Deconstructs the grid layout by removing all column elements.
         * It collects all grid items and returns them in their original, sequential order.
         * @param {HTMLElement} grid The grid container element.
         * @returns {HTMLElement} A temporary `div` element containing all items, stripped of column structure.
         */
        self.removeColumns = function removeColumns( grid )
        {
            // This function removes all existing column elements from a grid.
            // It then reassembles all the individual grid items into a single container,
            // preserving their original order based on how they were distributed across columns.

            var range = document.createRange(); // Create a new DOM Range object.
            range.selectNodeContents( grid ); // Select all children of the grid element.

            // Extract the contents of the grid (which includes all columns) and filter to get only HTMLElement nodes.
            var columns = Array.prototype.filter.call( range.extractContents().childNodes, function filter_elements( node )
            {
                return node instanceof global.HTMLElement; // Ensure we only process actual HTML elements.
            } );

            var numberOfColumns = columns.length, // The number of columns that were in the grid.
                // Determine the maximum number of rows in the first column to estimate total items.
                numberOfRowsInFirstColumn = columns[0].childNodes.length,
                // Pre-allocate an array to hold all sorted items.
                sortedRows = new Array( numberOfRowsInFirstColumn * numberOfColumns );

            // Iterate through each column and its children (rows/items) to reconstruct the original order.
            Array.prototype.forEach.call( columns, function iterate_columns( column, columnIndex )
            {
                Array.prototype.forEach.call( column.children, function iterate_rows( row, rowIndex )
                {
                    // Calculate the original index of the item.
                    // Items are stored row-by-row, then column-by-column.
                    sortedRows[ rowIndex * numberOfColumns + columnIndex ] = row;
                } );
            } );

            var container = document.createElement( "div" ); // Create a new temporary `div` container.
            add_to_dataset( container, 'columns', 0 ); // Mark this container as having zero columns.

            // Filter out any potential `null` or `undefined` entries (which shouldn't happen if logic is perfect)
            // and append each valid child element to the temporary container.
            sortedRows.filter( function filter_non_null( child )
            {
                return !!child; // Only keep truthy values.
            } ).forEach( function append_row( child )
            {
                container.appendChild( child );
            } );

            return container; // Return the temporary container holding all grid items.
        };


        /**
         * @function recreateColumns
         * @description Forces a complete re-layout of a grid.
         * This involves removing all existing columns, then re-adding them,
         * which effectively re-distributes all items based on current settings.
         * This is typically invoked when the computed number of columns changes.
         * @param {HTMLElement} grid The grid container element to re-layout.
         */
        self.recreateColumns = function recreateColumns( grid )
        {
            // This method first removes all existing columns from the grid,
            // then immediately re-adds them. This process is crucial when the
            // number of columns needs to be updated (e.g., due to a media query change).

            // Use `requestAnimationFrame` to ensure the DOM updates are batched and
            // performed efficiently, synchronized with the browser's rendering cycle.
            global.requestAnimationFrame( function render_after_css_mediaQueryChange()
            {
                // Step 1: Remove all current columns and retrieve all grid items in a temporary container.
                // Step 2: Add new columns to the grid, distributing the items from the temporary container.
                self.addColumns( grid, self.removeColumns( grid ) );

                // Create and dispatch a custom event to signal that the grid's columns have changed.
                var columnsChange = new CustomEvent( "columnsChange" );
                grid.dispatchEvent( columnsChange ); // Notify any listeners attached to the grid.
            } );
        };


        /**
         * @function mediaQueryChange
         * @description Callback handler for `matchMedia` events.
         * When a registered media query's `matches` state becomes true,
         * this function triggers a re-creation of columns for all managed grids.
         * @param {MediaQueryList} mql The `MediaQueryList` object that triggered the change.
         */
        self.mediaQueryChange = function mediaQueryChange( mql )
        {
            // This function is invoked when the state of a media query changes.
            // If the media query now `matches` the current browser state,
            // it means the column structure might need to be updated.

            if ( mql.matches ) // Check if the media query is currently active/matching.
            {
                // Iterate over all registered Salvattore grids and trigger a column re-creation for each.
                Array.prototype.forEach.call( grids, self.recreateColumns );
            }
        };


        /**
         * @function getCSSRules
         * @description Retrieves the list of CSS rules from a given stylesheet object.
         * It handles potential security errors that can occur when accessing cross-origin stylesheets.
         * @param {CSSStyleSheet} stylesheet The stylesheet object to inspect.
         * @returns {CSSRuleList|Array} A `CSSRuleList` object or an empty array if access is denied or no rules exist.
         */
        self.getCSSRules = function getCSSRules( stylesheet )
        {
            // This utility function attempts to retrieve all CSS rules from a provided stylesheet object.
            // It includes error handling for cases where accessing stylesheet rules might be restricted (e.g., cross-origin).

            var cssRules; // Variable to store the retrieved CSS rules.
            try
            {
                // Access `stylesheet.sheet.cssRules` for modern browsers or `stylesheet.sheet.rules` for older IE.
                cssRules = stylesheet.sheet.cssRules || stylesheet.sheet.rules;
            }
            catch ( e )
            {
                // If an error occurs (e.g., SecurityError for cross-origin stylesheets), return an empty array.
                return [];
            }

            return cssRules || []; // Return the rules, or an empty array if `cssRules` is still null/undefined.
        };


        /**
         * @function getStylesheets
         * @description Gathers all accessible stylesheet objects present in the current document.
         * This includes both inline `<style>` tags and external `<link rel="stylesheet">` tags.
         * @returns {Array<CSSStyleSheet>} An array of `CSSStyleSheet` objects.
         */
        self.getStylesheets = function getStylesheets()
        {
            // This function aggregates all `<style>` elements with `type='text/css'`
            // and all `<link>` elements with `rel='stylesheet'` from the document.
            // It returns them as a single, flattened array of stylesheet objects.

            return Array.prototype.concat.call(
                // Select all inline style tags.
                Array.prototype.slice.call( document.querySelectorAll( "style[type='text/css']" ) ),
                // Select all external linked stylesheets.
                Array.prototype.slice.call( document.querySelectorAll( "link[rel='stylesheet']" ) )
            );
        };


        /**
         * @function mediaRuleHasColumnsSelector
         * @description Checks if any CSS rule within a given list targets Salvattore grid columns.
         * It specifically looks for selectors like `[data-columns]...::before` which Salvattore uses for configuration.
         * @param {CSSRuleList} rules A collection of CSSRule objects to inspect.
         * @returns {boolean} `true` if a matching selector is found, `false` otherwise.
         */
        self.mediaRuleHasColumnsSelector = function mediaRuleHasColumnsSelector( rules )
        {
            // This function iterates through a list of CSS rules to determine if any of them
            // contain a selector pattern that indicates it's styling a Salvattore grid.
            // The pattern searched for is typically used to define column counts via `::before` pseudo-elements.

            var i, rule; // Declare loop counter and current rule variables.

            try
            {
                i = rules.length; // Attempt to get the length of the rules list safely.
            }
            catch ( e )
            {
                i = 0; // If `rules` is not an array-like object or access fails, treat length as 0.
            }

            // Iterate backwards through the rules list for efficiency.
            while ( i-- )
            {
                rule = rules[i]; // Get the current CSS rule.
                // Check if the rule has a `selectorText` property and if it matches the pattern
                // `[data-columns]` followed by any characters, then `::before` or `:before`.
                if ( rule.selectorText && rule.selectorText.match( /\[data-columns\](.*)::?before$/ ) )
                {
                    return true; // A matching selector was found.
                }
            }

            return false; // No selector matching the grid pattern was found in the provided rules.
        };


        /**
         * @function scanMediaQueries
         * @description Scans all stylesheets in the document to identify CSS media queries
         * that are relevant to Salvattore grids. It then manages `matchMedia` listeners
         * for these rules, adding new ones and removing obsolete ones.
         */
        self.scanMediaQueries = function scanMediaQueries()
        {
            // This function's purpose is to find all CSS media rules that define grid column layouts.
            // It then sets up or tears down `matchMedia` listeners to react to changes in these media queries.

            var newMediaRules = []; // A temporary array to store media rules found in the current scan.

            // If `window.matchMedia` is not supported (e.g., older browsers), this functionality cannot be used.
            if ( !global.matchMedia )
            {
                return; // Exit early if `matchMedia` API is unavailable.
            }

            // Iterate through all accessible stylesheets in the document.
            self.getStylesheets().forEach( function extract_rules( stylesheet )
            {
                // For each stylesheet, iterate through its CSS rules.
                Array.prototype.forEach.call( self.getCSSRules( stylesheet ), function filter_by_column_selector( rule )
                {
                    // Check if the rule is a media rule (`@media`) and if its contained rules
                    // include a selector that targets Salvattore `data-columns` grids.
                    if ( rule.media && rule.cssRules && self.mediaRuleHasColumnsSelector( rule.cssRules ) )
                    {
                        newMediaRules.push( rule ); // Add this relevant media rule to our new list.
                    }
                } );
            } );

            // --- Logic to manage `matchMedia` listeners: remove old, add new ---

            // Identify `mediaRules` that are no longer present in `newMediaRules` (i.e., rules that were removed or changed).
            var oldRules = mediaRules.filter( function ( el )
            {
                return newMediaRules.indexOf( el ) === -1;
            } );
            // For each `MediaQueryList` object associated with an `oldRule`, remove its `mediaQueryChange` listener.
            mediaQueries.filter( function ( el )
            {
                return oldRules.indexOf( el.rule ) !== -1;
            } ).forEach( function ( el )
            {
                el.mql.removeListener( self.mediaQueryChange );
            } );
            // Filter out the `mediaQueries` entries that correspond to the `oldRules`.
            mediaQueries = mediaQueries.filter( function ( el )
            {
                return oldRules.indexOf( el.rule ) === -1;
            } );

            // Identify `newMediaRules` that were not present in the previous `mediaRules` (i.e., newly added rules).
            newMediaRules.filter( function ( el )
            {
                return mediaRules.indexOf( el ) == -1; // Note: `==` is used here in original code, maintaining.
            } ).forEach( function ( rule )
            {
                // Create a new `MediaQueryList` object for the new media query.
                var mql = global.matchMedia( rule.media.mediaText );
                mql.addListener( self.mediaQueryChange ); // Add the `mediaQueryChange` listener.
                mediaQueries.push( { rule: rule, mql: mql } ); // Store the rule and its `mql` object.
            } );

            // Update the main `mediaRules` array to reflect the current set of relevant rules.
            mediaRules.length = 0; // Clear the old array.
            mediaRules = newMediaRules; // Assign the new array.
        };


        /**
         * @function rescanMediaQueries
         * @description A convenience function to force a complete re-evaluation of media queries
         * and subsequently re-render all known grids. Useful for dynamic stylesheet changes.
         */
        self.rescanMediaQueries = function rescanMediaQueries()
        {
            self.scanMediaQueries(); // First, re-scan all stylesheets for relevant media queries.
            // Then, trigger a re-creation of columns for every registered grid element.
            Array.prototype.forEach.call( grids, self.recreateColumns );
        };


        /**
         * @function nextElementColumnIndex
         * @description Determines which column an incoming element should be placed into.
         * It selects the column that currently has the fewest elements, taking into account
         * elements already queued in document fragments for future insertion. This ensures
         * an even distribution of items across columns.
         * @param {HTMLElement} grid The grid container element.
         * @param {Array<DocumentFragment>} fragments An array of `DocumentFragment`s, one for each column,
         *                                           containing elements yet to be inserted into the DOM.
         * @returns {number} The zero-based index of the column that should receive the next element.
         */
        self.nextElementColumnIndex = function nextElementColumnIndex( grid, fragments )
        {
            // This function calculates the optimal column index for placing a new element.
            // The goal is to keep the number of items in each column as balanced as possible.

            var children = grid.children, // Get all direct children of the grid (which are the columns).
                m = children.length, // Total number of columns.
                lowestRowCount = 0, // Tracks the minimum number of items found in any column so far.
                child, // Variable to hold the current column element in the loop.
                currentRowCount, // The calculated count of items for the current column.
                i, // Loop counter.
                index = 0; // The index of the column chosen as the target.

            // Iterate through each column to find the one with the fewest items.
            for ( i = 0; i < m; i++ )
            {
                child = children[i]; // Get the current column.
                // Calculate the total item count for this column:
                // `child.children.length` are items already in the DOM.
                // `(fragments[i].children || fragments[i].childNodes).length` are items planned for this column.
                currentRowCount = child.children.length + ( fragments[i].children || fragments[i].childNodes ).length;

                // Initialize `lowestRowCount` with the first column's count.
                if ( lowestRowCount === 0 )
                {
                    lowestRowCount = currentRowCount;
                }

                // If the current column has fewer items than the `lowestRowCount` found so far,
                // update `index` and `lowestRowCount`.
                if ( currentRowCount < lowestRowCount )
                {
                    index = i;
                    lowestRowCount = currentRowCount;
                }
            }

            return index; // Return the index of the column that should receive the next item.
        };


        /**
         * @function createFragmentsList
         * @description Generates an array containing a specified quantity of empty `DocumentFragment` objects.
         * These fragments are used for efficient batch DOM manipulations.
         * @param {number} quantity The number of `DocumentFragment`s to create.
         * @returns {Array<DocumentFragment>} An array of `DocumentFragment` instances.
         */
        self.createFragmentsList = function createFragmentsList( quantity )
        {
            // This helper function creates and returns an array of `DocumentFragment` objects.
            // Each fragment can be used as a temporary, lightweight container for DOM nodes
            // before they are inserted into the live document, minimizing reflows and repaints.

            var fragments = new Array( quantity ), // Initialize an array with the desired size.
                i = 0; // Loop counter.

            // Populate the array by creating a new `DocumentFragment` for each slot.
            while ( i !== quantity )
            {
                fragments[i] = document.createDocumentFragment();
                i++; // Increment the counter.
            }

            return fragments; // Return the array of fragments.
        };


        /**
         * @function appendElements
         * @description Appends a collection of new elements to the grid, distributing them
         * across the available columns in a balanced manner.
         * @param {HTMLElement} grid The grid container element.
         * @param {Array<HTMLElement>} elements An array of HTML elements to append to the grid.
         */
        self.appendElements = function appendElements( grid, elements )
        {
            // This function takes a list of new elements and intelligently adds them
            // to the end of the grid, ensuring they are distributed evenly across columns.

            var columns = grid.children, // Get the current column elements within the grid.
                numberOfColumns = columns.length, // Determine the total number of columns.
                // Create an array of `DocumentFragment`s, one for each column, to stage new elements.
                fragments = self.createFragmentsList( numberOfColumns );

            // Iterate over each new element to be appended.
            Array.prototype.forEach.call( elements, function append_to_next_fragment( element )
            {
                // Find the index of the column that currently has the fewest items (or is expected to have fewest).
                var columnIndex = self.nextElementColumnIndex( grid, fragments );
                // Append the current element to the `DocumentFragment` designated for that column.
                fragments[columnIndex].appendChild( element );
            } );

            // After all elements have been staged in fragments,
            // append each fragment to its respective column in the actual DOM.
            // This minimizes direct DOM manipulations and improves performance.
            Array.prototype.forEach.call( columns, function insert_column( column, index )
            {
                column.appendChild( fragments[index] );
            } );
        };


        /**
         * @function prependElements
         * @description Prepends a collection of new elements to the beginning of the grid,
         * distributing them across columns. (Implementation is partial in original source).
         * @param {HTMLElement} grid The grid container element.
         * @param {Array<HTMLElement>} elements An array of HTML elements to prepend to the grid.
         */
        self.prependElements = function prependElements( grid, elements )
        {
            // This function would typically implement logic to insert elements at the start of columns,
            // similar to `appendElements` but using `insertBefore` or similar methods.
            // The provided code snippet ends here, so we maintain its current structure.