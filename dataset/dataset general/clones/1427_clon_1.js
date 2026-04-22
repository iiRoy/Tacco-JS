var require = window.require =
  function (file, cwd)
  {
    // Resolve the module path based on the current working directory.
    var resolved = require.resolve(file, cwd || '/');

    // Retrieve the module's definition.
    var mod = require.modules[resolved];

    // If the module is not found, throw an error.
    if (!mod) {
      throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
      );
    }

    // Check if the module is already cached.
    var cached = require.cache[resolved];

    // If cached, return its exports; otherwise, execute the module function.
    var res = cached ? cached.exports : mod();

    // Return the module's exports.
    return res;
  };

/*
 * Initialize core properties of the 'require' object.
 * These are used for module resolution and management.
 */
require.paths = []; // List of paths to search for modules (currently empty)
require.modules = {}; // Cache for module definitions (functions that return exports)
require.cache = {}; // Cache for module exports (after they have been executed)
require.extensions = [".js", ".coffee"]; // Supported file extensions for modules

require._core =
  {
    'assert': true, // Indicates that 'assert' is a core module
    'events': true, // Indicates that 'events' is a core module
    'fs': true, // Indicates that 'fs' is a core module
    'path': true, // Indicates that 'path' is a core module
    'vm': true // Indicates that 'vm' is a core module
  };


require.resolve =
  (function ()
  {
    // This immediately-invoked function expression (IIFE) encapsulates the resolve logic.
    return function (x, cwd)
    {
      // Ensure cwd has a default value if not provided.
      if (!cwd) {
        cwd = '/';
      }

      // Check if the module is one of the predefined core modules.
      if (require._core[x]) {
        return x;
      }

      // Get the 'path' module for path manipulation.
      var path = require.modules.path();

      // Resolve the current working directory against the root.
      cwd = path.resolve('/', cwd);

      // Use the resolved cwd or fallback to root.
      var y = cwd || '/';

      // Check if the module path starts with '.', '..', or '/'.
      if (x.match(/^(?:\.\.?\/|\/)/)) {
        // Try to load as a file or directory.
        var m = loadAsFileSync(path.resolve(y, x))
          || loadAsDirectorySync(path.resolve(y, x));
        if (m) {
          return m;
        }
      }

      // If not resolved, try loading from node_modules.
      var n = loadNodeModulesSync(x, y);
      if (n) {
        return n;
      }

      // If all attempts fail, throw an error.
      throw new Error("Cannot find module '" + x + "'");

      /**
       * Attempts to load a module as a file.
       * @param {string} x - The potential file path.
       * @returns {string|undefined} The resolved path if found, otherwise undefined.
       */
      function loadAsFileSync (x)
      {
        // Normalize the path for consistent lookup.
        x = path.normalize(x);

        // Check if the exact path exists in modules.
        if (require.modules[x]) {
          return x;
        }

        // Try appending known extensions.
        for (var i = 0; i < require.extensions.length; i++) {
          var ext = require.extensions[i];
          if (require.modules[x + ext]) {
            return x + ext;
          }
        }
        // No file found with given path or extensions.
        return;
      }

      /**
       * Attempts to load a module as a directory.
       * This involves checking for a package.json 'main' field or an 'index.js' file.
       * @param {string} x - The potential directory path.
       * @returns {string|undefined} The resolved path if found, otherwise undefined.
       */
      function loadAsDirectorySync (x)
      {
        // Remove trailing slashes for consistent directory handling.
        x = x.replace(/\/+$/, '');

        // Construct the path to package.json.
        var pkgfile = path.normalize(x + '/package.json');

        // Check if package.json exists.
        if (require.modules[pkgfile]) {
          var pkg = require.modules[pkgfile](); // Execute package.json module to get its contents.
          var b = pkg.browserify; // Check for browserify-specific main field.

          // Handle browserify 'main' field if it's an object.
          if (typeof b === 'object' && b.main) {
            var m = loadAsFileSync(path.resolve(x, b.main));
            if (m) {
              return m;
            }
          }
          // Handle browserify 'main' field if it's a string.
          else if (typeof b === 'string') {
            var m = loadAsFileSync(path.resolve(x, b));
            if (m) {
              return m;
            }
          }
          // Fallback to standard 'main' field.
          else if (pkg.main) {
            var m = loadAsFileSync(path.resolve(x, pkg.main));
            if (m) {
              return m;
            }
          }
        }

        // If package.json doesn't resolve or exist, try 'index' file.
        return loadAsFileSync(x + '/index');
      }

      /**
       * Attempts to load a module from 'node_modules' directories.
       * @param {string} x - The module name.
       * @param {string} start - The starting directory for searching 'node_modules'.
       * @returns {string|undefined} The resolved path if found, otherwise undefined.
       */
      function loadNodeModulesSync (x, start)
      {
        // Get all possible 'node_modules' paths.
        var dirs = nodeModulesPathsSync(start);

        // Iterate through each 'node_modules' directory.
        for (var i = 0; i < dirs.length; i++) {
          var dir = dirs[i];

          // Try loading as a file within the node_modules directory.
          var m = loadAsFileSync(dir + '/' + x);
          if (m) {
            return m;
          }

          // Try loading as a directory within the node_modules directory.
          var n = loadAsDirectorySync(dir + '/' + x);
          if (n) {
            return n;
          }
        }

        // Finally, try loading the module directly from the current context as a file.
        // This is a fallback for modules that might be globally available or in the root.
        var m = loadAsFileSync(x);
        if (m) {
          return m;
        }

        // Module not found in any node_modules location.
        return;
      }

      /**
       * Generates a list of potential 'node_modules' paths to search,
       * starting from a given directory and moving up the directory tree.
       * @param {string} start - The starting directory.
       * @returns {Array<string>} An array of 'node_modules' paths.
       */
      function nodeModulesPathsSync (start)
      {
        var parts;
        // Handle root path specifically.
        if (start === '/') {
          parts = [''];
        }
        else {
          // Normalize the path and split into components.
          parts = path.normalize(start).split('/');
        }

        var dirs = [];
        // Iterate from the current directory up to the root.
        for (var i = parts.length - 1; i >= 0; i--) {
          // Skip 'node_modules' itself if it's part of the path.
          if (parts[i] === 'node_modules') {
            continue;
          }
          // Construct the 'node_modules' path for the current level.
          var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
          dirs.push(dir);
        }

        return dirs;
      }
    };
  })();

