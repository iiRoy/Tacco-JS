/**
 *
 *  Events
 *
 *  This section defines all custom events fired by the jsonymer-editor component.
 *
 */

    /**
     * @event beforeItemAdded
     * @description Fires right before an item is added to the JSON structure. Using `event.preventDefault()` will cause the item to not be added.
     *
     * @param {object} parent - the parent item object that the new item will be added to
     */

    /**
     * @event itemAdded
     * @description Fires after an item has been added to the JSON structure.
     * @param {object} item - the new item object added to the JSON structure
     */

    /**
     * @event beforeItemRemoved
     * @description Fires right before an item is removed from the JSON structure. Using `event.preventDefault()` will cause the item to not be removed.
     *
     * @param {object} item - the item object that will be removed
     */

    /**
     * @event itemRemoved
     * @description Fires after an item has been removed from the JSON structure.
     * @param {int} itemId - the index ID of the item that was removed
     * @param {object} parent - the parent item object of the item that was removed
     */

    /**
     * @event keyValueChanged
     * @description Fires after a item's _key_ has been changed. *Note:* this event fires on every keystroke in the key input element. It will also fire when `setKeyValue()` is called with the `fireEvent` parameter set to true.
     *
     * @param {string} value - the value of the key input box
     * @param {element} element - the HTML element used for user input
     * @param {object} item - the item object for the `key : value` pair
     */

    /**
     * @event propertyValueChanged
     * @description Fires after a item's _property_ has been changed. *Note:* this event fires on every keystroke in the property input element if the item is a _string type_. It will also fire when `setPropertyValue()` is called with the `fireEvent` parameter set to true.
     *
     * @param {string} value - the value of the value input box
     * @param {element} element - the HTML element used for user input
     * @param {object} item - the item object for the `key : value` pair
     */

    /**
     * @event beforeItemtypeRemoved
     * @description Fires right before an item's _type_ has been removed (eg. the item goes back to an undetermined state). Using `event.preventDefault()` will cause the item type to not be removed.
     * @param {object} item - the item object that will lose its type
     */

    /**
     * @event itemTypeRemoved
     * @description Fires after an item's _type_ has been removed.
     * @param {object} item - the item object that lost it's type
     */

    /**
     * @event edit
     * @description Fires any time the JSON structure has been edited. This makes it possible to trace many of the element's events with one callback. The edit event fires in conjunction with the `itemAdded`, `itemRemoved`, `keyValueChanged`, `propertyValueChanged`, and `itemTypeRemoved` events. The edit event detail will be the same object as documented for each of these corresponding events (depending on what type of edit occurred), along with an additional property of `editType`.
     *
     * @param {string} editType - the type of edit that occurred, in the form of the name of the corresponding event
     */

    /**
     * @event dirty
     * @description Fires when an error occurs within the JSON structure.
     * @param {object} error - the internal error object created for the error, as specified in the _dealing with errors section_
     * @param {object} item - the item object for the item that the error occurred on
     */

    /**
     * @event clean
     * @description Fires once the JSON structure is void of any errors. No relevant `event.detail` is provided for this event.
     */

