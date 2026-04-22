( function ($) {

  // Enforce strict mode for cleaner code and fewer errors.
  'use strict';


  /*
   * Defines a set of event names used throughout the sortable functionality.
   * These events abstract away browser differences for drag operations.
   */
  var events = {
    drag      : 'mousemove touchmove',
    dragstart : 'mousedown touchstart',
    dragend   : 'mouseup touchend',
    selectstart : 'selectstart'
  };


  /*
   * Defines CSS class names used for various elements within the sortable component.
   * These classes are later suffixed with an ID to ensure uniqueness.
   */
  var classes = {
    sorting    : 'sortable-sorting',
    item       : 'sortable-item',
    handle     : 'sortable-handle',
    clone      : 'sortable-clone',
    active     : 'sortable-activeitem'
  };


  // Cache the jQuery body element for frequent use.
  var $body = $(document.body);

  // Debounce time in milliseconds for drag detection.
  var debounceMs = 2;


  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing.
   *
   * @param {Function} fn The function to debounce.
   * @param {number} wait The number of milliseconds to wait.
   * @param {boolean} [immediate] If true, trigger on the leading edge.
   * @returns {Function} The debounced function.
   */
  function debounce(fn, wait, immediate) {
    var timeout; // Holds the timeout ID.

    return function () {
      var context = this, // Store the 'this' context.
          args    = arguments; // Store the arguments passed to the function.

      // This function will be called after the wait period.
      var later = function () {
        timeout = null; // Clear the timeout ID.
        if ( !immediate ) {
          fn.apply(context, args); // Execute the function if not immediate.
        }
      };

      // Determine if the function should be called immediately.
      var callNow = immediate && !timeout;

      // Clear any existing timeout to reset the debounce timer.
      clearTimeout(timeout);

      // Set a new timeout.
      timeout = setTimeout(later, wait);

      // Call immediately if `callNow` is true.
      if ( callNow ) {
        fn.apply(context, args);
      }
    };
  }


  /**
   * Sortable constructor function.
   * Initializes a new sortable instance on a given element.
   *
   * @param {HTMLElement} element The DOM element to make sortable.
   * @param {Object} options Configuration options for the sortable instance.
   * @constructor
   */
  function Sortable(element, options) {
    // Extend default options with user-provided options.
    this.options = $.extend({
      items       : '.sortable', // Selector for sortable items within the element.
      handles     : null,        // Selector for drag handles within items.
      zindex      : '9000',      // Z-index for the dragged clone element.
      dragX       : true,        // Enable horizontal dragging.
      dragY       : true,        // Enable vertical dragging.
      onChange    : null,        // Callback for when item order changes.
      onDragstart : null,        // Callback for when dragging starts.
      onDrag      : null,        // Callback for when an item is being dragged.
      onDragend   : null         // Callback for when dragging ends.
    }, options);


    // Get a unique ID from the element's scope for class name generation.
    var id = element.scope().$id;

    // Generate unique class names for this sortable instance.
    this.classes = {};
    for ( var key in classes ) {
      this.classes[key] = classes[key] + '-' + id;
    }

    // Initialize delta values for drag positioning.
    this.deltaX = 0;
    this.deltaY = 0;

    // State variables for the sortable instance.
    this.enabled      = null;        // Is the sortable enabled?
    this.state        = null;        // Holds the last drag event state.
    this.$element     = $(element);  // jQuery wrapped sortable container.
    this.$activeItem  = null;        // The currently active (dragged) item.

    // Perform an initial refresh to set up event handlers.
    this.refresh();
  }


  /**
   * Enables or disables the sortable functionality.
   * @param {boolean} enabled True to enable, false to disable.
   */
  Sortable.prototype.enable = function (enabled) {
    this.enabled = enabled;
  };


  /**
   * Cleans up event handlers and attributes set by the sortable instance.
   * This is typically called when the sortable is destroyed or refreshed.
   */
  Sortable.prototype.cleanup = function () {
    // Restore original unselectable attribute on body and remove global drag events.
    $body.attr('unselectable', this.bodyUnselectable)
         .off(events.dragend)
         .off(events.drag)
         .off(events.selectstart);

    // Remove dragstart handlers from sortable items.
    this.getItems().off(events.dragstart);
  };


  /**
   * Retrieves all sortable items within the sortable container.
   * @returns {jQuery} A jQuery collection of sortable items.
   */
  Sortable.prototype.getItems = function () {
    return $(this.options.items, this.$element);
  };


  /**
   * Refreshes the sortable instance, re-applying event handlers and classes.
   * This should be called if items are added or removed dynamically.
   */
  Sortable.prototype.refresh = function () {
    // First, clean up any existing handlers.
    this.cleanup();

    var self   = this;         // Store reference to 'this' for callbacks.
    var $items = this.getItems(); // Get all current sortable items.

    /*
     * Add the unique item class to all sortable elements.
     * This ensures consistent identification, independent of the client's selector.
     */
    $items.addClass(self.classes.item);

    // Make items unselectable during drag to prevent text selection issues.
    $items.attr('unselectable', 'on');

    // If the sortable is enabled, bind dragstart events.
    if ( this.enabled ) {
      // Only bind if no item is currently active (being dragged).
      if ( !this.$activeItem ) {
        $items.bind(events.dragstart, function (e) {
          // Unbind immediately to prevent multiple dragstarts during a single drag operation.
          $items.unbind(e);
          self.dragstart(e); // Initiate the drag operation.
        });
      }
    }
  };


  /**
   * Debounced function to detect changes in item position during a drag operation.
   * It determines if a dragged item has moved past another item's boundary
   * and triggers the onChange callback if so.
   *
   * @param {Sortable} context The Sortable instance.
   * @param {Event} event The current drag event.
   */
  var detect = debounce(function (context, event) {

    var $items = context.getItems(); // Get all sortable items.

    // Caching variables before the loop for performance.
    var from = 0,
        to   = $items.length;
    var item;

    // Get current position of the dragged clone.
    var top  = parseInt(context.$dragElement.css('top'), 10);
    var left = parseInt(context.$dragElement.css('left'), 10);

    // Calculate the delta from the initial drag position.
    var deltaX = left - context.left;
    var deltaY = top - context.top;

    // Optimize the loop range based on drag direction (X or Y).
    if ( !context.options.dragX ) { // Only Y-axis dragging.
      if ( deltaY > 0 ) {
        from = context.draggingIdx + 1; // Dragging downwards, check items below.
      } else if ( deltaY < 0 ) {
        to = context.draggingIdx;     // Dragging upwards, check items above.
      } else {
        return; // No vertical movement, no change.
      }
    } else if ( !context.options.dragY ) { // Only X-axis dragging.
      if ( deltaX > 0 ) {
        from = context.draggingIdx + 1; // Dragging right, check items to the right.
      } else if ( deltaX < 0 ) {
        to = context.draggingIdx;     // Dragging left, check items to the left.
      } else {
        return; // No horizontal movement, no change.
      }
    }

    // Iterate through relevant items to detect position change.
    for ( ; from < to; from++ ) {
      item = $items[from]; // Current item in the loop.

      if ( from === context.draggingIdx ) {
        continue; // Skip the item being dragged itself.
      }

      // Check for overlap based on drag direction.
      if ( (context.options.dragY &&
            top > item.offsetTop &&
            top < item.offsetTop + item.offsetHeight) ||
           (context.options.dragX &&
            left > item.offsetLeft &&
            left < item.offsetLeft + item.offsetWidth) ) {
        // Position changed, trigger callback.
        context.options.onChange(context.draggingIdx, from);
        context.draggingIdx = from; // Update the index of the dragged item.
        context.dragged     = true; // Mark as dragged.
        context.left        = left; // Update initial left for next delta calculation.
        context.top         = top;  // Update initial top for next delta calculation.
        break; // A change was detected and handled, exit loop.
      }
    }

  }, debounceMs); // Apply the debounce with the configured delay.


  /**
   * Handles the 'drag' event (mousemove/touchmove).
   * Updates the position of the cloned drag element and detects item reordering.
   *
   * @param {Event} event The drag event object.
   */
  Sortable.prototype.drag = function (event) {
    // If propagation was stopped, do nothing.
    if ( event.isPropagationStopped() ) {
      return;
    }

    // Call the user-defined onDrag callback.
    this.options.onDrag(event);

    // Update vertical position if dragY is enabled.
    if ( this.options.dragY ) {
      this.$dragElement.css('top', '+=' + (event.clientY - this.state.clientY));
    }
    // Update horizontal position if dragX is enabled.
    if ( this.options.dragX ) {
      this.$dragElement.css('left', '+=' + (event.clientX - this.state.clientX));
    }

    // Detect if the item has moved past another item.
    detect(this, event);

    // Store the current event as the new state for the next delta calculation.
    this.state = event;
  };


  /**
   * Handles the 'dragstart' event (mousedown/touchstart).
   * Initializes the drag operation, creates a clone, and sets up global event listeners.
   *
   * @param {Event} event The dragstart event object.
   */
  Sortable.prototype.dragstart = function (event) {
    // Ensure only left-click or touchstart triggers drag, and propagation isn't stopped.
    if ( event.which !== 1 || event.isPropagationStopped() ) {
      return;
    }

    var self    = this;              // Store 'this' context.
    this.dragged = false;            // Reset dragged flag.
    var $target = $(event.target);   // The element that triggered the event.
    var $items  = this.getItems();   // All sortable items.

    // If handles are specified, ensure the event target is within a handle.
    if ( this.options.handles ) {
      // Mark all handles with a specific class for easier detection.
      if ( this.options.handles ) {
        $items.find(this.options.handles).addClass(this.classes.handle);
      }
      // If the target is not a handle, prevent dragstart.
      if ( !$target.closest('.' + this.classes.handle).length ) {
        return;
      }
    }

    // Call the user-defined onDragstart callback.
    this.options.onDragstart(event);

    // Adjust event.target to be the actual sortable item, not a child.
    event.target = (function () {
      if ( $target.hasClass(self.classes.item) ) {
        return event.target; // Target is already the item.
      }
      else {
        // Find the closest parent that is a sortable item.
        return $target.closest('.' + self.classes.item)[0];
      }
    })();

    // Store original body unselectable state and set it to 'on' to prevent text selection.
    self.bodyUnselectable = $body.attr('unselectable');
    $body.attr('unselectable', 'on');

    // Mark the active item and store its initial position.
    this.$activeItem = $(event.target).addClass(self.classes.active);
    var position     = this.$activeItem.position();

    // Determine the initial index of the dragged item.
    self.draggingIdx = Array.prototype.indexOf.call($items, self.$activeItem[0]);

    // Store initial top and left coordinates.
    this.top  = position.top;
    this.left = position.left;

    // Create a clone of the active item for dragging.
    this.$dragElement = $(event.target).clone()
                                       .css({
                                         'z-index' : this.options.zindex,
                                         width     : this.$activeItem[0].offsetWidth,
                                         height    : this.$activeItem[0].offsetHeight,
                                         top       : position.top,
                                         left      : position.left
                                       })
                                       .removeClass(self.classes.item) // Remove item class from clone.
                                       .addClass(self.classes.clone)   // Add clone class.
                                       .appendTo(event.target.parentNode); // Append clone to parent.

    // Add sorting class to the container to indicate active sorting.
    this.$element.addClass(self.classes.sorting);

    // Unbind dragstart from items to prevent new drags while one is active.
    this.getItems().off(events.dragstart);

    // Bind global drag, dragend, and selectstart events to the body.
    $body.bind(events.drag, function (e) {
      self.drag(e); // Handle drag movement.
    })
         .bind(events.dragend, function (e) {
           $body.unbind(e); // Unbind global events on dragend.
           self.dragend(e); // Handle drag ending.
         })
         .bind(events.selectstart, function (e) {
           e.preventDefault(); // Prevent text selection during drag.
           return false;
         });

    // Store the initial dragstart event state.
    this.state = event;
  };


  /**
   * Handles the 'dragend' event (mouseup/touchend).
   * Cleans up the drag operation, removes the clone, and restores event listeners.
   *
   * @param {Event} event The dragend event object.
   */
  Sortable.prototype.dragend = function (event) {
    // If propagation was stopped, do nothing.
    if ( event.isPropagationStopped() ) {
      return;
    }

    var self   = this;       // Store 'this' context.
    self.draggingIdx = null; // Clear the dragging index.
    var $items = this.getItems(); // Get all sortable items.

    // Restore body unselectable attribute and remove global drag events.
    $body.attr('unselectable', self.bodyUnselectable)
         .off(events.drag)
         .off(events.dragend)
         .off(events.selectstart);


    // Re-bind dragstart to items so they can be dragged again.
    $items.bind(events.dragstart, function (e) {
      $items.unbind(e);       // Unbind immediately.
      return self.dragstart(e); // Re-initiate dragstart.
    });

    // If no actual dragging occurred (just a click), trigger a click event.
    if ( !this.dragged ) {
      this.state.originalEvent.target.click();
    } else {
      // event.stopPropagation(); // commented out in original, so keep it commented.
      // Call the user-defined onDragend callback.
      this.options.onDragend(event);
    }

    // Remove active class from the item and clear reference.
    this.$activeItem.removeClass(this.classes.active);
    this.$activeItem = null;

    // Remove sorting class from the container.
    this.$element.removeClass(this.classes.sorting);

    // Remove the dragged clone from the DOM.
    this.$dragElement.remove();
  };


  /**
   * Safely applies a function within an Angular scope.
   * Checks if an $apply or $digest cycle is already in progress.
   *
   * @param {Object} $scope The Angular scope.
   * @param {Function} fn The function to execute.
   */
  var safeApply = function ($scope, fn) {
    var phase = $scope.$root.$$phase; // Get current phase.
    if ( phase === '$apply' || phase === '$digest' ) {
      // If already in a cycle, just execute the function.
      if ( fn && (typeof (fn) === 'function') ) {
        fn();
      }
    } else {
      // Otherwise, start an $apply cycle.
      $scope.$root.$apply(fn);
    }
  };


  // Define the 'sortable' Angular module.
  angular.module('sortable', [])
         // Factory for default sortable options.
         .factory('ngSortableOptions', function () {
           return {
             // Default options can be defined here if needed.
           };
         })
         // Directive for making elements sortable.
         .directive('ngSortable', ['ngSortableOptions', function (ngSortableOptions) {
           return {
             restrict : 'A', // Attribute-only directive.
             scope    : {
               ngSortable          : '=',  // Two-way bound array of items.
               ngSortableDirection : '@',  // Direction of sorting (horizontal/vertical).
               ngSortableItems     : '@',  // Selector for sortable items.
               ngSortableHandles   : '@',  // Selector for drag handles.
               ngSortableZindex    : '@',  // Z-index for dragged item.
               ngSortableDisable   : '=',  // Two-way bound boolean to disable/enable.
               ngSortableOnChange  : '=',  // Callback for item reorder.
               ngSortableOnDrag    : '=',  // Callback during drag.
               ngSortableOnDragstart : '=',// Callback on drag start.
               ngSortableOnDragend : '='   // Callback on drag end.
             },
             link     : function ($scope, $element, $attrs) {
               var items = $scope.ngSortable; // The model array.

               // Initialize items as an empty array if not provided.
               if ( !items ) {
                 items = [];
               }

               /**
                * Internal onChange handler for the sortable.
                * Updates the Angular model and calls user-defined callbacks.
                * @param {number} fromIdx Original index.
                * @param {number} toIdx New index.
                */
               function onChange(fromIdx, toIdx) {
                 safeApply($scope, function () {
                   var temp = items.splice(fromIdx, 1); // Remove item from old position.
                   items.splice(toIdx, 0, temp[0]);     // Insert item into new position.
                   if ( $scope.ngSortableOnChange ) {
                     $scope.ngSortableOnChange(fromIdx, toIdx); // Call scope callback.
                   } else if ( ngSortableOptions.onChange ) {
                     ngSortableOptions.onChange(fromIdx, toIdx); // Call global options callback.
                   }
                 });
               }

               // Determine drag direction from scope or global options.
               var direction = $scope.ngSortableDirection || ngSortableOptions.direction;

               // Consolidate options for the Sortable instance.
               var options = {
                 items       : $scope.ngSortableItems || ngSortableOptions.items,
                 handles     : $scope.ngSortableHandles || ngSortableOptions.handles,
                 zindex      : $scope.ngSortableZindex || ngSortableOptions.zindex,
                 onChange    : onChange,
                 onDrag      : $scope.ngSortableOnDrag || ngSortableOptions.onDrag || $.noop,
                 onDragstart : $scope.ngSortableOnDragstart || ngSortableOptions.onDragstart || $.noop,
                 onDragend   : $scope.ngSortableOnDragend || ngSortableOptions.onDragend || $.noop,
                 dragX       : direction !== 'vertical',   // Enable X-drag if not strictly vertical.
                 dragY       : direction !== 'horizontal'  // Enable Y-drag if not strictly horizontal.
               };

               // Create a new Sortable instance.
               var sortable = new Sortable($element, options);

               // Watch for changes in the 'ngSortableDisable' attribute to enable/disable.
               $scope.$watch('ngSortableDisable', function () {
                 sortable.enable( !$scope.ngSortableDisable );
               });

               // Watch for changes in the number of items to trigger a refresh.
               $scope.$watch(function () {
                 return $('.' + sortable.classes.item, $element).length;
               }, function () {
                 sortable.refresh();
               });

               // Clean up sortable instance when the element's scope is destroyed.
               $element.on('$destroy', function () {
                 console.log('angular-sortable destroy'); // Log for debugging.
                 sortable.cleanup();
               });
             }
           };
         }]);

}(jQuery) );