/*
 * Defines an alias for a module.
 * This allows one module path to effectively point to another.
 */
require.alias = function (from, to)
{
  var path = require.modules.path(); // Access the path module.
  var res = null; // Variable to store the resolved 'from' path.

  try {
    // Try to resolve 'from' as a package.json file.
    res = require.resolve(from + '/package.json', '/');
  }
  catch (err) {
    // If that fails, try resolving 'from' directly.
    res = require.resolve(from, '/');
  }

  // Determine the base directory of the resolved 'from' module.
  var basedir = path.dirname(res);

  // Get all keys (module filenames) from the modules cache.
  var keys = (Object.keys || function (obj)
  {
    var res = [];
    for (var key in obj) {
      res.push(key);
    }
    return res;
  })(require.modules);

  // Iterate through all existing module keys.
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    // If a module's key starts with the basedir plus a slash,
    // it means it's a file within the aliased module's directory.
    if (key.slice(0, basedir.length + 1) === basedir + '/') {
      var f = key.slice(basedir.length); // Get the relative path part.
      // Create an alias for this specific file.
      require.modules[to + f] = require.modules[basedir + f];
    }
    // If the key is exactly the basedir, alias the main module itself.
    else if (key === basedir) {
      require.modules[to] = require.modules[basedir];
    }
  }
};

/*
 * This IIFE sets up the `require.define` function,
 * which is used to register new modules.
 */
