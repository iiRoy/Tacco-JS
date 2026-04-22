/*global require, define, module*/ /* jshint forin:false */

( function (global, factory) {

  'use strict' ;


  // This section handles module loading for AMD (Require.js) environments.
  if ( typeof define === 'function' && define.amd ) {
    return define(['jquery', 'underscore'], function ($, _) {
      return factory($, _, global);
    } );
  }

  // If not AMD, assume a browser environment and attach to the global object.
  global.tbtree = factory(global.$, global._, global);

}(this, function ($, _, global, undefined) { /* The 'undefined' parameter ensures it's truly undefined */

  'use strict';

  /**
   * Default context object used for event bus events when no specific context
   * is provided by the subscriber. It's a simple, empty object.
   * @type {{}} An empty object literal.
   */
  var DEFAULT_CONTEXT = {};

  /**
   * Internal message bus API for managing event subscriptions and publications.
   * This bus is designed for internal use within the tbtree module only.
   * It provides methods for subscribing to, unsubscribing from, and publishing events.
   * @type {{subscribe: Function, unsubscribe: Function, publish: Function}} Defines the bus's public interface.
   */
  var busAPI = {
    // A place to store all active subscriptions, keyed by event name.
    // subscriptions: {}, // This property is initialized per bus instance in the Bus constructor.

    /**
     * Subscribes a callback function to a specific event on the bus.
     * If the event does not yet have subscribers, an array for it is created.
     *
     * @param {String} event      The name of the event to subscribe to (e.g., 'loaded', 'selected').
     * @param {Function} callback The function to execute when the event is published.
     * @param {Object} [context]  Optional; the `this` context for the callback function.
     *                            If not provided, `DEFAULT_CONTEXT` will be used.
     * @throws {Error} If no callback function is supplied.
     */
    subscribe: function (event, callback, context) {
      // Ensure the event has an array of subscriptions.
      if (!_.has(this.subscriptions, event)) {
        this.subscriptions[event] = [];
      }

      // A callback is mandatory for a subscription to be meaningful.
      if (!callback) {
        throw new Error('callback was not supplied for event: ' + event);
      }

      // Add the new subscription, including its callback and context.
      this.subscriptions[event].push({
        callback: callback,
        context: context || DEFAULT_CONTEXT /* Use default if no context specified */
      });
    },

    /**
     * Unsubscribes one or all callback(s) from a given event, or clears all subscriptions.
     * This method offers flexible ways to remove subscriptions based on provided arguments.
     *
     * @param {String} [event]    Optional; the specific event name from which to unsubscribe.
     *                            If omitted, all subscriptions are cleared.
     * @param {Function} [callback] Optional; the specific callback function to remove.
     * @param {Object} [context]  Optional; the specific context associated with the callback to remove.
     */
    unsubscribe: function (event, callback, context) {
      // Case 1: No arguments provided -> Clear ALL subscriptions on the bus.
      if (arguments.length === 0) {
        this.subscriptions = {};
        return;
      }

      // If the event doesn't exist in subscriptions, there's nothing to do.
      if (!_.has(this.subscriptions, event)) {
        return;
      }

      // Case 2: Only 'event' argument provided -> Clear all subscriptions for that specific event.
      if (arguments.length === 1) {
        this.subscriptions[event] = []; // Empty the array of subscribers for this event.
        return;
      }

      // Case 3: 'event', 'callback', and possibly 'context' provided.
      // Filter out the specific subscription(s).
      context = context || DEFAULT_CONTEXT; // Use default context for comparison if not provided.

      this.subscriptions[event] = _.filter(this.subscriptions[event], function (s) {
        // Keep subscriptions where either the callback or the context does not match.
        // This means it will remove only exact matches of callback AND context.
        return s.callback !== callback || s.context !== context;
      });
    },

    /**
     * Publishes an event on the bus, triggering all subscribed callbacks.
     *
     * @param {String} event   The name of the event to publish.
     * @param {Object} message The data payload to pass to the subscribed callbacks.
     *                         This message object will be extended with meta-information.
     */
    publish: function (event, message) {
      // If no one is subscribed to this event, there's nothing to do.
      if (!_.has(this.subscriptions, event)) {
        return;
      }

      // Create a meta-object to include event details with the message.
      var meta = {
        __meta__: {
          name: event,
          subscribers: this.subscriptions[event].length // Number of subscribers for this event.
        }
      };

      // Extend the original message with the meta-information.
      // This allows subscribers to access event metadata.
      message = _.extend(meta, message);

      // Iterate through all subscribers for this event and call their callbacks.
      this.subscriptions[event].forEach(function (s) {
        // Call the callback with its defined context and the extended message.
        s.callback.call(s.context, message);
      });
    }
  };

  /**
   * Constructor function for creating a new message bus instance.
   * Each bus instance gets its own set of subscriptions, making it isolated.
   *
   * @returns {Object} A new bus object, inheriting methods from `busAPI`
   *                   and having its own `subscriptions` property.
   * @constructor
   */
  function Bus() {
    var bus = Object.create(busAPI); // Create an object inheriting from busAPI.
    bus.subscriptions = {};           // Initialize an empty subscriptions object for this instance.
    return bus;                       // Return the newly created bus instance.
  }

  /**
   * Toggles between two CSS classes on a jQuery object's elements.
   * If an element has 'a', it's replaced with 'b'. If it has 'b', it's replaced with 'a'.
   * If it has neither, 'a' is added by default.
   *
   * @param {jQuery} $e A jQuery object containing the elements to modify.
   * @param {String} a  The first class name.
   * @param {String} b  The second class name.
   */
  function toggleClass($e, a, b) {
    // Iterate over each element in the jQuery collection.
    $e.each(function () {
      var $this = $(this); // Wrap the current DOM element in a jQuery object.

      if ($this.hasClass(a)) {
        // If 'a' is present, remove 'a' and add 'b'.
        $this.removeClass(a).addClass(b);
      } else if ($this.hasClass(b)) {
        // If 'b' is present, remove 'b' and add 'a'.
        $this.removeClass(b).addClass(a);
      } else {
        // If neither 'a' nor 'b' is present, add 'a' by default.
        $this.addClass(a);
      }
    });
  }

  /**
   * Default configuration settings for the tree view.
   * These can be overridden by user-provided options during tree initialization.
   *
   * @type {{icons: {expanded: string, collapsed: string, leaf: string, positive: string, negative: string}, arrayValuesInPath: boolean}}
   */
  var DEFAULT_TREE_CONFIG = {
    icons: {
      expanded: 'icon-chevron-down',  // Icon for an expanded branch.
      collapsed: 'icon-chevron-right',// Icon for a collapsed branch.
      leaf: 'icon-file',              // Icon for a leaf node.
      positive: 'icon-unlock',        // Icon for a positive state (e.g., unlocked).
      negative: 'icon-lock'           // Icon for a negative state (e.g., locked).
    },
    arrayValuesInPath: true           // Determines how array values are represented in data-path.
  };

  /**
   * The core API for the tbtree instance. This object defines the methods
   * and properties that each tree instance will inherit or contain.
   * It handles DOM manipulation, event management, and data rendering.
   * @type {{_buildTree: Function, _triggerPathEvent: Function, _toggleExpandState: Function, load: Function, filter: Function, on: Function, off: Function, destroy: Function}}
   */
  var treeAPI = {
    // Internal properties, initialized per instance:
    // _$el: null,     // jQuery object representing the root element of the tree.
    // _data: {},      // The raw data (JSON object) loaded into the tree.
    // _bus: new Bus(), // A dedicated message bus for this tree instance.

    /**
     * Recursively builds the DOM tree from a JSON object, creating nested `<ul>` and `<li>` elements.
     * This method is responsible for generating the visual structure of the tree.
     *
     * @param {Object} json    The JSON data (or a portion of it) to render.
     * @param {jQuery} $parent The jQuery object of the parent DOM element to append to.
     * @private
     */
    _buildTree: function (json, $parent) {
      // Create an unordered list and append it to the current parent element.
      var $ul = $('<ul></ul>')
        .appendTo($parent);

      var self = this; // Cache 'this' for use within the _.each callback.

      // Iterate over each key-value pair in the provided JSON object.
      _.each(json, function (value, key) {
        // Create a list item and append necessary child elements (icons, anchor).
        var $li = $('<li></li>')
          .append('<i></i>')        // First icon (for expand/collapse or leaf).
          .append('<a></a>')        // Anchor tag for the node's text.
          .append('<i></i>')        // Second icon (for positive/negative state).
          .attr('data-path', key)   // Store the key as a data attribute for path tracking.
          .attr('data-state', 'collapsed') // Initial state for branches.
          .appendTo($ul);           // Append the list item to the current unordered list.

        /*
         * Configuration option: `arrayValuesInPath`.
         * By default, if an array contains simple values (not objects/arrays),
         * those values are used in the `data-path` attribute instead of the array index.
         * If `arrayValuesInPath` is false, the array index (key) is always used.
         */
        if (_.isArray(json) && self._config.arrayValuesInPath) {
          if (!_.isObject(value) && !_.isArray(value)) {
            $li.attr('data-path', value); // Use the value itself as the path segment.
          }
        }

        // Apply the negative state icon to the second icon element.
        $li.find('i').last().addClass(self._icons.negative);

        if (_.isObject(value)) {
          // This is a branch node (an object or an array that contains objects/arrays).
          $li.addClass('branch');
          $li.find('a').text(key); // Display the key as the branch label.
          $li.find('i').first().addClass(self._icons.collapsed); // Set the collapsed icon.
          self._buildTree(value, $li); // Recursively build the subtree.
        } else {
          // This is a leaf node (a simple value).
          $li.addClass('leaf');
          // Construct the leaf's label: a span for the key, followed by the value.
          $li.find('a')
            .append('<span class="label label-inverse">' + key + '</span>')
            .find('span')
            .after(value);
          $li.find('i').first().addClass(self._icons.leaf); // Set the leaf icon.
        }

        // Initially hide the child list for all nodes (branches will be toggled).
        $li.find('> ul').hide();
      });
    },

    /**
     * Triggers a path-related event when a list item is clicked.
     * This method constructs the full path from the clicked item up to the root.
     *
     * @param {jQuery} $li The jQuery object of the list item that was clicked.
     * @private
     */
    _triggerPathEvent: function ($li) {
      var segments = [];
      // Add the data-path of the clicked item itself.
      segments.push($li.attr('data-path'));

      // Traverse up the DOM to find parent list items and add their data-paths.
      $li.parents('li').each(function (i, li) {
        segments.push($(li).attr('data-path'));
      });

      // Reverse the segments to get the path from root to leaf, then join them with '/'.
      var fullPath = segments.reverse().join('/');

      // Publish a 'selected' event with the full path and the target DOM element.
      this._bus.publish('selected', {
        path: fullPath,
        target: $li[0] // Pass the raw DOM element.
      });
    },

    /**
     * Toggles the expanded/collapsed state of a list item (branch) when it is clicked.
     * Updates the visual icon and publishes corresponding events ('expanded' or 'collapsed').
     *
     * @param {jQuery} $li The jQuery object of the list item to toggle.
     * @private
     */
    _toggleExpandState: function ($li) {
      var state = $li.attr('data-state'), // Get the current state ('expanded' or 'collapsed').
        eventArgs = {target: $li[0]};   // Prepare event arguments, including the target element.

      if (state === 'expanded') {
        // If currently expanded, collapse it.
        $li.find('> ul').hide(); // Hide the child list.
        // Change the icon from expanded to collapsed.
        $li.find('> .' + this._icons.expanded)
          .removeClass(this._icons.expanded)
          .addClass(this._icons.collapsed);
        $li.attr('data-state', 'collapsed'); // Update the data-state attribute.
        this._bus.publish('collapsed', eventArgs); // Publish the 'collapsed' event.
      } else {
        // If currently collapsed, expand it.
        $li.find('> ul').show(); // Show the child list.
        // Change the icon from collapsed to expanded.
        $li.find('> .' + this._icons.collapsed)
          .removeClass(this._icons.collapsed)
          .addClass(this._icons.expanded);
        $li.attr('data-state', 'expanded'); // Update the data-state attribute.
        this._bus.publish('expanded', eventArgs); // Publish the 'expanded' event.
      }
    },

    /**
     * Loads new data into the tree view, rebuilding the entire structure.
     * This is the primary method for initializing or updating the tree's content.
     *
     * @param {Object|String} data The data to load; can be a JavaScript object or a JSON string.
     * @returns {*} Returns the tree instance for method chaining.
     */
    load: function (data) {
      // If a tree already exists, clear its previous content and remove event handlers.
      if (this._$el) {
        this._$el.remove(); // Removes the element and its data/events.
      }
      // Initialize or re-initialize the root jQuery element for the tree.
      this._$el = $(this._config.selector).addClass('tbtree');

      // If the data is a string, parse it as JSON.
      if (_.isString(data)) {
        data = JSON.parse(data);
      }
      this._data = data; // Store the processed data internally.

      // Build the DOM tree structure from the data.
      this._buildTree(this._data, this._$el);

      var self = this; // Cache 'this' for use in event handlers.

      // Attach a click event handler to all list items within the tree.
      this._$el.on('click', 'li', function (/*e*/) { // Event object is commented out as it's not used.
        var $li = $(this);

        /**
         * Logic to differentiate single click from double click.
         * A `setTimeout` is used to delay the click handler's execution.
         * If a `dblclick` event fires shortly after, it sets a 'double' data attribute.
         * The delayed click handler checks this attribute: if it's set, it decrements it
         * and returns, effectively ignoring the first click of a double-click.
         * The second click of a double-click will find 'double' already decremented,
         * and thus it will proceed with the regular click logic.
         * This ensures that single-click actions don't fire during a double-click.
         */
        setTimeout(function () {
          var dblclick = parseInt($li.data('double') || 0, 10);
          if (dblclick > 0) {
            $li.data('double', dblclick - 1); // Decrement and ignore this click if it's part of a double-click.
            return;
          }
          // If it's a single click (or the second click of a double-click after the first was ignored).
          self._$el.find('li').removeClass('highlighted'); // Remove highlighting from all other items.
          $li.addClass('highlighted');                    // Highlight the clicked item.
          self._triggerPathEvent($li);                    // Trigger the path event.
          self._toggleExpandState($li);                   // Toggle expand/collapse state.
        }, 0); // Execute with a minimal delay to allow dblclick to register.
        return false; // Prevent default link behavior and event bubbling.
      });

      // Attach a double-click event handler to all list items.
      this._$el.on('dblclick', 'li', function (/*e*/) {
        var $li = $(this);
        $li.data('double', 1); // Mark this item as having been double-clicked.
        self._triggerPathEvent($li, 'selected'); // Trigger the path event on double-click.
        return false; // Prevent default behavior.
      });

      // Get the class names for positive and negative state icons from the config.
      var pos = this._icons.positive,
        neg = this._icons.negative;

      // Construct a selector for icon elements that have either a positive or negative state class.
      var statesSelector = 'i.' + pos + ', i.' + neg;

      // Attach a click handler to these state icons.
      this._$el.on('click', statesSelector, function (e) {
        var $i = $(this);
        toggleClass($i, pos, neg); // Toggle the state between positive and negative.
        e.stopPropagation();       // Prevent the click event from bubbling up to the list item.
        e.preventDefault();        // Prevent any default action associated with the icon.
        return false;              // Stop further event propagation and default actions.
      });

      this._bus.publish('loaded'); // Publish a 'loaded' event once the tree is fully rendered.

      return this; // Allow method chaining.
    },

    /**
     * Filters the tree based on a query.
     * This method is currently not implemented and will throw an error if called.
     *
     * @param {String} [query] The filter query string.
     * @throws {Error} If called, as it's not yet implemented.
     */
    filter: function (/*query*/) {
      throw new Error('`filter` is not implemented in this version of tbtree.');
    },

    /**
     * Subscribes a callback function to a specific event on this tree instance's bus.
     * This provides an external API for listening to tree-specific events.
     *
     * @param {String} event      The name of the event (e.g., 'loaded', 'selected', 'expanded').
     * @param {Function} callback The function to execute when the event fires.
     * @param {Object} [context]  Optional; the `this` context for the callback.
     * @returns {*} Returns the tree instance for method chaining.
     */
    on: function (event, callback, context) {
      this._bus.subscribe(event, callback, context);
      return this; // Allow method chaining.
    },

    /**
     * Unsubscribes one or all callback(s) from a given tree event.
     *
     * @param {String} [event]    Optional; the specific event name.
     * @param {Function} [callback] Optional; the specific callback function.
     * @param {Object} [context]  Optional; the specific context of the callback.
     * @returns {*} Returns the tree instance for method chaining.
     */
    off: function (event, callback, context) {
      this._bus.unsubscribe(event, callback, context);
      return this; // Allow method chaining.
    },

    /**
     * Cleans up the tree instance by removing event handlers, classes, and content.
     * This helps prevent memory leaks when the tree is no longer needed.
     */
    destroy: function () {
      if (this._$el) {
        this._$el.off();                  // Remove all event handlers attached via jQuery's .on().
        this._$el.removeClass('tbtree');  // Remove the main tree class.
        this._$el.html('');               // Clear the inner HTML content of the tree root element.
      }
    }
  };

  /**
   * Factory function to create and initialize a new tbtree instance.
   * This is the public interface for users to create a tree.
   *
   * @param {Object|String} options Configuration options for the tree.
   *                                If a string, it's treated as the 'selector' option.
   * @returns {Object} A new tbtree instance, ready to be loaded with data.
   * @throws {Error} If a 'selector' option is not provided.
   */
  return function (options) {
    // Allow options to be just a string, which is interpreted as the selector.
    if (typeof options === 'string') {
      options = {selector: options};
    }
    // Ensure a selector is always provided, as it's essential for rendering.
    if (!_.has(options, 'selector')) {
      throw new Error('A selector must be specified for the tbtree to render into.');
    }

    // Create a new tree instance, inheriting from `treeAPI`.
    var tree = Object.create(treeAPI);

    // Initialize instance-specific properties.
    tree._$el = null;                 // The root DOM element for this tree.
    tree._bus = new Bus();            // A unique message bus for this tree.
    tree._data = {};                  // The data currently displayed in this tree.
    // Merge default config with user-provided options.
    tree._config = _.defaults(options, DEFAULT_TREE_CONFIG);
    // Provide a convenient alias for the icons configuration.
    tree._icons = tree._config.icons;

    return tree; // Return the newly created and configured tree instance.
  };

}));