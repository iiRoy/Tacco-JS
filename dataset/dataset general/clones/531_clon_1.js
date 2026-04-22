/*******************************************************************************
 *
 * This code is subject to the following license terms:
 *
 * Copyright (c) 2011 Riccardo Govoni
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 ******************************************************************************/

// This jQuery plugin enhances selection capabilities, drawing inspiration from
// jQuery UI's 'selectable' but introducing several key improvements and
// different design choices.

// Key features include:
// 1.  **Flash Embed Compatibility**: Addresses issues where Flash embeds would
//     capture mouse events, preventing proper selection termination. This is
//     achieved by using transparent 'glass panels' that overlay Flash content
//     during selection.
// 2.  **Advanced Scrolling Support**: Automatically scrolls the document or
//     the selectable container when the selection box approaches viewport
//     boundaries. This allows for continuous selection gestures even when
//     elements are outside the current view.
//     The scrolling mechanism is pluggable, enabling custom scrolling
//     implementations (e.g., for endless scrolling scenarios).
// 3.  **Scrollbar Event Prevention**: Prevents inadvertent selection activation
//     when a mouse-down event occurs over scrollbars, a common issue in other
//     libraries.
// 4.  **Reduced Dependencies**: Operates directly on top of jQuery without
//     requiring the entire jQuery UI framework, potentially reducing overall
//     JavaScript payload.

// It's important to note that while similar in concept, this plugin is not a
// 100% drop-in replacement for jQuery UI 'selectable' due to several
// intentional differences:
// -   **Box-Selection Only**: Focuses exclusively on box-selection. Single-
//     element click selection must be handled externally.
// -   **No Non-Adjacent Multiple Selections**: Does not support selecting
//     multiple, non-contiguous elements.
// -   **Option Subset**: Not all jQuery UI 'selectable' options are supported
//     (e.g., 'delay', 'tolerance:fit', manual refresh management).
// -   **Event-Based Notification**: Only provides event-based notifications
//     (start, stop, change) rather than callback-based ones.
// -   **Aggregated Events**: Fires a single 'selected'/'unselected' event pair
//     at the end of a gesture, providing arrays of affected elements, unlike
//     jQuery UI which fires per-item events.
// -   **External Refresh Management**: Delegates element position refresh to
//     external functionality for finer control, allowing developers to manage
//     position tracking more efficiently.
// -   **Distinct Class Prefixes**: Uses different CSS class prefixes for
//     selectable states.

// For more information, detailed documentation, and live demos, please refer to
// the project's GitHub repository: http://github.com/battlehorse/jquery-xselectable