(function ()
{
  var process = {}; // Local 'process' object, will be populated if __browserify_process is defined.

  require.define = function (filename, fn)
  {
    // If the browserify process module is available, load it.
    if (require.modules.__browserify_process) {
      process = require.modules.__browserify_process();
    }

    // Determine the dirname for the current module.
    // Core modules have an empty dirname.
    var dirname = require._core[filename]
      ? ''
      : require.modules.path().dirname(filename)
      ;

    // Create a local `require_` function for the module's scope.
    // This `require_` is context-aware (uses the module's dirname).
    var require_ = function (file)
    {
      return require(file, dirname);
    };

    // Attach `resolve`, `modules`, `define`, and `cache` to the local `require_`.
    require_.resolve = function (name)
    {
      return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    require_.cache = require.cache;

    // Initialize a module object with an empty exports object.
    var module_ = { exports: {} };

    // Store the module definition function.
    // When this module is required, this function will be executed.
    require.modules[filename] = function ()
    {
      // Cache the module object before execution.
      require.cache[filename] = module_;

      // Execute the module's function with appropriate context and arguments.
      fn.call(
        this,
        require_, // Local require function
        module_, // Module object
        module_.exports, // Exports object
        dirname, // __dirname equivalent
        filename, // __filename equivalent
        process // Process object
      );
      // Return the module's exports.
      return module_.exports;
    };
  };
})();


require.define("path", function (require, module, exports, __dirname, __filename, process)
{
  /**
   * Filters an array based on a provided function.
   * @param {Array} xs - The array to filter.
   * @param {Function} fn - The filtering function.
   * @returns {Array} The filtered array.
   */
  function filter (xs, fn)
  {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
      if (fn(xs[i], i, xs)) {
        res.push(xs[i]);
      }
    }
    return res;
  }

  // resolves . and .. elements in a path array with directory names there
  // must be no slashes, empty elements, or device names (c:\) in the array
  // (so also no leading and trailing slashes - it does not distinguish
  // relative and absolute paths)
  /**
   * Normalizes an array of path parts by resolving '.' and '..' segments.
   * @param {Array<string>} parts - An array of path segments.
   * @param {boolean} allowAboveRoot - Whether to allow '..' to go above the root.
   * @returns {Array<string>} The normalized array of path segments.
   */
  function normalizeArray (parts, allowAboveRoot)
  {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) { // Iterate from end to beginning.
      var last = parts[i];
      if (last == '.') {
        parts.splice(i, 1); // Remove '.' segments.
      }
      else if (last === '..') {
        parts.splice(i, 1); // Remove '..' segment.
        up++; // Increment 'up' counter.
      }
      else if (up) {
        parts.splice(i, 1); // Remove current segment if 'up' is active.
        up--; // Decrement 'up' counter.
      }
    }

    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (; up--; up) { // Loop 'up' times.
        parts.unshift('..'); // Add '..' to the beginning.
      }
    }

    return parts;
  }

  // Regex to split a filename into [*, dir, basename, ext]
  // posix version
  var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

  // path.resolve([from ...], to)
  // posix version
  /**
   * Resolves a sequence of paths or path segments into an absolute path.
   * @param {...string} args - Path segments to resolve.
   * @returns {string} The resolved absolute path.
   */
  exports.resolve = function ()
  {
    var resolvedPath = '',
      resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0)
        ? arguments[i]
        : process.cwd(); // If no path, use current working directory.

      // Skip empty and invalid entries
      if (typeof path !== 'string' || !path) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath; // Prepend path segment.
      resolvedAbsolute = path.charAt(0) === '/'; // Check if segment is absolute.
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p)
    {
      return !!p; // Remove empty segments.
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };

  // path.normalize(path)
  // posix version
  /**
   * Normalizes the given path, resolving '..' and '.' segments.
   * @param {string} path - The path to normalize.
   * @returns {string} The normalized path.
   */
  exports.normalize = function (path)
  {
    var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.slice(-1) === '/';

    // Normalize the path
    path = normalizeArray(filter(path.split('/'), function (p)
    {
      return !!p; // Remove empty segments.
    }), !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.'; // If path is empty and relative, it's '.'.
    }
    if (path && trailingSlash) {
      path += '/'; // Restore trailing slash if originally present.
    }

    return (isAbsolute ? '/' : '') + path;
  };


  // posix version
  /**
   * Joins all given path segments together, then normalizes the resulting path.
   * @param {...string} args - Path segments to join.
   * @returns {string} The joined and normalized path.
   */
  exports.join = function ()
  {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(filter(paths, function (p, index)
    {
      return p && typeof p === 'string'; // Filter out non-string or empty paths.
    }).join('/'));
  };


  /**
   * Returns the directory name of a path.
   * @param {string} path - The path.
   * @returns {string} The directory name.
   */
  exports.dirname = function (path)
  {
    var dir = splitPathRe.exec(path)[1] || ''; // Extract directory part using regex.
    var isWindows = false; // This is a POSIX implementation, so isWindows is always false.
    if (!dir) {
      // No dirname found.
      return '.';
    }
    else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
      // It is just a slash or a drive letter with a slash.
      return dir;
    }
    else {
      // It is a full dirname, strip trailing slash.
      return dir.substring(0, dir.length - 1);
    }
  };


  /**
   * Returns the last portion of a path.
   * @param {string} path - The path.
   * @param {string} [ext] - An optional file extension to remove.
   * @returns {string} The basename.
   */
  exports.basename = function (path, ext)
  {
    var f = splitPathRe.exec(path)[2] || ''; // Extract basename part.
    // TODO: make this comparison case-insensitive on windows?
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length); // Remove extension if it matches.
    }
    return f;
  };


  /**
   * Returns the extension of the path.
   * @param {string} path - The path.
   * @returns {string} The extension, including the leading dot.
   */
  exports.extname = function (path)
  {
    return splitPathRe.exec(path)[3] || ''; // Extract extension part.
  };
});

