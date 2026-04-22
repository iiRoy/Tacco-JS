/*
  Copyright (c) 2024 New Author

  This software is provided under the terms of the MIT License.

  Permission is granted, free of charge, to any individual obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit individuals to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
 * A jQuery-based extension that emulates the behavior of jQuery UI 'selection'
 * functionality (see http://jqueryui.com/demos/selectable/) with notable enhancements:
 *
 * - Selection operates seamlessly over embedded Flash content. Flash objects typically
 *   absorb mouse events, preventing selection gestures from completing if the mouse
 *   is released within a Flash area. This plugin resolves this by interposing a
 *   transparent overlay between the selection rectangle and target elements.
 *
 * - Integrated scrolling capability. When the container for selectable items extends
 *   beyond the window's visible area, or when the items themselves cause scrollbars
 *   to appear on the container, dragging the selection box near the viewport edges
 *   will automatically scroll the relevant view (either the document or the container).
 *   This allows the selection action to continue until the scroll limits are met.
 *   The scrolling mechanism is modular, supporting various implementations
 *   (beyond the default browser-native scrolling). For instance, an infinite
 *   scrolling behavior similar to Google Maps can be readily implemented.
 *
 * - Selection initiation is prevented if the mouse-down event occurs on scrollbars.
 *   This addresses a common usability issue.
 *
 * - This extension does not depend on the broader jQuery UI framework, allowing
 *   it to be used directly with only jQuery, potentially reducing the overall
 *   JavaScript footprint on the host page.
 *
 * The operational semantics of this plugin are similar to jQuery UI 'selectable',
 * but not identical. While it offers a viable alternative, it's not a direct
 * drop-in replacement due to several distinctions:
 *
 * - This plugin focuses solely on rectangular box-based selection. Individual
 *   item selection via direct clicks must be handled externally.
 *
 * - Disconnected, non-contiguous selections are not supported.
 *
 * - Not all options available in jQuery UI 'selectable' are implemented here
 *   — e.g., 'delay', 'tolerance:fit', and automatic refresh management.
 *
 * - Only event-driven notifications for plugin actions (selection start/end,
 *   changes in selected items) are provided. Callback-based notifications are
 *   not supported.
 *
 * - A single pair of 'chosen' and 'unchosen' events is dispatched upon
 *   completion of the selection gesture. These events carry arrays of all
 *   chosen and unchosen elements, respectively (unlike jQuery UI, which
 *   might fire separate events per item).
 *
 * - Manual refresh of item positions is delegated to external code for greater
 *   control: the developer is responsible for tracking item positions (in
 *   contrast to jQuery UI, which only offers a bulk refresh option).
 *
 * - Distinct CSS class prefixes are used for indicating item statuses.
 *
 * For additional information, documentation, and live examples, please refer
 * to http://github.com/battlehorse/jquery-xselectable.
 */