// This implements the Universal Module Definition (UMD) pattern, allowing the
// plugin to work with AMD (RequireJS) and as a browser global.
(function( factory ) {

    // Check for AMD environment.
    if ( typeof define === 'function' && define.amd ) {

        // AMD module registration.
        define( [ 'jquery' ], factory );

    } else {

        // Browser global registration.
        // Assumes jQuery is available globally.
        factory( jQuery );

    }

}(function( $ ) {

    // Define the plugin's name. This will be used for data storage and class prefixes.
    var pluginName = 'xselectable';

    /**
     * Default configuration options for the xselectable plugin.
     * These options can be customized during initialization or via the 'option' method.
     */
    var defaultOptions = {

        // The minimum distance (in pixels) the mouse must be dragged before
        // selection officially starts. This prevents accidental selections
        // when a user just clicks without intending to drag.
        distance: 0,

        // A boolean flag indicating whether the selectable behavior is currently
        // enabled or disabled. When disabled, selection gestures are ignored.
        disabled: false,

        // A jQuery selector string. If the mouse-down event originates on an
        // element matching this selector, the selection process will be
        // prevented. Useful for ignoring form inputs or other interactive elements.
        cancel: ':input,option',

        // A jQuery selector string used to filter which child elements within
        // the plugin's container are considered 'selectable'. Only elements
        // matching this selector can be selected.
        filter: '*',

        // The pixel distance from the scrolling viewport border that, when
        // the selection box enters it, will trigger automatic scrolling.
        scrollingThreshold: 100,

        // A multiplier to adjust the speed of automatic scrolling. A value
        // greater than 1 increases speed, less than 1 decreases it.
        scrollSpeedMultiplier: 1,

        // Custom scroller implementation. If `null`, the default scroller
        // (which combines document and content scrolling) is used.
        //
        // A custom scroller must be a function that accepts the plugin's
        // container element and returns an object implementing specific
        // methods: `getScrollableElement`, `getScrollableDistance`, `scroll`,
        // `getScrollOffset`, and `getScrollBorders`.
        //
        // The default scroller handles two scenarios:
        // 1.  Document scrolling: When the selection container exceeds the
        //     browser viewport, the entire window scrolls.
        // 2.  Content scrolling: When content within the selection container
        //     overflows, causing scrollbars, the container's content scrolls.
        // These can occur simultaneously, with document scrolling prioritized.
        scroller: null,

        // Custom positioner implementation. The positioner's role is to
        // calculate the exact position and dimensions of selectable elements
        // within the container.
        //
        // The default positioner uses `offsetTop`, `offsetLeft`, `offsetWidth`,
        // `offsetHeight`. This is accurate if the container is the offset parent
        // of the selectable elements. It also recomputes positions on each
        // selection start, which might be inefficient for many elements.
        //
        // A custom positioner can be provided to optimize this or handle
        // complex layouts. It must be a function that takes a selectable
        // element and returns an object with `top`, `left`, `width`, and
        // `height` properties (in pixels, relative to the selection container,
        // and representing outer dimensions including borders).
        positioner: null
    };

    /**
     * Implements a scroller that manages native document (browser window)
     * scrolling. This is activated when the selection container overflows
     * the browser viewport and the selection box approaches window borders.
     *
     * @param {!Element} el The DOM element to which the plugin is applied;
     *     this is the selection container.
     */
    var documentScroller = function( el ) {

        // Retrieve cached dimensions of the selection container from jQuery data.
        var containerDimensions = $( el ).data( pluginName ).containerDimensions;

        // Determine the browser window's current viewport width and height.
        // This accounts for differences in how browsers report these values.
        var width = typeof( window.innerWidth ) == 'number' ?
            window.innerWidth : document.documentElement.clientWidth;
        var height = typeof( window.innerHeight ) == 'number' ?
            window.innerHeight : document.documentElement.clientHeight;

        // Get the total scrollable width and height of the document.
        var documentWidth = document.documentElement.scrollWidth,
            documentHeight = document.documentElement.scrollHeight;

        /**
         * Returns the primary DOM element that this scroller directly manipulates
         * for scrolling. For the document scroller, this is typically `document.documentElement`.
         *
         * @return {!Element} The scrollable DOM element.
         */
        function getScrollableElement() {
            return document.documentElement;
        }

        /**
         * Calculates the positions of the viewport borders that should trigger
         * scrolling when the selection box is dragged near them.
         * These positions are relative to the top-left corner of the document.
         *
         * @return {!Array.<number>} An array containing the top, right, bottom,
         *     and left border positions, in that specific order.
         */
        function getScrollBorders() {

            // Get current scroll positions of the window.
            var scrollTop = typeof( window.pageYOffset ) == 'number' ?
                window.pageYOffset : document.documentElement.scrollTop;
            var scrollLeft = typeof( window.pageXOffset ) == 'number' ?
                window.pageXOffset : document.documentElement.scrollLeft;

            // Calculate and return the border coordinates.
            return [ scrollTop,
                     scrollLeft + width,
                     scrollTop + height,
                     scrollLeft ];
        }

        /**
         * Determines how much further the document can be scrolled in each
         * direction before hitting the boundaries of the selection container.
         * Scrolling stops once the entire selection container is in view.
         *
         * @return {!Array.<number>} An array of available scroll distances (in pixels)
         *     for top, right, bottom, and left directions, respectively.
         */
        function getScrollableDistances() {

            // Get current window scroll positions.
            var scrollTop = typeof( window.pageYOffset ) == 'number' ?
                window.pageYOffset : document.documentElement.scrollTop;
            var scrollLeft = typeof( window.pageXOffset ) == 'number' ?
                window.pageXOffset : document.documentElement.scrollLeft;

            // Calculate the remaining scroll distance for each border.
            // Ensure distance is non-negative.
            return [
                Math.max( scrollTop - containerDimensions.top, 0 ),
                Math.max(
                    containerDimensions.left + containerDimensions.width
                    - scrollLeft - width, 0 ),
                Math.max(
                    containerDimensions.top + containerDimensions.height
                    - scrollTop - height, 0 ),
                Math.max( scrollLeft - containerDimensions.left, 0 )
            ];
        }

        /**
         * Executes the actual scrolling action on the browser window.
         *
         * @param {string} scrollAxis The axis along which to scroll: 'vertical' or 'horizontal'.
         * @param {number} shift The amount (in pixels) to scroll. Positive for
         *     downward/rightward, negative for upward/leftward.
         */
        function scroll( scrollAxis, shift ) {
            if ( scrollAxis == 'vertical' ) {
                // Scroll vertically.
                window.scrollBy( 0, shift );
            } else {
                // Scroll horizontally.
                window.scrollBy( shift, 0 );
            }
        }

        /**
         * Returns an offset that should be applied to selectable elements'
         * positions to compensate for scrolling. For native browser scrolling,
         * this offset is typically zero as positions are already relative
         * to the document's scrolled state.
         *
         * @return {!Object.<string, number>} An object with 'top' and 'left'
         *     properties representing the scroll offset.
         */
        function getScrollOffset() {
            return { top: 0, left: 0 };
        }

        // Return the public interface of the documentScroller.
        return {
            getScrollableElement: getScrollableElement,
            getScrollBorders: getScrollBorders,
            getScrollableDistances: getScrollableDistances,
            scroll: scroll,
            getScrollOffset: getScrollOffset,

            // This scroller is chained to the contentScroller.
            // This means that once document scrolling reaches its limits,
            // the contentScroller will take over if applicable.
            next: contentScroller( el )
        };
    };

    /**
     * Implements a content scroller. This scroller handles scrolling within
     * the selection container itself, using native browser scrolling mechanisms
     * when the selection box nears the container's internal viewport borders
     * and the content within the container is overflowing.
     *
     * @param {!Element} el The selection container element.
     */
    var contentScroller = function( el ) {

        // Retrieve the cached dimensions of the selection container.
        var containerDimensions = $( el ).data( pluginName ).containerDimensions;

        /**
         * Calculates the remaining scrollable distance within the selection
         * container's viewport before reaching its content margins.
         *
         * @return {!Array.<number>} An array containing the available scroll
         *     distances (in pixels) for top, right, bottom, and left borders.
         */
        function getScrollableDistances() {
            // Calculate distances based on current scroll position,
            // scroll dimensions, and container dimensions.
            return [
                el.scrollTop,
                el.scrollWidth - el.scrollLeft - containerDimensions.width,
                el.scrollHeight - el.scrollTop - containerDimensions.height,
                el.scrollLeft
            ];
        }

        /**
         * Scrolls the selection container's viewport by the specified amount.
         *
         * @param {string} scrollAxis The axis to scroll: 'vertical' or 'horizontal'.
         * @param {number} shift The amount to scroll, in pixels. Positive for
         *     downward/rightward, negative for upward/leftward.
         */
        function scroll( scrollAxis, shift ) {
            // Determine which scroll property to update.
            var property = scrollAxis == 'vertical' ? 'scrollTop' : 'scrollLeft';
            // Apply the scroll shift.
            el[ property ] += shift;
        }

        /**
         * Returns the scroll offset that needs to be added to selectable
         * elements' positions. This is relevant for emulated scrolling
         * (e.g., Google Maps-style) where container offsets might change.
         * For native scrolling, this is typically {top: 0, left: 0}.
         *
         * @return {!Object.<string, number>} An object with 'top' and 'left'
         *     properties representing the scroll offset.
         */
        function getScrollOffset() {
            return { top: 0, left: 0 };
        }

        // Return the public interface for the contentScroller.
        return {
            getScrollableDistances: getScrollableDistances,
            scroll: scroll,
            getScrollOffset: getScrollOffset
        };
    };

    /**
     * Provides a default implementation for `getScrollableElement` if a custom
     * scroller doesn't specify one. It assumes the selection container itself
     * is the scrollable element.
     *
     * @return {!Element} The default scrollable DOM element.
     */
    var getDefaultScrollableElement = function() {
        // 'this' refers to the selection container element in this context.
        return this;
    };

    /**
     * Provides a default implementation for `getScrollBorders` if a custom
     * scroller doesn't specify one. It uses the selection container's own
     * borders as the scroll-triggering boundaries.
     *
     * @return {!Array.<number>} An array of top, right, bottom, and left
     *     border positions of the container, relative to the document.
     */
    var getDefaultScrollBorders = function() {
        // Retrieve cached container dimensions.
        var containerDimensions = $( this ).data( pluginName ).containerDimensions;
        // Return the container's absolute border positions.
        return [
            containerDimensions.top,
            containerDimensions.left + containerDimensions.width,
            containerDimensions.top + containerDimensions.height,
            containerDimensions.left
        ];
    };

    /**
     * The default positioner function. It calculates the position and dimensions
     * of a selectable element relative to its offset parent (which is expected
     * to be the selection container for accurate results).
     *
     * @param {!Element} selectable The individual element that is selectable.
     * @return {!Object.<string, number>} An object containing the 'top', 'left',
     *     'width', and 'height' properties of the selectable element.
     *     'top' and 'left' are relative to the selection container.
     *     'width' and 'height' include padding and border but not margin.
     */
    var defaultPositioner = function( selectable ) {
        return {
            'top': selectable.offsetTop,        // Distance from parent's top.
            'left': selectable.offsetLeft,      // Distance from parent's left.
            'width': selectable.offsetWidth,    // Outer width including padding and border.
            'height': selectable.offsetHeight   // Outer height including padding and border.
        };
    };

    /**
     * A utility function to determine the sign of a number.
     * Returns 1 for positive, -1 for negative, and 0 for zero.
     *
     * @param {number} i The input number.
     * @return {number} The sign of the number.
     */
    var sign = function( i ) {
        return i > 0 ? 1 : i < 0 ? -1 : 0;
    };

    /**
     * Creates and initializes the selection box element and a 'glass panel'
     * overlay. The glass panel is crucial for ensuring that mouse events
     * during selection are not swallowed by Flash embeds or other elements.
     * It's appended to the selection container.
     */
    var createSelectionBox = function() {
        // Get the jQuery object for the container and its plugin data.
        var $this = $( this ),
            data = $this.data( pluginName );

        // Create the transparent 'glass panel' overlay.
        // This panel covers the entire scrollable area of the container.
        data.selectionGlass = $( '<div />', { 'class': pluginName + '-glass' } ).css( {
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'height': this.scrollHeight, // Covers full scrollable height.
            'width': this.scrollWidth,   // Covers full scrollable width.
            'overflow': 'hidden'         // Prevents scrollbars on the glass.
        } ).appendTo( $this );

        // Create the actual selection box (the visible drag rectangle).
        // This box is appended to the glass panel, making it appear on top.
        data.selectionBox = $( '<div />', { 'class': pluginName + '-box' } ).css( {
            'position': 'absolute' // Positioned relative to the glass panel.
        } ).appendTo( data.selectionGlass );
    };

    /**
     * Initializes all potential selectable elements when a new selection
     * gesture begins. This involves:
     * - Caching their current positions and dimensions.
     * - Marking them as not selected initially.
     * - Removing any previous 'selected' visual states.
     */
    var initSelectablesOnGestureStart = function() {
        var self = this,
            $this = $( this ),
            data = $this.data( pluginName );

        var selectables = []; // Array to store processed selectable objects.

        // Iterate over all elements matching the 'filter' option within the container.
        $this.find( data.options.filter ).each( function() {
            // Use the custom positioner (if provided) or the default one
            // to get element's position and dimensions.
            var selectable =
                ( data.options.positioner || defaultPositioner ).call( self, this );
            selectable.element = this;      // Store a reference to the DOM element.
            selectable.selected = false;    // Initialize as not selected.
            selectables.push( selectable ); // Add to the collection.
        } ).removeClass( pluginName + '-selected' ); // Clear visual selection from previous gestures.

        data.selectables = selectables; // Store the initialized selectables in plugin data.
    };

    /**
     * Updates the position and size of the visual selection box
     * based on the mouse's current position relative to the
     * starting point of the selection gesture.
     *
     * @param {!Event} evt The mousemove event object.
     */
    var updateSelectionBox = function( evt ) {
        var data = $( this ).data( pluginName );

        // Calculate the extents (top, left, height, width) of the selection box.
        // pageX/pageY are document-relative; adjust for container's position
        // and its current scroll.
        data.selectionBoxExtents = {
            'top':
                Math.min( data.startPosition.pageY, evt.pageY ) -
                data.containerDimensions.top +
                this.scrollTop,
            'left':
                Math.min( data.startPosition.pageX, evt.pageX ) -
                data.containerDimensions.left +
                this.scrollLeft,
            'height': Math.abs( data.startPosition.pageY - evt.pageY ),
            'width': Math.abs( data.startPosition.pageX - evt.pageX )
        };

        // Apply the calculated extents as CSS styles to the selection box element.
        data.selectionBox.css( data.selectionBoxExtents );
    };

    /**
     * Manages automatic scrolling of the viewport (either the document or
     * the selection container) if the selection box is dragged close to
     * its borders. This function recursively calls itself or the next scroller
     * in the chain until scrolling limits are hit or no further scrollers exist.
     *
     * @param {!Event} evt The most recent mousemove event.
     * @param {!Object} scroller The current scroller implementation to use
     *     (e.g., `documentScroller` or `contentScroller`).
     * @param {number | undefined} scrollTimestamp The timestamp of the last
     *     scroll operation. Undefined if a mouse movement occurred since.
     */
    var updateViewportScrolling = function( evt, scroller, scrollTimestamp ) {
        var $this = $( this ),
            data = $this.data( pluginName ),
            containerDimensions = data.containerDimensions,
            threshold = data.options.scrollingThreshold,