(function () {

    // Internal variable to keep track of unique IDs for items.
    var id = 0;

    Polymer('jsonymer-editor', {

        // The original JavaScript object passed into the editor.
        obj: false,

        // The special compiled object format used internally.
        // This is the original object but augmented with metadata
        // to track changes and internal states.
        cObj: false,

        // A key-map array to quickly access deep objects by their unique ID.
        // This avoids traversing the object tree for modifications.
        kArr: false,

        // Error message string for developers/users in case of object parsing issues.
        objError: "Error",

        // Reference to the data object of the currently edited item, if any.
        current_edit_item: null,

        // Reference to the DOM element of the item currently in focus.
        focusedItem: null,

        // Cache of all current errors present in the JSON document.
        errors: {},

        // Flag to enable/disable error reporting functionality.
        // Set to `false` if error display is not desired (e.g., for duplicate keys).
        errorsOn: true,


        /*
         *
         * POLYMER INTERNAL LIFECYCLE METHODS
         * These methods are part of the Polymer lifecycle.
         *
         */
        created: function () {
            this.obj = {}; // Initialize the main object.
            this.resetVariables(); // Reset all internal tracking variables.
        },

        domReady: function () {
            // Fires when the DOM has been prepared.
            this.fire("domReady");
        },

        /* END POLYMER INTERNAL LIFECYCLE METHODS */


        resetVariables: function () {
            // Resets all internal variables to their initial state.
            this.cObj = {
                "id": -1,
                "value": [],
                "parent": false,
                "childKeyIdx": 0,
                "type": "object"
            };
            this.kArr = {}; // Clear the key array.
            this.errors = {}; // Clear any existing errors.
            this.kArr[this.cObj.id] = this.cObj; // Add the root object to the key array.
        },

        valToString: function (str) {

            var type = typeof (str); // Determine the type of the input.

            if (type === "string" || type === "boolean" || type === "number") {
                // For primitive types, convert directly to string.
                return (str).toString();
            }

            if (str === null) {
                // Handle null specifically.
                return "null";
            }

            if (str === undefined) {
                // Handle undefined specifically.
                return "undefined";
            }

            // Return the original value if it's an object or unhandled type.
            return str;

        },

        convertType: function (str) {
            // Converts string representations of values back to their native types.

            if (str === 'null' || str === null) {
                return null;
            }

            if (str === 'undefined' || str === undefined) {
                return undefined;
            }

            if (str === 'false' || str === false) {
                return false;
            }

            if (str === 'true' || str === true) {
                return true;
            }

            var test = (str.trim && str.trim()) || str; // Trim string if possible.
            if (test.length === 0 || isNaN(test)) {
                // If empty or not a number, return as is.
                return str;
            }

            if (!isNaN(str)) {
                // If it's a number, parse it as a float.
                return parseFloat(str);
            }

            // Default to returning the original string.
            return str;

        },

        isEvent: function (maybeEvent) {
            // Checks if the given argument is an Event object.
            return maybeEvent instanceof Event;
        },

        isCalledFromDom: function (args) {
            // Determines if the method was invoked directly from a DOM event.
            return this.isEvent(args[0]);
        },

        forEachChild: function (collection, fn) {
            // Iterates over children in an array or object collection.
            if (collection instanceof Array) {
                for (var i = 0; i < collection.length; i++) {
                    fn(collection[i], i);
                }
            } else if (typeof (collection) === "object") {
                for (var i in collection) {
                    fn(collection[i], i);
                }
            }
        },

        getItem: function (id) {
            // Retrieves an item from the internal key array by its ID.
            return this.kArr[id];
        },

        getSiblings: function (id) {
            // Returns the siblings of a given item.
            var item = this.getItem(id);
            return item.parent && item.parent.value;
        },

        valueIsEndpoint: function (val) {
            // Checks if a value is a leaf node (not an object or array).
            if (!val || typeof (val) !== "object") {
                return true;
            }
            return false;
        },

        typeOfValue: function (val) {
            // Determines the type of a given value.
            if (val === undefined) {
                return undefined;
            }
            if (this.valueIsEndpoint(val)) {
                return "string"; // Endpoint values are treated as strings for input.
            } else if (val instanceof Array) {
                return "array";
            }
            return "object";
        },

        itemIsRoot: function (item) {
            // Checks if the given item is the root object.
            return item.id === -1;
        },

        itemCanHaveChildren: function (id) {
            // Determines if an item can contain child elements (i.e., is an object or array).
            var item = this.getItem(id);
            if (item) {
                return item.type === "array" || item.type === "object";
            }
            return false;
        },


        /*
         *
         * POLYMER TEMPLATE FILTER FUNCTIONS
         *
         * The following are functions used in the template HTML
         * to allow looping of objects, since polymer templates
         * do not support native object iteration yet. These provide
         * utility for conditional rendering.
         *
         */
        isArray: function (v) {
            // Template filter: checks if value is an Array.
            return v instanceof Array;
        },

        isNotArray: function (v) {
            // Template filter: checks if value is NOT an Array.
            return !(v instanceof Array);
        },
        /* END POLYMER TEMPLATE FILTER FUNCTIONS */


        /* POLYMER CHANGED EVENT METHODS */

        // This method is invoked whenever the `obj` property changes.
        // It's responsible for recompiling the new object structure.
        objChanged: function () {
            if (typeof (this.obj) === "object") {
                return this.compileObject();
            }
        },
        /* END POLYMER CHANGED EVENT METHODS */


        /*
         *
         * POLYMER TEMPLATE EVENT HOOKS
         * These methods handle events triggered by the Polymer template.
         *
         */

        fireEditEvent: function (eventDetail, eventType, async) {
            // Helper function to fire custom edit events.

            var method = async ? "asyncFire" : "fire"; // Determine sync/async firing.

            this[method](eventType, eventDetail); // Fire the specific edit event.

            eventDetail.editType = eventType; // Add edit type to detail for generic edit event.
            this[method]('edit', eventDetail); // Fire the general 'edit' event.

        },


        /**
         * @method addItem
         *
         * @description Adds a new item into the passed _parentId_ item. If the item should be added to the top level, pass `-1` for the parentId. This method is also used by the editor template as well, so any events dealing with items being added will fire `beforeItemAdded`, `itemAdded`, and `edit`. If you want to circumvent this behavior, use `createNewItem()` instead.
         *
         * @param {number} parentId - The id of the parent that the new item will be added to.
         *
         * @param {string} [key] - The key for the new item. Passing any falsey value (besides _0_) will result in a generated key. If a key is passed that already exists in some sibling, duplicate key errors will be set.
         *
         * @param {*} [value] - The value for the new item. If a string or falsey value is passed, it will be converted to a string representation. If an object or array is passed, those items will automatically be generated into the editor as children. If `undefined` is passed, the new item will have an undetermined type.
         *
         * @param {boolean} [editMode] - Set to true to send the new item's key into edit mode (focus).
         *
         * @returns {object|null} The new item object that was added to the editor or `null` if the addition was prevented.
         *
         */
        addItem: function (parentId, passedKey, passedValue, editMode) {

            // Check if the method was called from a DOM event.
            if (this.isCalledFromDom(arguments)) {
                var el = arguments[2]; // Get the element that triggered the event.
                var parentId = el.getAttribute('data-id'); // Extract parent ID from data attribute.
                return this.addItem(parentId, undefined, undefined, true); // Re-call with parsed arguments.
            }


            var _this = this; // Cache 'this' for potential nested functions.

            // Retrieve the target parent object from the key array.
            var targetParent = this.kArr[parentId] || this.cObj;

            // Fire the 'beforeItemAdded' event to allow prevention.
            var eventObj = this.fire('beforeItemAdded', {
                "parent": targetParent,
                "key": passedKey,
                "value": passedValue
            });

            // If a callback prevented the default action, stop here.
            if (eventObj.defaultPrevented) {
                return null;
            }

            // Create the new item using internal helper.
            var item = this.createNewItem(parentId, passedKey, passedValue);

            // If editMode is true and parent is not an array, enter edit mode for the new item's key.
            if (editMode && targetParent.type !== "array") {
                this.enterEditModeAsync(item.id);
            }

            // Prepare event detail for 'itemAdded' and 'edit' events.
            var detail = {
                "item": item
            };

            // Fire the 'itemAdded' and generic 'edit' events asynchronously.
            this.fireEditEvent(detail, 'itemAdded', true);

            return item; // Return the newly added item.

        },


        /**
         * @method removeItem
         *
         * @description Removes an item from the editor. This will also remove any children the item might have, remove any errors placed on these children, as well as resolve any duplicate key errors that were placed on the item itself. The events `beforeItemRemoved` and `itemRemoved` will both fire when this method is called.
         *
         * @param {number} itemId - The id of the item to remove.
         *
         * @returns {boolean} Returns `true` if the item was removed, `false` if an error occurred or removal was prevented.
         *
         */
        removeItem: function (itemId) {

            // Check if the method was called from a DOM event.
            if (this.isCalledFromDom(arguments)) {
                var el = arguments[2]; // Get the element that triggered the event.
                var id = el.getAttribute('data-id'); // Extract item ID from data attribute.
                return this.removeItem(id); // Re-call with parsed item ID.
            }

            var obj = this.getItem(itemId); // Get the item object to be removed.

            // Proceed only if the item exists and is not the root object.
            if (obj && !this.itemIsRoot(obj)) {

                var parent = (obj.parent && obj.parent.value) || this.cObj.value; // Determine the parent's value array.
                var itemChildOfArray = this.isItemChildOfArray(itemId); // Check if the item's parent is an array.

                if (parent) { // Ensure a parent exists.

                    for (var i = 0; i < parent.length; i++) {

                        var tObj = parent[i]; // Current child object in the parent's value.

                        if (tObj.id === obj.id) { // Found the item to remove.

                            // Fire 'beforeItemRemoved' event to allow prevention.
                            var eventObj = this.fire('beforeItemRemoved', {
                                "item": obj,
                            });

                            // If a callback prevented the default action, stop here.
                            if (eventObj.defaultPrevented) {
                                return null;
                            }

                            // Clear all errors associated with this item and its descendants.
                            this.clearError(itemId);
                            this.clearDescendingErrors(itemId);

                            // Remove the item from its parent's value array and the global key map.
                            parent.splice(i, 1);
                            this.removeItemFromKeyMap(itemId);


                            // If the item was a child of an array, reset sibling IDs for proper order.
                            if (itemChildOfArray) {
                                this.resetChildKeys(parent);
                            }
                            // If it was a child of an object, resolve any duplicate key errors.
                            else {
                                this.resetDuplicateKeys(parent, obj.key);
                            }

                            // Prepare event detail for 'itemRemoved' and 'edit' events.
                            var eventDetail = {
                                "id": itemId,
                                "parent": obj.parent
                            };
                            // Fire the 'itemRemoved' and generic 'edit' events asynchronously.
                            this.fireEditEvent(eventDetail, 'itemRemoved', true);


                            return true; // Item successfully removed.

                        }
                    }
                }
            }
            return false; // Item not found or could not be removed.
        },


        // This method is called when an item's key or value input gains focus.
        // It triggers the entry into edit mode for that specific input field.
        doFocus: function (e, data, el) {

            // Check if the method was called programmatically rather than by a DOM event.
            if (!this.isCalledFromDom(arguments)) {
                var itemid = arguments[0] || null; // Get item ID from arguments.
                var which = arguments[1] || null; // Get 'key' or 'value' from arguments.
                if (which !== 'key' && which !== 'value') {
                    which = 'key'; // Default to 'key' if not specified or invalid.
                }
                var domItem = this.getDomItem(itemid, which); // Get the specific DOM element.
                return domItem.focus(); // Set focus on the element.
            }

            var id = el.getAttribute('data-id'); // Get the item ID from the focused element's data attribute.

            var obj = this.kArr[id]; // Retrieve the item object from the key array.

            // If focusing on a key and the item is a child of an array,
            // prevent editing because array keys are not editable.
            if (el.classList.contains('key-value') && this.isItemChildOfArray(id)) {