// Universal Module Definition (UMD) pattern for RequireJS compatibility.
(function ( moduleProducer ) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD module registration
        define( [ 'jquery' ], moduleProducer );
    } else {
        // Browser global exposure
        moduleProducer( jQuery );
    }
} ( function ( jq ) {

  const areaSelector = 'xselectable';

  /**
   * Default operational configuration parameters. These can be adjusted during
   * plugin instantiation or later via the 'configure' method.
   */
  const standardSettings = {

    // Minimum pixel distance the mouse must be dragged before selection begins.
    // If set, selection will not activate until this threshold is exceeded.
    minDragPx: 0,

    // Controls whether the selection functionality is active or not.
    inactive: false,

    // A CSS selector to specify elements that will prevent selection initiation
    // if the drag gesture starts on them.
    blockStartOn: ':input,option',

    // A CSS selector to identify child elements within the container that can
    // be selected.
    targetElements: '*',

    // The minimum distance, in pixels, from the edge of the scrollable viewport
    // that should trigger automatic scrolling.
    scrollTriggerMargin: 100,

    // A scaling factor to adjust the speed of automatic scrolling.
    scrollPaceFactor: 1,

    // An optional, custom implementation for scrolling behavior. If null,
    // the system's default scroller is utilized.
    //
    // The built-in scroller uses native browser scrolling and addresses two
    // distinct scenarios (potentially concurrently):
    // - If the selection container exceeds the browser window's visible area:
    //   the browser window scrolls to allow the selection box to expand
    //   up to the container's boundaries.
    // - If the selectable content within the container exceeds its own visible
    //   area (resulting in scrollbars): the container's content scrolls to
    //   permit the selection box to extend up to the content's boundaries.
    // Both situations can occur simultaneously; in such cases, the former
    // is processed before the latter.
    //
    // If provided, this must be a function that accepts the DOM element
    // to which the plugin is applied and returns an object exposing the
    // required scroller methods (e.g., fetchScrollableTarget,
    // calcRemainingScrollRange, performScrollOperation, acquireScrollCompensation,
    // retrieveScrollBoundaryCoords). Refer to 'elementAreaMover' for method details.
    customScroller: null,

    // An optional, custom implementation for calculating element positions.
    // The positioner is responsible for determining the coordinates of
    // selectable items when a selection gesture begins, which is crucial
    // for accurately detecting when the selection box intersects an item.
    //
    // The default implementation calculates item positions using `offset`
    // measurements. This method is accurate if the plugin's host element
    // (the selection container) acts as the offset parent for the items.
    //
    // The default approach recalculates item positions every time a selection
    // gesture starts. This might be inefficient if there are many selectable
    // elements.
    //
    // Custom implementations can be provided to overcome these limitations.
    // If supplied, it must be a function that accepts a selectable element
    // (i.e., any element matching the 'targetElements' option) and returns
    // an object with 'top', 'left', 'width', and 'height' properties.
    //
    // 'top' and 'left' should specify the distance, in pixels, from the
    // top-left corner of the selectable item to the top-left corner of the
    // selection container, accurate at the time of the call. 'width' and
    // 'height' should represent the outer width and height (including border,
    // but excluding margin) of the selectable item.
    customPosCalculator: null
  };

  /**
   * A scroller module to manage native document (browser window) scrolling
   * when the selection container overflows the viewport. It activates when
   * the selection box approaches the browser window's edges.
   *
   * @param {!Element} hostElement The selection container, i.e., the element
   *     where the plugin is initialized.
   */
  const globalViewportMover = function( hostElement ) {

    // Cached dimensions of the selection container
    const hostBounds = jq( hostElement ).data( areaSelector ).hostBounds;

    // Dimensions of the browser's visible viewport
    const viewportWidth = typeof( window.innerWidth ) === 'number' ?
        window.innerWidth : document.documentElement.clientWidth;
    const viewportHeight = typeof( window.innerHeight ) === 'number' ?
        window.innerHeight : document.documentElement.clientHeight;

    // Overall dimensions of the document
    const overallDocWidth = document.documentElement.scrollWidth,
          overallDocHeight = document.documentElement.scrollHeight;

    /**
     * @return {!Element} The DOM element that is scrolled when this scroller
     *     is active. For this scroller, it's typically the documentElement or body.
     */
    function fetchScrollableTarget ( ) {
      return document.documentElement;
    }

    /**
     * Retrieves the top, right, bottom, and left coordinates of the viewport
     * boundaries that should trigger scrolling when the selection rectangle
     * is dragged near them.
     *
     * @return {!Array.<number>} Positions of the scrollable viewport borders,
     *     in the order: top, right, bottom, left. All coordinates are relative
     *     to the document's top-left origin.
     */
    function retrieveScrollBoundaryCoords ( ) {
      const currentScrollTop = typeof( window.pageYOffset ) === 'number' ?
          window.pageYOffset : document.documentElement.scrollTop;
      const currentScrollLeft = typeof( window.pageXOffset ) === 'number' ?
          window.pageXOffset : document.documentElement.scrollLeft;

      return [ currentScrollTop, currentScrollLeft + viewportWidth, currentScrollTop + viewportHeight, currentScrollLeft ];
    }

    /**
     * Determines the remaining scrollable distance for the viewport before
     * it reaches the selection container's margins. Even if the document could
     * scroll further, dragging the selection box does not cause additional
     * scrolling once the container's margins are visible.
     *
     * @return {!Array.<number>} Available scrolling distances (in pixels),
     *     from the top, right, bottom, and left margins, respectively.
     */
    function calcRemainingScrollRange ( ) {
      const currentScrollTop = typeof( window.pageYOffset ) === 'number' ?
          window.pageYOffset : document.documentElement.scrollTop;
      const currentScrollLeft = typeof( window.pageXOffset ) === 'number' ?
          window.pageXOffset : document.documentElement.scrollLeft;
      return [
          Math.max( currentScrollTop - hostBounds.top, 0 ),
          Math.max(
              hostBounds.left + hostBounds.width
              - currentScrollLeft - viewportWidth, 0 ),
          Math.max(
              hostBounds.top + hostBounds.height
              - currentScrollTop - viewportHeight, 0 ),
          Math.max( currentScrollLeft - hostBounds.left, 0 )
      ];
    }

    /**
     * Executes scrolling of the browser window viewport by the specified amount.
     *
     * @param {string} axis The scrolling direction, either 'vertical' or
     *     'horizontal'.
     * @param {number} scrollAmount The magnitude of scrolling, in pixels. A
     *     positive value means downward / rightward; a negative value means
     *     upward / leftward.
     */
    function performScrollOperation ( axis, scrollAmount ) {
      if ( axis === 'vertical' ) {
        window.scrollBy( 0, scrollAmount );
      } else {
        window.scrollBy( scrollAmount, 0 );
      }
    }

    /**
     * Provides the offset, in pixels, that should be added to the positions of
     * selectable elements (as calculated by the plugin's 'customPosCalculator')
     * to account for scrolling. This is typically irrelevant when native browser
     * scrolling is active.
     *
     * @return {!Object.<string, number>} An object containing 'top' and 'left'
     *     properties, indicating the respective offsets to apply.
     */
    function acquireScrollCompensation ( ) {
      return { top: 0, left: 0 };
    }

    return {
      fetchScrollableTarget: fetchScrollableTarget,
      retrieveScrollBoundaryCoords: retrieveScrollBoundaryCoords,
      calcRemainingScrollRange: calcRemainingScrollRange,
      performScrollOperation: performScrollOperation,
      acquireScrollCompensation: acquireScrollCompensation,

      // Links this scroller to the elementAreaMover, ensuring it takes over
      // once document-level scrolling has completed.
      subsequent: elementAreaMover( hostElement )
    };
  };

  /**
   * Element area scroller. This component scrolls the selection container's
   * viewport using native browser scrolling mechanisms when the selection box
   * approaches the viewport borders and the selectable content overflows
   * the container's visible area.
   *
   * @param {!Element} hostElement The selection container, i.e., the element
   *     where the plugin is initialized.
   */
  const elementAreaMover = function( hostElement ) {

    const hostBounds = jq( hostElement ).data( areaSelector ).hostBounds;

    /**
     * Calculates the available distance the selection container's viewport can
     * still be scrolled before hitting its internal margins.
     *
     * @return {!Array.<number>} Available scrolling distances, respectively
     *     from the top, right, bottom, and left borders.
     */
    function calcRemainingScrollRange ( ) {
      return [
        hostElement.scrollTop,
        hostElement.scrollWidth - hostElement.scrollLeft - hostBounds.width,
        hostElement.scrollHeight - hostElement.scrollTop - hostBounds.height,
        hostElement.scrollLeft
      ];
    }

    /**
     * Scrolls the selection container's viewport by the specified amount.
     *
     * @param {string} axis The scrolling direction, either 'vertical' or
     *     'horizontal'.
     * @param {number} scrollAmount The magnitude of scrolling, in pixels. A
     *     positive value means downward / rightward; a negative value means
     *     upward / leftward.
     */
    function performScrollOperation ( axis, scrollAmount ) {
      const scrollProp = axis === 'vertical' ? 'scrollTop' : 'scrollLeft';
      hostElement[ scrollProp ] += scrollAmount;
    }

    /**
     * Provides the offset, in pixels, that should be added to the positions of
     * selectable elements (as calculated by the plugin's 'customPosCalculator')
     * to account for scrolling.
     *
     * This is not relevant for native browser scrolling but becomes important
     * when scrolling is simulated via container offsets (e.g., for Google
     * Maps-style scrolling).
     *
     * @return {!Object.<string, number>} An object containing 'top' and 'left'
     *     properties, indicating the respective offsets to apply.
     */
    function acquireScrollCompensation ( ) {
      return { top: 0, left: 0 };
    }

    return {
      calcRemainingScrollRange: calcRemainingScrollRange,
      performScrollOperation: performScrollOperation,
      acquireScrollCompensation: acquireScrollCompensation
    };
  };

  /**
   * @return {!Element} The default DOM element assumed to be scrolled when
   *     this scroller is active, if the scroller doesn't specify one via its
   *     'fetchScrollableTarget' method. By default, this is the selection
   *     container itself.
   */
  const fetchDefaultScrollTarget = function ( ) {
    return this;
  };

  /**
   * Returns the default top, right, bottom, and left coordinates of the
   * viewport borders that should trigger scrolling when the selection box
   * is dragged near them, if the scroller does not provide this via its
   * 'retrieveScrollBoundaryCoords' method.
   *
   * @return {!Array.<number>} Positions of the scrollable viewport borders,
   *     in the order: top, right, bottom, left. All coordinates are relative
   *     to the document's top-left origin. The default values are the border
   *     positions of the selection container itself.
   */
  const fetchDefaultScrollBoundaries = function ( ) {
    const hostBounds = jq( this ).data( areaSelector ).hostBounds;
    return [
        hostBounds.top,
        hostBounds.left + hostBounds.width,
        hostBounds.top + hostBounds.height,
        hostBounds.left
    ];
  };

  /**
   * The default position calculator. It determines the positions of selectable
   * elements, which is essential for identifying selected items as the
   * selection box is moved.
   *
   * This default implementation calculates item positions using `offset`
   * measurements. This method is accurate if the plugin's host element
   * (the selection container) acts as the offset parent for the items.
   *
   * @param {!Element} itemToPlace A selectable element, i.e., any element
   *     matching the plugin's 'targetElements' option.
   * @return {!Object.<string, number>} An object containing 'top', 'left',
   *     'width', and 'height' properties. 'top' and 'left' specify the
   *     distance, in pixels, from the top-left corner of the item to the
   *     top-left corner of the selection container, accurate at the time of
   *     the call. 'width' and 'height' represent the outer width and height
   *     (including border, but excluding margin) of the selectable item.
   */
  const standardPosCalculator = function ( itemToPlace ) {
    return {
      'top': itemToPlace.offsetTop,
      'left': itemToPlace.offsetLeft,
      'width': itemToPlace.offsetWidth,
      'height': itemToPlace.offsetHeight
    };
  };

  const getDirection = function ( val ) {
    return val > 0 ? 1 : val < 0 ? -1 : 0;
  };

  /**
   * Constructs the visual selection rectangle and the transparent overlay
   * panel that insulates selectable elements from selection gesture events.
   * This is necessary to prevent Flash objects from capturing mouseup events
   * for selections that conclude over them.
   */
  const buildSelectionOverlay = function ( ) {
    const $currentHost = jq( this ),
          hostState = $currentHost.data( areaSelector );

    hostState.overlayPane = jq(
      '<div />', { 'class': areaSelector + '-cover' } ).css( {
      'position': 'absolute',
      'top': 0,
      'left': 0,
      'height': this.scrollHeight,
      'width': this.scrollWidth,
      'overflow': 'hidden'
      } ).appendTo( $currentHost );
    hostState.activeBox = jq(
      '<div />', { 'class': areaSelector + '-frame' } ).css( {
      'position': 'absolute'
      } ).appendTo( hostState.overlayPane );
  };

  /**
   * Prepares all selectable elements when a selection gesture begins. This
   * involves caching their current positions and clearing any previous selections.
   */
  const initializeItemsOnDragStart = function ( ) {
    const contextRef = this,
          $currentHost = jq( this ),
          hostState = $currentHost.data( areaSelector );

    const selectableItems = [ ];
    $currentHost.find( hostState.config.targetElements ).each( function ( ) {
      const currentItem =
        ( hostState.config.customPosCalculator || standardPosCalculator ).call( contextRef, this );
      currentItem.domElement = this;
      currentItem.isChosen = false;
      selectableItems.push( currentItem );
    } ).removeClass( areaSelector + '-highlighted' );
    hostState.selectableItems = selectableItems;
  };

  /**
   * Adjusts the position and dimensions of the selection box to reflect the
   * distance covered from the initial drag point to the current mouse position.
   */
  const adjustBoundingBox = function ( event ) {
    const hostState = jq( this ).data( areaSelector );
    hostState.currentBoxGeometry = {
      // pageX, pageY coordinates are relative to the document. They must be
      // transformed to the selection container's coordinate system.
      'top':
          Math.min( hostState.initialPoint.pageY, event.pageY ) -
          hostState.hostBounds.top +
          this.scrollTop,
      'left':
          Math.min( hostState.initialPoint.pageX, event.pageX ) -
          hostState.hostBounds.left +
          this.scrollLeft,
      'height': Math.abs( hostState.initialPoint.pageY - event.pageY ),
      'width': Math.abs( hostState.initialPoint.pageX - event.pageX )
    };
    hostState.activeBox.css( hostState.currentBoxGeometry );
  };

  /**
   * Activates scrolling of the selection container's viewport if the selection
   * box is being dragged too close to the viewport's edges.
   *
   * @param {!Event} eventObj The most recent mousemove event received.
   * @param {!Object} currentScroller A scroller implementation, such as
   *     'globalViewportMover' or 'elementAreaMover'.
   * @param {number?} lastScrollTime The timestamp of the last scrolling
   *     operation. Undefined if a mouse movement has occurred since.
   */
  const manageViewportScroll = function ( eventObj, currentScroller, lastScrollTime ) {
    const $hostElement = jq( this ),
          hostState = $hostElement.data( areaSelector ),
          hostBounds = hostState.hostBounds,
          scrollTriggerMargin = hostState.config.scrollTriggerMargin,
          scrollPaceFactor = hostState.config.scrollPaceFactor;