require.define("__browserify_process", function (require, module, exports, __dirname, __filename, process)
{
  var process = module.exports = {}; // Export an empty object, then populate it.

  process.nextTick = (function ()
  {
    var queue = []; // Queue for functions to be executed on the next tick.
    var canPost = typeof window !== 'undefined'
      && window.postMessage && window.addEventListener
      ; // Feature detection for postMessage.

    if (canPost) {
      // Use postMessage for efficient microtask scheduling in browsers.
      window.addEventListener('message', function (ev)
      {
        if (ev.source === window && ev.data === 'browserify-tick') {
          ev.stopPropagation(); // Prevent other listeners from processing this message.
          if (queue.length > 0) {
            var fn = queue.shift(); // Get the next function from the queue.
            fn(); // Execute it.
          }
        }
      }, true);
    }

    return function (fn)
    {
      if (canPost) {
        queue.push(fn); // Add function to queue.
        window.postMessage('browserify-tick', '*'); // Trigger message event.
      }
      else {
        setTimeout(fn, 0); // Fallback to setTimeout(0) for other environments.
      }
    };
  })();

  process.title = 'browser'; // Set process title for browser environment.
  process.browser = true; // Indicate that this is a browser process.
  process.env = {}; // Empty environment variables object.
  process.argv = []; // Empty argument vector.

  process.binding = function (name)
  {
    if (name === 'evals') {
      return (require)('vm'); // Special handling for 'evals' binding.
    }
    else {
      throw new Error('No such module. (Possibly not yet loaded)'); // Throw error for unknown bindings.
    }
  };

  (function ()
  {
    var cwd = '/'; // Current working directory, defaults to root.
    var path; // Will store the path module.
    process.cwd = function () { return cwd }; // Getter for current working directory.
    process.chdir = function (dir)
    {
      if (!path) {
        path = require('path'); // Lazily load the path module.
      }
      cwd = path.resolve(dir, cwd); // Resolve new cwd relative to current cwd.
    };
  })();
});

require.define("/node_modules/underscore/package.json", function (require, module, exports, __dirname, __filename, process)
{
  module.exports = { "main": "underscore.js" }; // Defines the main entry point for the underscore package.
});

require.define("/node_modules/underscore/underscore.js", function (require, module, exports, __dirname, __filename, process)
{
  //     Underscore.js 1.4.4
  //     http://underscorejs.org
  //     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
  //     Underscore may be freely distributed under the MIT license.

  (function ()
  {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var push = ArrayProto.push,
      slice = ArrayProto.slice,
      concat = ArrayProto.concat,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
      nativeForEach = ArrayProto.forEach,
      nativeMap = ArrayProto.map,
      nativeReduce = ArrayProto.reduce,
      nativeReduceRight = ArrayProto.reduceRight,
      nativeFilter = ArrayProto.filter,
      nativeEvery = ArrayProto.every,
      nativeSome = ArrayProto.some,
      nativeIndexOf = ArrayProto.indexOf,
      nativeLastIndexOf = ArrayProto.lastIndexOf,
      nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeBind = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function (obj)
    {
      if (obj instanceof _) {
        return obj;
      }
      if (!(this instanceof _)) {
        return new _(obj);
      }
      this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = _;
      }
      exports._ = _;
    } else {
      root._ = _;
    }

    // Current version.
    _.VERSION = '1.4.4';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function (obj, iterator, context)
    {
      if (obj == null) {
        return;
      }
      if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
      }
      else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
          if (iterator.call(context, obj[i], i, obj) === breaker) {
            return;
          }
        }
      }
      else {
        for (var key in obj) {
          if (_.has(obj, key)) {
            if (iterator.call(context, obj[key], key, obj) === breaker) {
              return;
            }
          }
        }
      }
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function (obj, iterator, context)
    {
      var results = [];
      if (obj == null) {
        return results;
      }
      if (nativeMap && obj.map === nativeMap) {
        return obj.map(iterator, context);
      }
      each(obj, function (value, index, list)
      {
        results[results.length] = iterator.call(context, value, index, list);
      });
      return results;
    };

    var reduceError = 'Reduce of empty array with no initial value';

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context)
    {
      var initial = arguments.length > 2;
      if (obj == null) {
        obj = [];
      }
      if (nativeReduce && obj.reduce === nativeReduce) {
        if (context) {
          iterator = _.bind(iterator, context);
        }
        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
      }
      each(obj, function (value, index, list)
      {
        if (!initial) {
          memo = value;
          initial = true;
        }
        else {
          memo = iterator.call(context, memo, value, index, list);
        }
      });
      if (!initial) {
        throw new TypeError(reduceError);
      }
      return memo;
    };

    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    _.reduceRight = _.foldr = function (obj, iterator, memo, context)
    {
      var initial = arguments.length > 2;
      if (obj == null) {
        obj = [];
      }
      if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
        // ... (rest of the Underscore code, unchanged identifiers/logic)
        // This is a placeholder as the original code snippet ends here.
        // The instruction is to generate a Type I clone of the *provided* code.
        // So I should end here as well.
      }
    };
  })();
});