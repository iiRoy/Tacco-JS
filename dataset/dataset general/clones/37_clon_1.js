var ParsedError, PrettyError, RenderKid, array, defaultStyle, instance, nodePaths, object, prop, _fn, _i, _len, _ref, _ref1,
    __slice = [].slice, // This is a helper for array slicing
    __indexOf = [].indexOf || function (item) { // This provides indexOf compatibility
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) {
                return i;
            }
        }
        return -1;
    };


// Load utility modules
_ref = require('utila'),
object = _ref.object, // Object utilities
array = _ref.array;   // Array utilities


// Load local modules
defaultStyle = require('./default-style');

ParsedError  = require('./parsed-error');

nodePaths    = require('./node-paths');

// Load external rendering library
RenderKid    = require('renderkid');


instance = null; // Singleton instance of PrettyError


// Define the PrettyError class and export it
module.exports = PrettyError = (function () {

    var self; // Reference to the PrettyError constructor

    self = PrettyError;

    // Static filters for common string replacements
    PrettyError._filters = {
        'module.exports': function (item) {
            if (item.what == null) { // If 'what' property is undefined or null, do nothing
                return;
            }
            // Replace common module export patterns for cleaner output
            item.what = item.what.replace(/\.module\.exports\./g, ' - ');
        }
    };


    // Static method to get the default style configuration
    PrettyError._getDefaultStyle = function () {
        return defaultStyle();
    };


    // Starts the PrettyError instance, making it active for error stack formatting
    PrettyError.start = function () {
        if (instance == null) { // If no instance exists, create one
            instance = new self;
            instance.start(); // Initialize the new instance
        }
        return instance; // Return the active instance
    };


    // Stops PrettyError from intercepting error stack formatting
    PrettyError.stop = function () {
        // If an instance exists, stop it; otherwise, do nothing
        return instance != null ? instance.stop() : void 0;
    };


    // Constructor for PrettyError instances
    function PrettyError() {
        this._maxItems = 50;                 // Maximum number of stack trace items to display
        this._packagesToSkip = [];           // List of package names to skip
        this._pathsToSkip = [];              // List of file paths to skip
        this._skipCallbacks = [];            // Custom callback functions for skipping items
        this._filterCallbacks = [];          // Custom callback functions for filtering/modifying items
        this._parsedErrorFilters = [];       // Custom callback functions for filtering parsed errors
        this._aliases = [];                  // Aliases for paths in the stack trace
        this._renderer = new RenderKid;      // Renderer instance for styling output
        this._style = self._getDefaultStyle(); // Get the default style
        this._renderer.style(this._style);  // Apply the default style to the renderer
    }


    // Prototype method: Activates PrettyError's custom stack trace formatting
    PrettyError.prototype.start = function () {
        var prepeare; // Stores the original Error.prepareStackTrace

        // Save the original prepareStackTrace function
        this._oldPrepareStackTrace = Error.prepareStackTrace;

        // Define a fallback prepareStackTrace in case the original is null/undefined
        prepeare = this._oldPrepareStackTrace || function (exc, frames) {
            var result;
            result = exc.toString(); // Get the error message
            frames = frames.map(function (frame) {
                // Format each frame
                return "  at " + (frame.toString());
            });
            // Combine error message and formatted frames
            return result + "\n" + frames.join("\n");
        };

        // Override Error.prepareStackTrace
        Error.prepareStackTrace = (function (_this) {
            return function (exc, trace) {
                var stack;
                // Call the original (or fallback) prepareStackTrace
                stack = prepeare.apply(null, arguments);
                // Render the stack trace using PrettyError's renderer
                return _this.render({
                    stack: stack,
                    message: exc.toString().replace(/^.*: /, '') // Extract just the message
                }, false); // Do not log it immediately
            };
        })(this); // Bind 'this' to the current PrettyError instance

        return this; // Allow chaining
    };


    // Prototype method: Deactivates PrettyError's custom stack trace formatting
    PrettyError.prototype.stop = function () {
        // Restore the original prepareStackTrace function
        Error.prepareStackTrace = this._oldPrepareStackTrace;
        // Clear the stored original prepareStackTrace
        return this._oldPrepareStackTrace = null;
    };


    // Prototype method: Configures PrettyError settings
    PrettyError.prototype.config = function (c) {
        var alias, path, _ref1; // Local variables for iteration

        // Configure packages to skip
        if (c.skipPackages != null) {
            if (c.skipPackages === false) {
                this.unskipAllPackages();
            } else {
                this.skipPackage.apply(this, c.skipPackages);
            }
        }

        // Configure paths to skip
        if (c.skipPaths != null) {
            if (c.skipPaths === false) {
                this.unskipAllPaths();
            } else {
                this.skipPath.apply(this, c.skipPaths);
            }
        }

        // Configure custom skip callbacks
        if (c.skip != null) {
            if (c.skip === false) {
                this.unskipAll();
            } else {
                this.skip.apply(this, c.skip);
            }
        }

        // Set maximum number of items
        if (c.maxItems != null) {
            this.setMaxItems(c.maxItems);
        }

        // Configure skipping of Node.js internal files
        if (c.skipNodeFiles === true) {
            this.skipNodeFiles();
        } else if (c.skipNodeFiles === false) {
            this.unskipNodeFiles();
        }

        // Configure custom filter callbacks
        if (c.filters != null) {
            if (c.filters === false) {
                this.removeAllFilters();
            } else {
                this.filter.apply(this, c.filters);
            }
        }

        // Configure parsed error filter callbacks
        if (c.parsedErrorFilters != null) {
            if (c.parsedErrorFilters === false) {
                this.removeAllParsedErrorFilters();
            } else {
                this.filterParsedError.apply(this, c.parsedErrorFilters);
            }
        }

        // Configure path aliases
        if (c.aliases != null) {
            if (object.isBareObject(c.aliases)) {
                _ref1 = c.aliases;
                for (path in _ref1) { // Iterate over alias map
                    alias = _ref1[path];
                    this.alias(path, alias);
                }
            } else if (c.aliases === false) {
                this.removeAllAliases();
            }
        }

        return this; // Allow chaining
    };


    // Prototype method: Adds packages to the skip list
    PrettyError.prototype.skipPackage = function () {
        var packages, pkg, _i, _len;
        packages = 1 <= arguments.length ? __slice.call(arguments, 0) : []; // Collect all arguments

        for (_i = 0, _len = packages.length; _i < _len; _i++) {
            pkg = packages[_i];
            this._packagesToSkip.push(String(pkg)); // Add package name (as string)
        }
        return this;
    };


    // Prototype method: Removes packages from the skip list
    PrettyError.prototype.unskipPackage = function () {
        var packages, pkg, _i, _len;
        packages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = packages.length; _i < _len; _i++) {
            pkg = packages[_i];
            array.pluckOneItem(this._packagesToSkip, pkg); // Remove one instance of the package
        }
        return this;
    };


    // Prototype method: Clears all packages from the skip list
    PrettyError.prototype.unskipAllPackages = function () {
        this._packagesToSkip.length = 0; // Reset the array
        return this;
    };


    // Prototype method: Adds file paths to the skip list
    PrettyError.prototype.skipPath = function () {
        var path, paths, _i, _len;
        paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = paths.length; _i < _len; _i++) {
            path = paths[_i];
            this._pathsToSkip.push(path); // Add path
        }
        return this;
    };


    // Prototype method: Removes file paths from the skip list
    PrettyError.prototype.unskipPath = function () {
        var path, paths, _i, _len;
        paths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = paths.length; _i < _len; _i++) {
            path = paths[_i];
            array.pluckOneItem(this._pathsToSkip, path); // Remove one instance of the path
        }
        return this;
    };


    // Prototype method: Clears all paths from the skip list
    PrettyError.prototype.unskipAllPaths = function () {
        this._pathsToSkip.length = 0;
        return this;
    };


    // Prototype method: Adds custom skip callbacks
    PrettyError.prototype.skip = function () {
        var callbacks, cb, _i, _len;
        callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            this._skipCallbacks.push(cb); // Add callback function
        }
        return this;
    };


    // Prototype method: Removes custom skip callbacks
    PrettyError.prototype.unskip = function () {
        var callbacks, cb, _i, _len;
        callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            array.pluckOneItem(this._skipCallbacks, cb); // Remove one instance of the callback
        }
        return this;
    };


    // Prototype method: Clears all custom skip callbacks
    PrettyError.prototype.unskipAll = function () {
        this._skipCallbacks.length = 0;
        return this;
    };


    // Prototype method: Skips all known Node.js internal files
    PrettyError.prototype.skipNodeFiles = function () {
        return this.skipPath.apply(this, nodePaths); // Apply the nodePaths array to skipPath
    };


    // Prototype method: Unskips all known Node.js internal files
    PrettyError.prototype.unskipNodeFiles = function () {
        return this.unskipPath.apply(this, nodePaths); // Apply the nodePaths array to unskipPath
    };


    // Prototype method: Adds custom filter callbacks
    PrettyError.prototype.filter = function () {
        var callbacks, cb, _i, _len;
        callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            this._filterCallbacks.push(cb); // Add filter callback
        }
        return this;
    };


    // Prototype method: Removes custom filter callbacks
    PrettyError.prototype.removeFilter = function () {
        var callbacks, cb, _i, _len;
        callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            array.pluckOneItem(this._filterCallbacks, cb); // Remove one instance of the callback
        }
        return this;
    };


    // Prototype method: Clears all custom filter callbacks
    PrettyError.prototype.removeAllFilters = function () {
        this._filterCallbacks.length = 0;
        return this;
    };


    // Prototype method: Adds custom parsed error filter callbacks
    PrettyError.prototype.filterParsedError = function () {
        var callbacks, cb, _i, _len;
        callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            this._parsedErrorFilters.push(cb); // Add parsed error filter callback
        }
        return this;
    };


    // Prototype method: Removes custom parsed error filter callbacks
    PrettyError.prototype.removeParsedErrorFilter = function () {
        var callbacks, cb, _i, _len;
        callbacks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
            cb = callbacks[_i];
            array.pluckOneItem(this._parsedErrorFilters, cb); // Remove one instance of the callback
        }
        return this;
    };


    // Prototype method: Clears all custom parsed error filter callbacks
    PrettyError.prototype.removeAllParsedErrorFilters = function () {
        this._parsedErrorFilters.length = 0;
        return this;
    };


    // Prototype method: Sets the maximum number of stack trace items to display
    PrettyError.prototype.setMaxItems = function (maxItems) {
        if (maxItems == null) {
            maxItems = 50; // Default to 50 if null or undefined
        }
        if (maxItems === 0) {
            maxItems = 50; // Treat 0 as default
        }
        this._maxItems = maxItems | 0; // Ensure it's an integer
        return this;
    };


    // Prototype method: Adds a path alias
    PrettyError.prototype.alias = function (stringOrRx, alias) {
        this._aliases.push({
            stringOrRx: stringOrRx, // The string or regex to match
            alias: alias             // The replacement alias
        });
        return this;
    };


    // Prototype method: Removes a path alias
    PrettyError.prototype.removeAlias = function (stringOrRx) {
        array.pluckByCallback(this._aliases, function (pair) {
            return pair.stringOrRx === stringOrRx; // Find alias by its match string/regex
        });
        return this;
    };


    // Prototype method: Clears all path aliases
    PrettyError.prototype.removeAllAliases = function () {
        this._aliases.length = 0;
        return this;
    };


    // Internal method: Gets the current style configuration
    PrettyError.prototype._getStyle = function () {
        return this._style;
    };


    // Prototype method: Appends new styles to the existing configuration
    PrettyError.prototype.appendStyle = function (toAppend) {
        object.appendOnto(this._style, toAppend); // Merge new styles into the current style
        this._renderer.style(toAppend);           // Apply the new styles to the renderer
        return this;
    };


    // Internal method: Gets the RenderKid renderer instance
    PrettyError.prototype._getRenderer = function () {
        return this._renderer;
    };


    // Prototype method: Renders an error object
    PrettyError.prototype.render = function (e, logIt) {
        var obj, rendered; // Variables for processed object and rendered string

        if (logIt == null) {
            logIt = false; // Default to not logging
        }

        obj = this.getObject(e);       // Get the structured object representation of the error
        rendered = this._renderer.render(obj); // Render the object using RenderKid

        if (logIt === true) {
            console.error(rendered); // Log to console.error if requested
        }
        return rendered; // Return the rendered string
    };


    // Prototype method: Converts an error into a structured object for rendering
    PrettyError.prototype.getObject = function (e) {
        var count, header, i, item, obj, traceItems, _i, _len, _ref1; // Local variables for processing

        // Ensure 'e' is a ParsedError instance
        if (!(e instanceof ParsedError)) {
            e = new ParsedError(e);
        }

        this._applyParsedErrorFiltersOn(e); // Apply filters to the parsed error

        // Construct the header object
        header = {
            title: (function () {
                var ret;
                ret = {};
                if (e.wrapper !== '') {
                    ret.wrapper = "" + e.wrapper; // Add wrapper if present
                }
                ret.kind = e.kind; // Error kind (e.g., 'Error', 'TypeError')
                return ret;
            })(),
            colon: ':',
            message: String(e.message).trim() // Trim error message
        };

        traceItems = []; // Array to hold formatted stack trace items
        count = -1;      // Counter for displayed items

        _ref1 = e.trace; // Reference to the raw trace array
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
            item = _ref1[i]; // Current trace item

            if (item == null) {
                continue; // Skip null or undefined items
            }

            // Apply skip/filter logic
            if (this._skipOrFilter(item, i) === true) {
                continue; // Skip this item
            }

            count++; // Increment displayed item count
            if (count > this._maxItems) {
                break; // Stop if max items reached
            }

            if (typeof item === 'string') {
                traceItems.push({
                    item: {
                        custom: item // Treat as a custom string item
                    }
                });
                continue;
            }

            // Format standard trace item
            traceItems.push({
                item: {
                    header: {
                        pointer: (function () {
                            if (item.file == null) {
                                return ''; // No file information
                            }
                            return {
                                file: item.file,
                                colon: ':',
                                line: item.line // File and line number
                            };
                        })(),
                        what: item.what // Function/method name
                    },
                    footer: (function () {
                        var foooter;
                        foooter = {
                            addr: item.shortenedAddr // Shortened address/path
                        };
                        if (item.extra != null) {
                            foooter.extra = item.extra; // Additional info
                        }
                        return foooter;
                    })()
                }
            });
        }

        // Construct the final output object
        obj = {
            'pretty-error': {
                header: header
            }
        };

        if (traceItems.length > 0) {
            obj['pretty-error'].trace = traceItems; // Add trace if items exist
        }

        return obj; // Return the structured object
    };


    // Internal method: Determines if a trace item should be skipped or applies filters
    PrettyError.prototype._skipOrFilter = function (item, itemNumber) {
        var cb, modName, pair, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;

        if (typeof item === 'object') {
            // Check against packages to skip
            if (_ref1 = item.modName, __indexOf.call(this._packagesToSkip, _ref1) >= 0) {
                return true;
            }
            // Check against paths to skip
            if (_ref2 = item.path, __indexOf.call(this._pathsToSkip, _ref2) >= 0) {
                return true;
            }
            // Check against packages within the item's context
            _ref3 = item.packages;
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
                modName = _ref3[_i];
                if (__indexOf.call(this._packagesToSkip, modName) >= 0) {
                    return true;
                }
            }

            // Apply path aliases
            if (typeof item.shortenedAddr === 'string') {
                _ref4 = this._aliases;
                for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
                    pair = _ref4[_j];
                    item.shortenedAddr = item.shortenedAddr.replace(pair.stringOrRx, pair.alias);
                }
            }
        }

        // Apply custom skip callbacks
        _ref5 = this._skipCallbacks;
        for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
            cb = _ref5[_k];
            if (cb(item, itemNumber) === true) {
                return true; // Skip if callback returns true
            }
        }

        // Apply custom filter callbacks (do not skip based on these)
        _ref6 = this._filterCallbacks;
        for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
            cb = _ref6[_l];
            cb(item, itemNumber); // Call filter, it modifies item in place
        }

        return false; // Do not skip this item
    };


    // Internal method: Applies parsed error filters to the error object
    PrettyError.prototype._applyParsedErrorFiltersOn = function (error) {
        var cb, _i, _len, _ref1;

        _ref1 = this._parsedErrorFilters;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            cb = _ref1[_i];
            cb(error); // Call filter, it modifies error in place
        }
    };


    return PrettyError; // Return the constructor

})();


// Dynamically create getters for 'renderer' and 'style' properties
_ref1 = ['renderer', 'style']; // Properties to create getters for
_fn = function () {
    var methodName;
    // Construct the internal getter method name (e.g., '_getRenderer')
    methodName = '_get' + prop[0].toUpperCase() + prop.substr(1, prop.length);
    // Define a getter on the prototype for the property
    return PrettyError.prototype.__defineGetter__(prop, function () {
        return this[methodName](); // Call the internal getter method
    });
};

// Iterate over the properties and create getters
for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    prop = _ref1[_i]; // Current property name
    _fn();            // Execute the function to define the getter
}