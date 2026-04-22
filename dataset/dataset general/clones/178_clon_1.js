/*
 *     Backbone.js 0.5.3 - A JavaScript framework that provides models with key-value binding and custom events,
 *     collections with a rich API of enumerable functions, and views with declarative event handling.
 *
 *     (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
 *     Backbone may be freely distributed under the MIT license.
 *     For complete details and comprehensive documentation, please visit:
 *     http://documentcloud.github.com/backbone
 */



(function() {

    // --- Core Setup ---
    // This section initializes the Backbone library and sets up its global context.

    // Save a reference to the global object, typically 'window' in browsers
    // or 'global' in Node.js environments.
    var root = this;


    // Store the existing value of the 'Backbone' variable.
    // This is crucial for implementing the noConflict feature later.
    var previousBackbone = root.Backbone;



    // Declare the top-level namespace for Backbone.
    // All public Backbone classes and modules will be attached to this object.
    // It's designed to be exported for both CommonJS (Node.js) and browser environments.
    var Backbone;

    // Check if 'exports' is defined, indicating a CommonJS (e.g., Node.js) environment.
    if  (typeof exports !== 'undefined')  {
        Backbone = exports; // In CommonJS, assign Backbone to module.exports.
    }
    else {
        // In a browser environment, assign Backbone to the global 'root' object.
        Backbone = root.Backbone = {};
    }


    // Current version of the Backbone library.
    // This string should always be kept in sync with the version specified in `package.json`.
    Backbone.VERSION = '0.5.3';


    // Require the Underscore.js library.
    // This check ensures Underscore is loaded, especially in server-side contexts,
    // if it's not already globally available. Backbone heavily relies on Underscore's utilities.
    var _ = root._;
    if  (!_ && (typeof require !== 'undefined')) {
        _ = require('underscore')._; // Load Underscore via CommonJS require mechanism.
    }


    // For Backbone's DOM manipulation purposes, we prefer either jQuery or Zepto.
    // Assign the globally available '$' variable from either of these libraries.
    var $ = root.jQuery || root.Zepto;


    // --- Utility Methods ---

    // Runs Backbone.js in *noConflict* mode.
    // This method restores the 'Backbone' variable to its previous owner (if any existed).
    // It then returns a reference to the current Backbone object, allowing it to be
    // assigned to a different variable name, thus avoiding global namespace conflicts.
    Backbone.noConflict = function () {
        root.Backbone = previousBackbone; // Restore the previous Backbone.
        return this; // Return the current Backbone instance for reassignment.
    };


    // Configuration option: `emulateHTTP`.
    // When set to `true`, this option enables support for legacy HTTP servers
    // that may not fully support RESTful conventions (specifically, PUT and DELETE verbs).
    // It achieves this by faking `"PUT"` and `"DELETE"` requests: they are sent as POST requests
    // with an additional `_method` parameter and an `X-Http-Method-Override` header.
    Backbone.emulateHTTP = false;


    // Configuration option: `emulateJSON`.
    // When set to `true`, this option supports legacy servers that cannot
    // properly handle direct `application/json` requests for data submission.
    // Instead, it encodes the request body as `application/x-www-form-urlencoded`
    // and sends the model's data within a form parameter named `model`.
    Backbone.emulateJSON = false;


    // --- Backbone.Events Module ---
    // A foundational module that can be mixed in to *any object* in order to provide it with
    // custom event capabilities. Objects can `bind` callback functions to specific events,
    // and `trigger` those events to execute all bound callbacks in succession.
    //
    // Example Usage:
    //
    //      var object = {};
    //      _.extend(object, Backbone.Events); // Mix in event capabilities to a plain object.
    //      object.bind('expand', function() { alert('Expanded!'); }); // Bind an event listener.
    //      object.trigger('expand'); // Trigger the 'expand' event, executing the callback.
    //
    Backbone.Events = {

        // Binds a callback function to a specified event.
        // The event is identified by a string name, `ev`.
        // Passing `"all"` as `ev` will bind the callback to all events fired by the object.
        bind : function(ev, callback, context) {
            // Retrieve or initialize the `_callbacks` object, which stores event listeners.
            var calls = this._callbacks || (this._callbacks = {});
            // Retrieve or initialize the list of callbacks for the specific event `ev`.
            var list  = calls[ev] || (calls[ev] = []);
            list.push([callback, context]); // Store the callback function and its execution context.
            return this; // Return `this` to enable method chaining.
        },


        // Removes one or many bound callbacks.
        // If `callback` is `null`, all callbacks for the specified `ev` are removed.
        // If `ev` is `null`, all bound callbacks for all events on this object are removed.
        unbind : function(ev, callback) {
            var calls;

            // If no event name is provided, clear all callbacks for all events.
            if  (!ev)  {
                this._callbacks = {};
            }
            // If an event name is specified and callbacks exist for this object.
            else if  (calls = this._callbacks)  {
                // If no specific callback is provided, remove all callbacks for this event.
                if  (!callback)  {
                    calls[ev] = [];
                }
                // If a specific callback is provided, find and remove that particular callback.
                else  {
                    var list = calls[ev];
                    if  (!list) return this; // If no list for this event, nothing to remove.
                    // Iterate through the list to find and nullify the matching callback.
                    for  (var i = 0, l = list.length; i < l; i++)  {
                        if  (list[i] && callback === list[i][0])  {
                            list[i] = null; // Mark the callback for removal (it will be spliced out during `trigger`).
                            break; // Stop after finding the first match (assuming unique callback instances).
                        }
                    }
                }
            }
            return this; // Return `this` to enable method chaining.
        },

        // Triggers an event, firing all bound callbacks.
        // Callbacks receive the same arguments as `trigger`, apart from the event name itself.
        // Callbacks listening for the `"all"` event receive the true event name as their first argument,
        // followed by all original arguments passed to `trigger`.
        trigger : function(eventName) {
            var list, calls, ev, callback, args;
            var both = 2; // Counter to handle triggering both the specific event and the 'all' event.

            // If no callbacks are registered for this object, simply return early.
            if  (!(calls = this._callbacks)) return this;

            // Loop twice: once for the specific `eventName`, and once for the `"all"` event.
            while  (both--)  {
                ev = both ? eventName : 'all'; // Determine which event's callbacks to process in this iteration.
                if  (list = calls[ev])  {
                    // Iterate through the list of callbacks for the current event (`ev`).
                    for  (var i = 0, l = list.length; i < l; i++)  {
                        // If a callback was marked for removal (nullified by `unbind`), splice it out.
                        if  (!(callback = list[i]))  {
                            list.splice(i, 1); // Remove the nullified entry.
                            i--; // Adjust index due to splice.
                            l--; // Adjust length due to splice.
                        }
                        // Otherwise, execute the callback.
                        else  {
                            // Prepare arguments for the callback execution.
                            // For specific events, slice arguments from the second one (after `eventName`).
                            // For `"all"` events, pass all original arguments, including `eventName`.
                            args = both ? Array.prototype.slice.call(arguments, 1) : arguments;
                            // Apply the callback function with its specified context or the object itself.
                            callback[0].apply(callback[1] || this, args);
                        }
                    }
                }
            }
            return this; // Return `this` to enable method chaining.
        }

    };


    // --- Backbone.Model Class ---
    // Represents a single model (typically a row of data) within a Backbone application.
    // Models provide functionality for data validation, persistence to a server, and change tracking.

    // Constructor for a new Model instance.
    // `attributes` is an optional hash of initial data properties.
    // `options` provides configuration for the model, such as a reference to its collection.
    Backbone.Model = function(attributes, options) {
        var defaults;
        attributes || (attributes = {}); // Ensure `attributes` is always an object, even if not provided.

        // Apply default values if defined on the model's `defaults` property.
        if  (defaults = this.defaults)  {
            // If `defaults` is a function, execute it to get the default values.
            if  (_.isFunction(defaults)) defaults = defaults.call(this);
            // Extend the provided `attributes` with `defaults`, giving precedence to provided attributes.
            attributes = _.extend({}, defaults, attributes);
        }

        this.attributes = {}; // Stores the model's current attribute values.
        this._escapedAttributes = {}; // Caches HTML-escaped attribute values for performance.
        this.cid = _.uniqueId('c'); // Client ID: a unique identifier for this model instance, generated by Backbone.
        this.set(attributes, {silent : true}); // Set initial attributes silently to avoid triggering events during construction.
        this._changed = false; // Flag to track if the model has changed since the last `change` event.
        this._previousAttributes = _.clone(this.attributes); // Snapshot of attributes for `hasChanged` and `previous`.

        // If a collection is provided in the `options`, store a reference to it.
        if  (options && options.collection) this.collection = options.collection;

        this.initialize(attributes, options); // Call the custom initialization method (can be overridden).
    };

    // Attach all inheritable methods (from `Backbone.Events` and Model-specific methods)
    // to the `Backbone.Model.prototype`.
    _.extend(Backbone.Model.prototype, Backbone.Events, {

        // A private property to store a snapshot of the model's attributes.
        // This snapshot is taken immediately after the last `"change"` event was fired,
        // and is used for tracking changes (`hasChanged`, `previous`).
        _previousAttributes : null,

        // A boolean flag indicating whether any of the model's attributes have been modified
        // since the last `"change"` event was triggered.
        _changed : false,

        // The name of the attribute that serves as the model's unique identifier.
        // By default, this is `"id"`. Users working with databases like MongoDB
        // or CouchDB might prefer to set this to `"_id"`.
        idAttribute : 'id',

        // An empty function by default. Developers should override this method
        // with their own custom initialization logic when extending `Backbone.Model`.
        // It is called at the end of the model's constructor.
        initialize : function(){},

        // Returns a deep copy of the model's current `attributes` object.
        // This prevents direct modification of the internal attributes object by external code.
        toJSON : function() {
            return _.clone(this.attributes);
        },

        // Retrieves the value of a specific attribute from the model.
        // Example: `model.get('title')`
        get : function(attr) {
            return this.attributes[attr];
        },

        // Retrieves the HTML-escaped value of an attribute.
        // This method is useful for preventing Cross-Site Scripting (XSS) vulnerabilities
        // when displaying model data directly in HTML.
        escape : function(attr) {
            var html;
            // Check if the HTML-escaped value is already cached. If so, return it.
            if  (html = this._escapedAttributes[attr]) return html;

            var val = this.attributes[attr];
            // Escape the value and cache it, handling null or undefined values gracefully.
            return this._escapedAttributes[attr] = escapeHTML(val == null ? '' : '' + val);
        },

        // Checks if a specific attribute contains a value that is neither `null` nor `undefined`.
        // Returns `true` if the attribute has a meaningful value, `false` otherwise.
        has : function(attr) {
            return this.attributes[attr] != null;
        },

        // Sets a hash of model attributes on the object.
        // By default, this method triggers a `"change"` event and specific `"change:attributeName"` events.
        // If `options.silent` is `true`, no events will be triggered.
        set : function(attrs, options) {

            // Initialize options if not provided to prevent errors.
            options || (options = {});
            // If no attributes are provided to set, simply return the model.
            if  (!attrs) return this;
            // If `attrs` is another model instance, extract its internal `attributes` hash.
            if  (attrs.attributes) attrs = attrs.attributes;

            var now = this.attributes, // Reference to the model's current attributes.
                escaped = this._escapedAttributes; // Reference to the cached escaped attributes.

            // Run validation if a `validate` method is defined on the model and setting is not silenced.
            // If validation fails, return `false`.
            if  (!options.silent && this.validate && !this._performValidation(attrs, options)) return false;

            // Check if the `idAttribute` is being changed and update the model's `id` property directly.
            if  (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            // Flag to indicate that a change process is currently underway.
            // This prevents nested `change` events from re-triggering the main `change` event.
            var alreadyChanging = this._changing;
            this._changing = true;

            // Iterate over the provided `attrs` and update the model's attributes.
            for  (var attr in attrs)  {
                var val = attrs[attr];
                // Only update and trigger events if the new value is different from the old one.
                if  (!_.isEqual(now[attr], val))  {
                    now[attr] = val; // Update the attribute with the new value.
                    delete escaped[attr]; // Invalidate the cached escaped value for this attribute.
                    this._changed = true; // Mark the model as having changed.
                    // Trigger a specific `change:attributeName` event if not silent.
                    if  (!options.silent) this.trigger('change:' + attr, this, val, options);
                }
            }

            // After all individual attribute changes, fire the general `"change"` event.
            // This happens only if changes occurred, and no other change process was already active.
            if  (!alreadyChanging && !options.silent && this._changed) this.change(options);

            this._changing = false; // Reset the changing flag.
            return this; // Return `this` to enable method chaining.
        },

        // Removes a specific attribute from the model.
        // Triggers a `"change"` event (and `change:attributeName`) unless `options.silent` is `true`.
        // If the attribute does not exist on the model, this method performs no operation.
        unset : function(attr, options) {
            // If the attribute is not present in the model, there's nothing to unset.
            if  (!(attr in this.attributes)) return this;

            options || (options = {}); // Ensure `options` object exists.
            var value = this.attributes[attr]; // Store the current value before removal.

            // Prepare a validation object for the attribute being unset.
            // `void 0` represents `undefined`.
            var validObj = {};
            validObj[attr] = void 0;

            // Perform validation if defined and not silenced. If validation fails, return `false`.
            if  (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

            // Remove the attribute from the internal storage.
            delete this.attributes[attr];
            delete this._escapedAttributes[attr]; // Clear its cached escaped value.

            // If the `idAttribute` is being unset, also clear the model's `id` property.
            if  (attr == this.idAttribute) delete this.id;

            this._changed = true; // Mark the model as having changed.

            // Trigger change events if not silent.
            if  (!options.silent)  {
                this.trigger('change:' + attr, this, void 0, options); // Specific attribute change event.
                this.change(options); // General model change event.
            }
            return this; // Return `this` to enable method chaining.
        },

        // Clears all attributes from the model.
        // Triggers `"change"` events for each removed attribute and a general `"change"` event,
        // unless `options.silent` is `true`.
        clear : function(options) {
            options || (options = {}); // Ensure `options` object exists.
            var attr;
            var old = this.attributes; // Reference to the old attributes for event triggering.

            // Prepare a validation object where all old attributes are set to `undefined`.
            var validObj = {};
            for  (attr in old) validObj[attr] = void 0;

            // Perform validation if defined and not silenced. If validation fails, return `false`.
            if  (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

            this.attributes = {}; // Reset `attributes` to an empty object.
            this._escapedAttributes = {}; // Clear all cached escaped values.
            this._changed = true; // Mark the model as having changed.

            // Trigger change events for each attribute that was cleared, if not silent.
            if  (!options.silent)  {
                for  (attr in old)  {
                    this.trigger('change:' + attr, this, void 0, options);
                }
                this.change(options); // Trigger the general model change event.
            }
            return this; // Return `this` to enable method chaining.
        },

        // Fetches the model's data from the server.
        // If the server's representation of the model differs from its current attributes,
        // the model's attributes will be updated, triggering a `"change"` event.
        fetch : function(options) {
            options || (options = {}); // Ensure `options` object exists.
            var model = this;
            var success = options.success; // Store the original success callback if provided.

            options.success = function(resp, status, xhr) {
                // Parse the response from the server and set the model's attributes.
                // If `set` fails (e.g., due to validation), return `false`.
                if  (!model.set(model.parse(resp, xhr), options)) return false;
                if  (success) success(model, resp); // Call the original success callback.
            };

            options.error = wrapError(options.error, model, options); // Wrap the error callback for consistent handling.

            // Execute the sync operation (read). Use model's `sync` or `Backbone.sync` as fallback.
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },

        // Saves the model's attributes to the server.
        // If `attrs` are provided, they are first `set` on the model.
        // If the server returns an attributes hash that differs, the model's state
        // will be `set` again with the server's response.
        save : function(attrs, options) {
            options || (options = {}); // Ensure `options` object exists.
            // If `attrs` are provided, set them first. If `set` fails (e.g., validation), return `false`.
            if  (attrs && !this.set(attrs, options)) return false;

            var model = this;
            var success = options.success; // Store the original success callback.

            options.success = function(resp, status, xhr) {
                // Parse the response from the server and set the model's attributes.
                // If `set` fails, return `false`.
                if  (!model.set(model.parse(resp, xhr), options)) return false;
                if  (success) success(model, resp, xhr); // Call the original success callback.
            };

            options.error = wrapError(options.error, model, options); // Wrap the error callback.

            // Determine the HTTP method: 'create' if the model is new, 'update' otherwise.
            var method = this.isNew() ? 'create' : 'update';

            // Execute the sync operation.
            return (this.sync || Backbone.sync).call(this, method, this, options);
        },

        // Destroys this model on the server if it was already persisted (i.e., is not new).
        // Upon successful destruction, the model is removed from its collection, if it has one.
        // Triggers a `"destroy"` event on the model.
        destroy : function(options) {
            options || (options = {}); // Ensure `options` object exists.

            // If the model is new, it doesn't exist on the server, so just trigger the destroy event locally.
            if  (this.isNew()) return this.trigger('destroy', this, this.collection, options);

            var model = this;
            var success = options.success; // Store the original success callback.

            options.success = function(resp) {
                model.trigger('destroy', model, model.collection, options); // Trigger the destroy event.
                if  (success) success(model, resp); // Call the original success callback.
            };

            options.error = wrapError(options.error, model, options); // Wrap the error callback.

            // Execute the sync operation ('delete').
            return (this.sync || Backbone.sync).call(this, 'delete', this, options);
        },

        // Generates the default URL for the model's representation on the server.
        // This method should be overridden if custom URL logic is needed for specific models.
        // If the model is new, it returns the base URL (either from its collection or `urlRoot`).
        // For existing models, it appends the model's `id` to the base URL.
        url : function() {
            var base = getUrl(this.collection) || this.urlRoot || urlError(); // Determine the base URL.
            if  (this.isNew()) return base; // If the model is new, just return the base URL.

            // Append the encoded ID to the base URL, ensuring a trailing slash if necessary.
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
        },

        // The `parse` method converts a server response into a hash of attributes to be `set` on the model.
        // The default implementation simply returns the response as is.
        // This method can be overridden in custom models to transform server data
        // (e.g., from XML to JSON, or to reformat keys) before it's applied.
        parse : function(resp, xhr) {
            return resp;
        },

        // Creates a new model instance with identical attributes to this one.
        // This performs a shallow clone of the attributes.
        clone : function() {
            return new this.constructor(this);
        },

        // Determines if the model is "new" (i.e., has not yet been saved to the server).
        // A model is considered new if its `id` attribute is `null` or `undefined`.
        isNew : function() {
            return this.id == null;
        },

        // Call this method to manually fire a `change` event for this model.
        // This is useful when attributes are modified directly without using `set`,
        // or when you want to force an update on observing objects (e.g., views).
        change : function(options) {
            this.trigger('change', this, options); // Trigger the general change event.
            this._previousAttributes = _.clone(this.attributes); // Update the snapshot for `hasChanged`.
            this._changed = false; // Reset the internal changed flag.
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that particular attribute has changed.
        // Otherwise, it checks if any attribute has changed.
        hasChanged : function(attr) {
            if  (attr) return this._previousAttributes[attr] != this.attributes[attr];
            return this._changed; // Return the overall `_changed` flag.
        },

        // Return an object containing all the attributes that have changed, or `false`
        // if there are no changed attributes.
        // This method is useful for determining what parts of a view need to be updated
        // and/or what attributes need to be persisted to the server.
        changedAttributes : function(now) {
            now || (now = this.attributes); // Use current attributes or a provided 'now' object for comparison.
            var old = this._previousAttributes; // Reference to the previous attributes snapshot.
            var changed = false; // Flag to track if any changes occurred.

            for  (var attr in now)  {
                // Compare current and previous values using Underscore's `isEqual` for deep comparison.
                if  (!_.isEqual(old[attr], now[attr]))  {
                    changed = changed || {}; // Initialize `changed` as an object if it's the first change found.
                    changed[attr] = now[attr]; // Record the changed attribute and its new value.
                }
            }
            return changed; // Return the object of changed attributes or `false` if no changes.
        },

        // Retrieves the previous value of a specified attribute.
        // This value is recorded at the time the last `"change"` event was fired.
        // Returns `null` if the attribute does not exist or if previous attributes are not available.
        previous : function(attr) {
            if  (!attr || !this._previousAttributes) return null;
            return this._previousAttributes[attr];
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event. Returns a cloned object to prevent direct modification.
        previousAttributes : function() {
            return _.clone(this._previousAttributes);
        },

        // Internal method to perform validation against a set of incoming attributes.
        // If the `validate` method (if defined on the model) returns an error,
        // it either calls the `options.error` callback or triggers a general `"error"` event.
        // Returns `true` if validation passes, `false` otherwise.
        _performValidation : function(attrs, options) {
            var error = this.validate(attrs); // Execute the custom validation logic defined on the model.

            if  (error)  {
                // If an error message or object is returned by `validate`.
                if  (options.error)  {
                    options.error(this, error, options); // Call the specific error callback provided in options.
                }
                else  {
                    this.trigger('error', this, error, options); // Trigger a general `"error"` event.
                }
                return false; // Validation failed.
            }
            return true; // Validation passed successfully.
        }

    });


    // --- Backbone.Collection Class ---
    // Represents an ordered set of models.
    // Collections provide functionality for managing lists of models, including adding, removing,
    // sorting, and fetching from a server.

    // Constructor for a new Collection instance.
    // `models` can be an initial array of models or plain JavaScript objects to be converted to models.
    // `options` can include a `comparator` for sorting the collection.
    Backbone.Collection = function(models, options) {
        options || (options = {}); // Ensure `options` object exists.
        // If a `comparator` is provided in options, set it on the collection instance.
        if  (options.comparator) this.comparator = options.comparator;

        // Bind internal event handlers (`_onModelEvent`, `_removeReference`)
        // to the collection instance to ensure correct `this` context.
        _.bindAll(this, '_onModelEvent', '_removeReference');

        this._reset(); // Initialize internal data structures like `models`, `_byId`, `_byCid`.

        // If initial models are provided, reset the collection with them silently.
        if  (models) this.reset(models, {silent: true});

        this.initialize.apply(this, arguments); // Call the custom initialization method (can be overridden).
    };

    // Define the inheritable methods for `Backbone.Collection`.
    _.extend(Backbone.Collection.prototype, Backbone.Events, {

        // The default model type for this collection is `Backbone.Model`.
        // This should typically be overridden in custom collections to specify
        // the concrete model class they contain (e.g., `model: App.Models.Task`).
        model : Backbone.Model,

        // An empty function by default. Developers should override this with custom setup logic
        // when extending `Backbone.Collection`. It is called at the end of the collection's constructor.
        initialize : function(){},

        // Returns a JSON representation of the collection.
        // This is an array where each element is the JSON representation of a model
        // within the collection, obtained by calling `model.toJSON()`.
        toJSON : function() {
            return this.map(function(model){ return model.toJSON(); });
        },

        // Adds a single model or a list of models to the collection.
        // Pass `options.silent: true` to prevent the `added` event from firing
        // for each newly added model.
        add : function(models, options) {
            // Handle an array of models.
            if  (_.isArray(models))  {
                for  (var i = 0, l = models.length; i < l; i++)  {
                    this._add(models[i], options); // Add each model individually.
                }
            }
            // Handle a single model.
            else  {
                this._add(models, options);
            }
            return this; // Return `this` to enable method chaining.
        },

        // Removes a single model or a list of models from the collection.
        // Pass `options.silent: true` to prevent the `removed` event from firing
        // for each model that is taken out of the collection.
        remove : function(models, options) {
            // Handle an array of models.
            if  (_.isArray(models))  {
                for  (var i = 0, l = models.length; i < l; i++)  {
                    this._remove(models[i], options); // Remove each model individually.
                }
            }
            // Handle a single model.
            else  {
                this._remove(models, options);
            }
            return this; // Return `this` to enable method chaining.
        },

        // Retrieves a model from the collection by its ID.
        // Can accept either the model's `id` or a model instance itself (it will extract the `id`).
        get : function(id) {
            if  (id == null) return null; // If no ID is provided, return null.
            // Access the internal `_byId` lookup table. Handle cases where `id` is a model instance.
            return this._byId[id.id != null ? id.id : id];
        },

        // Retrieves a model from the collection by its client ID (`cid`).
        // The `cid` is a unique identifier assigned by Backbone upon model creation.
        // Can accept either the model's `cid` or a model instance (it will extract the `cid`).
        getByCid : function(cid) {
            return cid && this._byCid[cid.cid || cid];
        },

        // Retrieves the model at a specific zero-based `index` within the collection's `models` array.
        at: function(index) {
            return this.models[index];
        },

        // Forces the collection to re-sort itself based on its `comparator`.
        // This method is generally not needed under normal circumstances, as the collection
        // maintains sort order automatically when items are added or removed.
        // Throws an error if no `comparator` is defined on the collection.
        // Triggers a `reset` event if not `options.silent`.
        sort : function(options) {
            options || (options = {}); // Ensure `options` object exists.
            if  (!this.comparator) throw new Error('Cannot sort a set without a comparator');

            // Use Underscore's `sortBy` to sort the models array based on the comparator.
            this.models = this.sortBy(this.comparator);

            // Trigger a `reset` event if the sort operation is not silent.
            if  (!options.silent) this.trigger('reset', this, options);
            return this; // Return `this` to enable method chaining.
        },

        // Extracts a specific `attr` (attribute) from each model in the collection.
        // Returns an array of these attribute values. This is a convenience method.
        pluck : function(attr) {
            return _.map(this.models, function(model){ return model.get(attr); });
        },

        // The following comment was incomplete in the original code, indicating
        // the end of the provided snippet for the cloning task.
        // When you have more items than you want to add or remove individually,