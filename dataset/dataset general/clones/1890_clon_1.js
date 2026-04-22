// This file contains the ScrollStream jQuery plugin, version 1.0.2.
// It is available on GitHub: https://github.com/photoshelter/scrollstream
//
// Copyright (c) 2012 PhotoShelter, Inc.
// All rights reserved under the Apache License, Version 2.0.
// You can find a copy of the license at:
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless explicitly required by applicable law or agreed to in writing,
// software distributed under this license is provided "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////

;( function ( $, window, undefined ) {

    // The main ScrollStream constructor function.
    // Initializes a new scrollstream instance on a given element.
    var ScrollStream = function ( elem, opts ) {
        // Default configuration options for the scrollstream.
        var defaults = {
            name    :   'scrollstream', // Base name for IDs and classes
            context :   null,           // Scrollable element (defaults to window if null)
            debug   :   false,          // Enable debug logging to console
            events  :   {               // Custom event names
                req     :   'req.scrollstream',
                resp    :   'resp.scrollstream',
                start   :   'start.scrollstream',
                stop    :   'stop.scrollstream'
            },
            timers  :   {               // Timing constants for various operations
                debounce    :   500,    // Delay for scroll debouncing
                feedback    :   200,    // Interval for scroll feedback loop
                queue       :   100     // Interval for request/response queue processing
            },
            loading :   null,           // Function or HTML string for loading state
            classes :   {               // CSS classes for generated elements
                ol  :   null,           // Class for the <ol> element
                li  :   null            // Class for each <li> element
            }
        };

        // Merge defaults with user-provided options to create final settings.
        this.opts = $.extend( {}, defaults, opts );
        // Initialize jQuery element cache.
        this.jq = {};
        // Initialize constants storage.
        this.consts = {};
        // Initialize intervals storage for timers.
        this.intervals = {};
        // Request queue for data fetches.
        this.reqQ = [];
        // Response queue for incoming data.
        this.respQ = [];

        // Cache the main element as a jQuery object.
        this.jq.$elem = $( elem );

        // Generate and append the initial HTML structure.
        this.jq.$elem.html( this._makeHtml() );
        // Cache jQuery selectors for frequently accessed elements.
        $.extend( this.jq, this._makeJq() );

        // Ensure the context element has scrollable overflow.
        this.jq.$context.css( 'overflow-y', 'scroll' );
    };

    // Define prototype methods and properties for ScrollStream.
    ScrollStream.prototype = {
        opts        :   null,       // Configuration options.
        jq          :   null,       // Cached jQuery objects.
        consts      :   null,       // Calculated constants.
        intervals   :   null,       // Stored interval IDs.
        reqQ        :   null,       // Request queue.
        respQ       :   null,       // Response queue.

        // Private method: Generates the initial HTML structure for the scrollstream.
        _makeHtml   :   function () {
            var pre = this.opts.name + '-pre'; // ID for the 'pre' div (spacer).
            var block = this.opts.name + '-block'; // ID for the main content block (ol).

            var html = '<div id="' + pre + '"></div>'; // Pre-scroll spacer.
            var c = this.opts.classes.ol; // Optional class for the ordered list.
            html += c ? '<ol id="' + block + '" class="' + c + '"></ol>' :
                '<ol id="' + block + '"></ol>'; // The main list.

            return html; // Return the full HTML string.
        },

        // Private method: Caches jQuery selectors for internal use.
        _makeJq     :   function () {
            return {
                // Determine the scrolling context: either a custom element or the window.
                $context    :   ( typeof this.opts.context === 'function' ) ?
                    this.opts.context() : $( window ),
                // The 'pre' div for vertical spacing.
                $pre        :   $( '#' + this.opts.name + '-pre' ),
                // The main content block (ordered list).
                $block      :   $( '#' + this.opts.name + '-block' )
            };
        },

        // Properties related to current scroll state.
        preRows     :   null,       // Number of rows currently above the visible block.
        scrolled    :   null,       // Flag indicating if a scroll event occurred.
        resized     :   null,       // Flag indicating if a resize event occurred (not directly used here, but for future extension).

        // Public method: Initializes the scrollstream with item-specific details.
        init        :   function ( initOpts ) {
            // Store buffer size and item dimensions from init options.
            this.opts.buffer = initOpts.buffer;
            this.opts.item = initOpts.item;

            // Type checking for critical initialization parameters.
            if ( typeof this.opts.buffer !== 'number' ||
                typeof this.opts.item.count !== 'number' ||
                typeof this.opts.item.height !== 'number' ||
                typeof this.opts.item.width !== 'number' ) {
                throw new TypeError( "Malformed ScrollStream init type" );
            }

            // Clear existing content and return if there are no items to display.
            if ( this.opts.item.count < 1 ) {
                this.jq.$block.html( '' );
                return;
            }

            // Ensure a minimum buffer of 2 rows to allow partial top/bottom visibility.
            if ( this.opts.buffer < 2 ) {
                this.opts.buffer = 2;
            }

            // Calculate and store various display constants based on item dimensions and container size.
            this.consts = this._calcConsts();
            // Set the height of the main element to accommodate all content rows.
            this.jq.$elem.height( this.consts.contRows *
                this.opts.item.height );
            // Set the height of the visible block to accommodate its rows.
            this.jq.$block.height( this.consts.blockRows *
                this.opts.item.height );

            // Log debug information if debug mode is enabled.
            if ( this.opts.debug ) {
                console.log( "[init]" );
                console.log( "itemsPerRow:   " + this.consts.itemsPerRow );
                console.log( "contRows:      " + this.consts.contRows );
                console.log( "blockRows:     " + this.consts.blockRows );
                console.log( "itemsPerBlock: " + this.consts.itemsPerBlock );
                console.log( "----------------------------------------" );
            }

            // Start the request/response queue processing.
            this._startQueues();
            // Wire up the custom response event handler.
            this._wireRespEvent();

            // Perform initial setup for item display:
            // Scroll to the top.
            this.jq.$context.scrollTop( 0 );
            // Reset the pre-scroll spacer height.
            this.jq.$pre.height( 0 );
            // Initialize preRows count.
            this.preRows = 0;
            // Load the initial block of items.
            this._handleScroll( 'reload', 0, this.consts.itemsPerBlock, null, false );

            // Reset scroll and resize flags.
            this.scrolled = false;
            this.resized = false;

            // Set up the main scroll feedback loop.
            var that = this;
            this.jq.$context.scroll( function () { that.scrolled = true; } ); // Mark scrolled on scroll event.
            this.intervals.feedback = window.setInterval( function () {
                return that._feedback.apply( that ); // Periodically check for scroll/resize changes.
            }, this.opts.timers.feedback );
        },

        // Private method: Calculates various display constants.
        _calcConsts :   function () {
            var i = this.opts.item; // Shorthand for item options.

            // Calculate how many items fit horizontally in one row.
            var itemsPerRow = Math.floor( this.jq.$block.width() / i.width );
            if ( itemsPerRow < 1 ) itemsPerRow = 1; // Ensure at least one item per row.
            // Calculate total number of content rows required.
            var contRows = Math.ceil( i.count / itemsPerRow );

            // Calculate how many rows fit vertically in the visible context area.
            var winRows = Math.ceil( this.jq.$context.height() / i.height );
            var blockRows;
            if ( winRows < 1 ) blockRows = 1 + ( 2 * this.opts.buffer ); // Minimum block rows.
            else blockRows = winRows + ( 2 * this.opts.buffer ); // Visible rows plus buffer.
            if ( blockRows > contRows ) blockRows = contRows; // Block cannot be larger than total content.

            // Calculate total items in the visible block.
            var itemsPerBlock = blockRows * itemsPerRow;
            if ( i.count < itemsPerBlock ) itemsPerBlock = i.count; // Block cannot contain more items than available.

            // Return all calculated constants.
            return {
                itemsPerRow     :   itemsPerRow,
                contRows        :   contRows,
                blockRows       :   blockRows,
                itemsPerBlock   :   itemsPerBlock
            };
        },

        // Private method: Starts the request/response queue processing interval.
        _startQueues    :   function () {
            var that = this;
            this.intervals.queue = window.setInterval( function () {
                // Process queues as long as both have items.
                while ( that.reqQ.length > 0 && that.respQ.length > 0 ) {
                    var req = that.reqQ[ 0 ]; // Get the oldest request.

                    var matched = false;

                    // Responses might arrive out of order, so search for a match.
                    for ( var i = 0, l = that.respQ.length; i < l; i++ ) {
                        var resp = that.respQ[ i ]; // Current response.

                        // Check if the response matches the current request.
                        if ( req.start === resp.start &&
                            req.size === resp.liHtml.length ) { // Match found.
                            that.reqQ.shift(); // Remove request from queue.
                            that.respQ.splice( i, 1 ); // Remove response from queue.
                            that._handleResp( req, resp ); // Process the response.

                            matched = true;
                            break; // Exit inner loop, found match for current request.
                        }
                    }

                    if ( !matched ) break; // If no match for current request, wait for it.
                }
            }, this.opts.timers.queue );
        },

        // Private method: Wires up the custom response event handler.
        _wireRespEvent  :   function () {
            var that = this;
            this.jq.$elem.on( this.opts.events.resp, function ( e, d ) {
                // Validate the structure of the incoming response data.
                if ( typeof d.start !== 'number' ||
                    !d.liHtml || !( d.liHtml instanceof Array ) ||
                    ( d.liData && typeof d.liData !== 'object' ) ) {
                    throw new TypeError( "Malformed ScrollStream response type" );
                }

                that.respQ.push( d ); // Add valid response to the queue.
            } );
        },

        /*
         *   Main scroll feedback loop functionality.
         *   This method is called periodically by an interval timer.
         */
        _feedback   :   function () {
            // If neither scrolled nor resized, there's nothing to do.
            if ( !this.resized && !this.scrolled ) return;

            // Calculate the new number of "pre" rows based on current scroll position.
            var newPreRows = this._calcPre( Math.floor( this.jq.$context.scrollTop() /
                this.opts.item.height ) );

            // If not resized and preRows hasn't changed, reset scrolled flag and return.
            if ( !this.resized && newPreRows === this.preRows ) {
                this.scrolled = false;
                return;
            }

            // Adjust the height of the 'pre' spacer to reflect the new scroll position.
            this.jq.$pre.height( newPreRows * this.opts.item.height );

            var type, start, size, remove; // Variables for scroll modification request.

            var rowDelta = newPreRows - this.preRows; // Change in preRows.
            // If not resized and the change is within the block size, we can just shift items.
            if ( !this.resized && Math.abs( rowDelta ) < this.consts.blockRows ) {
                var remain = ( this.opts.item.count % this.consts.itemsPerRow ) !== 0; // Check for partial last row.

                if ( rowDelta < 0 ) {
                    type = 'up'; // Scrolling up: add to top, remove from bottom.

                    start = newPreRows * this.consts.itemsPerRow; // New starting index.
                    size = -rowDelta * this.consts.itemsPerRow; // Number of items to add.

                    // Special handling for partial last row when removing from bottom.
                    if ( ( this.preRows === this.consts.contRows -
                        this.consts.blockRows ) && remain ) {
                        remove = size - this.consts.itemsPerRow +
                            ( this.opts.item.count % this.consts.itemsPerRow );
                    } else {
                        remove = size; // Standard removal count.
                    }
                } else {
                    type = 'down'; // Scrolling down: add to bottom, remove from top.

                    start = this.consts.itemsPerRow *
                        ( this.preRows + this.consts.blockRows ); // New starting index for items to add.
                    remove = rowDelta * this.consts.itemsPerRow; // Number of items to remove.

                    // Special handling for partial last row when adding to bottom.
                    if ( ( newPreRows === this.consts.contRows -
                        this.consts.blockRows ) && remain ) {
                        size = remove - this.consts.itemsPerRow +
                            ( this.opts.item.count % this.consts.itemsPerRow );
                    } else {
                        size = remove; // Standard addition count.
                    }
                }
            } else {
                type = 'reload'; // Resized or scrolled significantly: full block reload.

                start = newPreRows * this.consts.itemsPerRow; // New starting index.
                remove = null; // Indicate a full reload, not a partial removal.

                // Handle potentially partial last row for block size.
                if ( start + this.consts.itemsPerBlock <= this.opts.item.count ) {
                    size = this.consts.itemsPerBlock;
                } else {
                    size = this.consts.itemsPerBlock - this.consts.itemsPerRow +
                        ( this.opts.item.count % this.consts.itemsPerRow );
                }
            }

            // Trigger the scroll handling logic with the determined parameters.
            this._handleScroll( type, start, size, remove, true );

            this.preRows = newPreRows; // Update the current number of pre-rows.

            this.scrolled = false; // Reset the scrolled flag.
            this.resized = false; // Reset the resized flag.
        },

        // Private method: Calculates the number of "pre" rows (spacer height) based on scroll position.
        _calcPre    :   function ( scrolledRows ) {
            // If total items fit within a single block, no pre-rows are needed.
            if ( this.opts.item.count <= this.consts.itemsPerBlock ) {
                return 0;
            }

            // If scrolled less than buffer, keep pre-rows at 0.
            if ( scrolledRows < this.opts.buffer ) {
                return 0;
            }
            // If within the scrollable range, adjust pre-rows by buffer.
            else if ( scrolledRows <
                this.consts.contRows - this.consts.blockRows + this.opts.buffer ) {
                return scrolledRows - this.opts.buffer;
            }
            // Otherwise, fix pre-rows to the maximum possible to keep block at bottom.
            else {
                return this.consts.contRows - this.consts.blockRows;
            }
        },

        // Timer ID for debouncing scroll events.
        debounceTimer   :   null,

        // Private method: Handles scroll requests, debouncing placeholder filling.
        _handleScroll   :   function ( type, start, size, remove, debounce ) {
            // Immediately modify the visible block with placeholders.
            this._modifyBlock( {
                type    :   type,
                start   :   start,
                size    :   size,
                remove  :   remove
            } );

            // If not debouncing (e.g., initial load), fill placeholders right away.
            if ( !debounce ) {
                this._fillPlaceholders();
                return;
            }

            // Clear any existing debounce timer.
            if ( this.debounceTimer ) {
                clearTimeout( this.debounceTimer );
            }
            var that = this;
            // Set a new debounce timer to fill placeholders after scrolling stops.
            this.debounceTimer = window.setTimeout( function () {
                return that._fillPlaceholders.apply( that );
            }, this.opts.timers.debounce );
        },

        // Private method: Identifies and requests data for placeholder runs.
        _fillPlaceholders   :   function () {
            var offset;
            var placeholders = []; // Array to store placeholder status.

            // Iterate over current list items to determine their state (placeholder or filled).
            var that = this;
            this.jq.$block.children().each( function ( i ) {
                // Get the starting index of the first item in the current block.
                if ( i === 0 ) {
                    offset = parseInt( $( this ).attr( 'id' )
                        .split( that.opts.name + '-id-' )[ 1 ], 10 );
                }
                // Check if the first child of the <li> is a loading placeholder.
                placeholders.push( $( this.firstChild )
                    .hasClass( that.opts.name + '-loading' ) );
            } );

            // Find continuous runs of placeholders.
            var runs = this._findRuns( placeholders );
            // For each run of placeholders, dispatch a data request.
            for ( var i = 0, l = runs.length; i < l; i++ ) {
                if ( runs[ i ].value !== true ) continue; // Only process runs of actual placeholders.

                var d = {
                    start   :   offset + runs[ i ].start, // Global start index for the run.
                    size    :   runs[ i ].count           // Number of items in this run.
                };

                this.reqQ.push( d ); // Add request to the queue.
                this.jq.$elem.trigger( this.opts.events.req, d ); // Trigger custom request event.
            }
        },

        // Private method: Finds consecutive runs of identical values in an array.
        _findRuns   :   function ( a ) {
            var segments = []; // Array to store the identified runs.

            var start, count, last;
            for ( var i = 0, l = a.length; i < l; i++ ) {
                if ( i === 0 ) {
                    start = 0;      // Start of the first run.
                    count = 1;      // Count of elements in the current run.
                    last = a[ i ];  // Value of the current run.
                } else if ( a[ i ] === last ) {
                    count++;        // Extend current run.
                } else {
                    // Current run ended, push it to segments.
                    segments.push( {
                        start   :   start,
                        count   :   count,
                        value   :   last
                    } );
                    start = i;      // Start of a new run.
                    count = 1;      // Reset count for new run.
                    last = a[ i ];  // New value for the run.
                }

                // If this is the last element, push the final run.
                if ( i === a.length - 1 ) {
                    segments.push( {
                        start   :   start,
                        count   :   count,
                        value   :   last
                    } );
                }
            }

            return segments; // Return all identified runs.
        },

        // Private method: Modifies the visible block by adding/removing placeholders.
        _modifyBlock    :   function ( req ) {
            var e = this.opts.events.start;
            if ( e ) this.jq.$elem.trigger( e ); // Trigger 'start' event if defined.

            // HTML for the loading placeholder.
            var marker = '<div class="' + this.opts.name + '-loading"></div>';
            // Custom loading content, if provided (function or string).
            var loading = ( typeof this.opts.loading === 'function' ) ?
                this.opts.loading() : '';

            var html = '';
            // Generate HTML for the requested number of items (placeholders).
            for ( var i = 0, l = req.size; i < l; i++ ) {
                var id = this.opts.name + '-id-' + ( req.start + i ); // Unique ID for each item.

                var c = this.opts.classes.li; // Optional class for list item.
                var li = c ? '<li id="' + id + '" class="' + c + '">' :
                    '<li id="' + id + '">'; // List item opening tag.
                li += marker + loading + '</li>'; // Add marker, loading content, and close tag.

                html += li; // Append to the generated HTML string.
            }

            // Debug logging for block modification.
            if ( this.opts.debug ) {
                console.log( "[" + req.type + "]" );
                console.log( "start+size:    " + req.start + "+" + req.size );
                console.log( "remove:        " + req.remove );
                console.log( "----------------------------------------" );
            }

            // Apply modifications based on the request type.
            switch ( req.type ) {
                case 'down':
                    // Append new items to the bottom, remove from the top.
                    this.jq.$block.append( html )
                        .children().slice( 0, req.remove ).remove();
                    break;
                case 'up':
                    // Prepend new items to the top, remove from the bottom.
                    this.jq.$block.prepend( html )
                        .children().slice( -req.remove ).remove();
                    break;
                case 'reload':
                    // Replace all existing items with new ones.
                    this.jq.$block.html( html );
                    break;
            }
        },

        // Private method: Handles a received data response and updates the DOM.
        _handleResp :   function ( req, resp ) {
            // IDs for the starting and ending elements of the requested range.
            var startId = this.opts.name + '-id-' + req.start;
            var untilId = this.opts.name + '-id-' + ( req.start + req.size );

            // Select the starting element and all subsequent siblings until the end ID.
            var $start = $( '#' + startId );
            var $elems = $start.add( $start.nextUntil( '#' + untilId ) );

            // Replace each placeholder with actual content.
            $elems.each( function ( i ) {
                var $this = $( this ).html( resp.liHtml[ i ] ); // Replace placeholder content.

                // Add optional data attributes to the element.
                if ( resp.liData && typeof resp.liData[ i ] === 'object' ) {
                    for ( var k in resp.liData[ i ] ) {
                        if ( resp.liData[ i ].hasOwnProperty( k ) ) {
                            $this.data( k, resp.liData[ i ][ k ] );
                        }
                    }
                }

                // Add optional CSS classes to the element.
                if ( resp.liClass && typeof resp.liClass[ i ] === 'string' ) {
                    $this.addClass( resp.liClass[ i ] );
                }
            } );

            var e = this.opts.events.stop;
            if ( e ) this.jq.$elem.trigger( e ); // Trigger 'stop' event if defined.
        },

        /*
         *   Public API methods for interacting with the ScrollStream instance.
         */

        // Public method: Returns the total height of the scrollable content.
        getHeight   :   function () {
            return this.consts.contRows * this.opts.item.height;
        },

        // Public method: Returns the number of items that fit horizontally in one row.
        getItemsPerRow  :   function () {
            return this.consts.itemsPerRow;
        },

        // Public method: Handles resize events by recalculating constants and queues.
        resize  :   function () {
            // Ignore resize if the stream hasn't been initialized yet.
            if ( !this.opts.item ) return;

            var newConsts = this._calcConsts(); // Recalculate constants.

            // If quantized amounts (itemsPerRow, blockRows) haven't changed, no need to resize.
            if ( newConsts.itemsPerRow === this.consts.itemsPerRow &&
                newConsts.blockRows === this.consts.blockRows ) return;

            // Clear pending requests and responses as the layout has changed.
            this.reqQ = [];
            this.respQ = [];
            // Set the resized flag to trigger a full block reload in the feedback loop.
            this.resized = true;
        }

    };

    // Attach the ScrollStream constructor to the jQuery object for plugin usage.
    $.ScrollStream = ScrollStream;

} )( jQuery, window ); // Pass jQuery, window, and undefined into the IIFE.