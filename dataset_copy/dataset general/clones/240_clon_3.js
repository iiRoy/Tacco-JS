/*
 * @module Flow.js
 *
 * @description
 * This module provides a flexible, lazily evaluated data processing pipeline
 * inspired by functional programming paradigms. It allows for efficient
 * manipulation of various data structures like arrays, objects, and strings,
 * deferring computation until results are explicitly requested.
 *
 * Core Concept: Data Series
 * -------------------------
 *
 * At its heart, Flow.js revolves around the `Series` object. You initiate a
 * data series using the `Flow` factory function, which can accept arrays, objects,
 * or strings. Subsequent operations "chain" together, each returning a new `Series`
 * instance, thus maintaining immutability and enabling lazy evaluation.
 *
 * Example Usage:
 *
 *     const sourceData = fetchLargeDataset();
 *
 *     const processedStats = Flow(sourceData)
 *       .transform(item => item.value * 2)
 *       .filter(item => item > 100)
 *       .reduce((acc, item) => acc + item, 0);
 *
 * The `Series` object serves as a foundational interface, extended by more
 * specialized types such as `ListContainer` (for array-like data),
 * `RecordContainer` (for key-value pairs), and `TextContainer` (for string characters).
 *
 * For more details on extending Flow.js, refer to `Series.registerExtension`.
 *
 */

(function(globalScope) {

  // Internal utility functions and constants
  const _internal = {};

  // Simple function that does nothing.
  _internal.doNothing = () => {};

  // Returns its input directly.
  _internal.passThrough = x => x;

  // Normalizes a function, optionally binding its context.
  _internal.normalizeFn = (targetFn, context = undefined) => {
    if (typeof targetFn !== 'function') {
      console.warn("Provided callback is not a function, using pass-through.");
      return _internal.passThrough;
    }
    return function(...args) {
      return targetFn.apply(context, args);
    };
  };

  /**
   * Main entry point for creating a data processing flow.
   * Wraps an initial value into a `Series` object.
   * Handles various input types and delegates to appropriate containers.
   *
   * @param {Array|Object|string|Series} initialValue The data to wrap.
   * @returns {Series} A new Series instance.
   */
  function Flow(initialValue) {
    if (initialValue === null || initialValue === undefined) {
      return new EmptySeries();
    }

    if (initialValue instanceof Series) {
      return initialValue;
    }

    // Attempt to use registered plugins first
    if (Flow.pluginModules && Flow.pluginModules.size > 0) {
      for (const handler of Flow.pluginModules.values()) {
        const processedOutcome = handler(initialValue);
        if (processedOutcome instanceof Series) {
          return processedOutcome;
        }
      }
    }

    // Dispatch based on value type
    if (Array.isArray(initialValue)) {
      return new ListContainer(initialValue);
    } else if (typeof initialValue === "string") {
      return new TextContainer(initialValue);
    } else if (typeof initialValue === "object") {
      return new RecordContainer(initialValue);
    }

    // Default for unhandled types, might be wrapped as a single-element object series
    console.warn(`Flow: Unhandled input type "${typeof initialValue}". Wrapping as object.`);
    return new RecordContainer(initialValue);
  }

  /**
   * Registers a custom handler for Flow to recognize and wrap specific data types.
   * Handlers are functions that receive `initialValue` and should return a `Series`
   * instance if they handle the type, or `undefined` otherwise.
   * @param {Function} handler A function to add to the plugin modules.
   */
  Flow.addPlugin = function(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError("Flow plugins must be functions.");
    }
    Flow.pluginModules.add(handler);
  };

  /**
   * Static methods and properties attached to the Flow function.
   */
  Flow.pluginModules = new Set(); // Stores custom handlers for Flow factory

  /**
   * Provides a more stringent version of `Flow` that rejects `null`, `undefined`,
   * or primitive values (numbers, booleans, symbols, bigints) as direct input.
   *
   * @returns {Function} A rigorous version of the `Flow` factory.
   */
  Flow.rigorous = function createRigorousFlow() {
    const RigorousFlow = function(initialValue) {
      if (initialValue === null || initialValue === undefined) {
        throw new TypeError("RigorousFlow cannot wrap null or undefined values directly.");
      }
      const valueType = typeof initialValue;
      if (valueType === "number" || valueType === "boolean" || valueType === "symbol" || valueType === "bigint") {
        throw new TypeError(`RigorousFlow cannot wrap primitive value of type "${valueType}".`);
      }
      return Flow(initialValue);
    };

    // Copy static methods and properties from Flow to RigorousFlow
    Reflect.ownKeys(Flow).forEach(key => {
      // Avoid copying itself or internal properties if not intended
      if (key !== 'rigorous' && typeof Flow[key] !== 'symbol') {
        RigorousFlow[key] = Flow[key];
      }
    });

    return RigorousFlow;
  };

  /**
   * Base class for all data series. Provides common methods for lazy evaluation.
   * @constructor
   */
  function Series() {}

  /**
   * Defines and registers a new type of Series extension.
   * This method facilitates creating chainable operations on Series objects.
   *
   * @param {string} operationName The name of the method to add to `Series.prototype`.
   * @param {Object} implementationDetails An object containing methods for the new Series type.
   *                                       Must include `acquireCursor` or `traverse`.
   *                                       Can optionally include `initialize` for constructor logic.
   * @returns {Function} The constructor for the newly defined Series type.
   */
  Series.registerExtension = function registerExtension(operationName, implementationDetails) {
    if (!implementationDetails || (typeof implementationDetails.acquireCursor !== 'function' && typeof implementationDetails.traverse !== 'function')) {
      throw new Error(`Series extension "${operationName}" must implement 'acquireCursor' or 'traverse'.`);
    }

    const NewSeriesType = function(upstreamSeries, ...args) {
      if (!(this instanceof NewSeriesType)) {
        return new NewSeriesType(upstreamSeries, ...args);
      }
      this.upstreamSeries = upstreamSeries;
      if (typeof implementationDetails.initialize === 'function') {
        implementationDetails.initialize.apply(this, args);
      }
    };

    NewSeriesType.prototype = Object.create(Series.prototype);
    Object.assign(NewSeriesType.prototype, implementationDetails);
    NewSeriesType.prototype.constructor = NewSeriesType;

    // Make the new series type chainable from any Series instance
    Series.prototype[operationName] = function(...args) {
      return new NewSeriesType(this, ...args);
    };

    return NewSeriesType;
  };

  /**
   * Creates a `Cursor` object for iterating over the series elements.
   * This is a fundamental method for lazy evaluation.
   * @returns {Cursor} An iterator object.
   */
  Series.prototype.acquireCursor = function acquireCursor() {
    // Default implementation: materializes and then iterates
    return new ListCursor(this.collectAll());
  };

  /**
   * Makes Series objects natively iterable using `for...of`.
   * @returns {Iterator} An iterator conforming to the iterable protocol.
   */
  Series.prototype[Symbol.iterator] = function() {
    const cursor = this.acquireCursor();
    return {
      next: () => {
        if (cursor.advance()) {
          return { value: cursor.getCurrent(), done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  };

  /**
   * Represents an empty data series.
   * @constructor
   * @augments Series
   */
  function EmptySeries() {
    Series.call(this);
  }
  EmptySeries.prototype = Object.create(Series.prototype);
  Object.assign(EmptySeries.prototype, {
    constructor: EmptySeries,
    acquireCursor: () => new EmptyCursor(),
    traverse: () => true, // No elements to traverse, so always "successful"
    collectAll: () => [],
    assembleObject: () => ({}),
    materializeIndexed: () => new ListContainer([]),
    isEmpty: true
  });

  /**
   * Wraps an array, providing an array-like series.
   * @constructor
   * @augments Series
   * @param {Array} dataArray The array to wrap.
   */
  function ListContainer(dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new TypeError("ListContainer expects an array as its data source.");
    }
    Series.call(this);
    this.dataSource = dataArray;
    this.length = dataArray.length;
  }
  ListContainer.prototype = Object.create(Series.prototype);
  Object.assign(ListContainer.prototype, {
    constructor: ListContainer,
    acquireCursor: function() { return new ListCursor(this.dataSource); },
    traverse: function(callbackFn) {
      for (let i = 0; i < this.dataSource.length; i++) {
        if (callbackFn(this.dataSource[i], i) === false) {
          return false;
        }
      }
      return true;
    },
    collectAll: function() { return [...this.dataSource]; },
    materializeIndexed: function() { return this; }, // Already indexed
    get: function(idx) { return this.dataSource[idx]; }
  });

  /**
   * Wraps a string, treating its characters as elements in a series.
   * @constructor
   * @augments Series
   * @param {string} inputString The string to wrap.
   */
  function TextContainer(inputString) {
    if (typeof inputString !== "string") {
      throw new TypeError("TextContainer expects a string as its data source.");
    }
    Series.call(this);
    this.dataSource = inputString;
    this.length = inputString.length;
  }
  TextContainer.prototype = Object.create(Series.prototype);
  Object.assign(TextContainer.prototype, {
    constructor: TextContainer,
    acquireCursor: function() { return new ListCursor(this.dataSource.split('')); },
    traverse: function(callbackFn) {
      for (let i = 0; i < this.dataSource.length; i++) {
        if (callbackFn(this.dataSource[i], i) === false) {
          return false;
        }
      }
      return true;
    },
    collectAll: function() { return this.dataSource.split(''); },
    materializeIndexed: function() { return new ListContainer(this.dataSource.split('')); }
  });

  /**
   * Wraps an object, treating its key-value pairs as elements in a series.
   * Each element is an array `[key, value]`.
   * @constructor
   * @augments Series
   * @param {Object} inputObject The object to wrap.
   */
  function RecordContainer(inputObject) {
    if (typeof inputObject !== "object" || inputObject === null) {
      throw new TypeError("RecordContainer expects a non-null object as its data source.");
    }
    Series.call(this);
    this.dataSource = inputObject;
  }
  RecordContainer.prototype = Object.create(Series.prototype);
  Object.assign(RecordContainer.prototype, {
    constructor: RecordContainer,
    acquireCursor: function() {
      return new ListCursor(Object.entries(this.dataSource));
    },
    traverse: function(callbackFn) {
      let currentIndex = 0;
      for (const key in this.dataSource) {
        if (Object.prototype.hasOwnProperty.call(this.dataSource, key)) {
          if (callbackFn([key, this.dataSource[key]], currentIndex++) === false) {
            return false;
          }
        }
      }
      return true;
    },
    collectAll: function() { return Object.entries(this.dataSource); },
    assembleObject: function() { return { ...this.dataSource }; },
    materializeIndexed: function() { return new ListContainer(Object.entries(this.dataSource)); }
  });

  /**
   * Base Cursor object for iterating over Series elements.
   * @constructor
   * @param {Array} data The underlying data to iterate over.
   */
  function Cursor(data) {
    this.data = data || [];
    this.currentPosition = -1;
    this.currentValue = undefined;
    this.hasMore = true; // Flag for quick check if iteration is exhausted
  }

  /**
   * Retrieves the element at the cursor's current position.
   * @returns {*} The current element.
   */
  Cursor.prototype.getCurrent = function getCurrent() {
    return this.currentValue;
  };

  /**
   * Advances the cursor to the next element in the series.
   * @returns {boolean} True if the cursor successfully moved to a new element, false otherwise.
   */
  Cursor.prototype.advance = function advance() {
    if (!this.hasMore) {
      return false;
    }
    this.currentPosition++;
    if (this.currentPosition < this.data.length) {
      this.currentValue = this.data[this.currentPosition];
      return true;
    } else {
      this.currentValue = undefined;
      this.hasMore = false;
      return false;
    }
  };

  /**
   * Cursor specifically for `ListContainer` and other array-backed series.
   * @constructor
   * @augments Cursor
   * @param {Array} underlyingArray The array to iterate.
   */
  function ListCursor(underlyingArray) {
    Cursor.call(this, underlyingArray);
  }
  ListCursor.prototype = Object.create(Cursor.prototype);
  ListCursor.prototype.constructor = ListCursor;

  /**
   * Cursor for an `EmptySeries`. Always indicates no elements.
   * @constructor
   * @augments Cursor
   */
  function EmptyCursor() {
    Cursor.call(this, []);
    this.hasMore = false;
  }
  EmptyCursor.prototype = Object.create(Cursor.prototype);
  EmptyCursor.prototype.constructor = EmptyCursor;
  EmptyCursor.prototype.advance = () => false;
  EmptyCursor.prototype.getCurrent = () => undefined;

  /**
   * Materializes the entire series into a standard JavaScript array.
   *
   * @returns {Array} An array containing all elements of the series.
   */
  Series.prototype.collectAll = function collectAll() {
    const outputArray = [];
    this.traverse(elementItem => {
      outputArray.push(elementItem);
    });
    return outputArray;
  };

  /**
   * Provides an indexed view of the series. If the series is already indexed
   * (e.g., a `ListContainer`), it returns itself. Otherwise, it eagerly
   * evaluates and caches the series as a `ListContainer`.
   *
   * @returns {ListContainer} An indexed series.
   */
  Series.prototype.materializeIndexed = function materializeIndexed() {
    if (!this._indexedCache) {
      this._indexedCache = new ListContainer(this.collectAll());
    }
    return this._indexedCache;
  };

  /**
   * Converts a series of `[key, value]` pairs into a JavaScript object.
   *
   * @returns {Object} An object created from the series elements.
   */
  Series.prototype.assembleObject = function assembleObject() {
    const resultObject = {};
    this.traverse(keyValueTuple => {
      if (Array.isArray(keyValueTuple) && keyValueTuple.length === 2) {
        resultObject[keyValueTuple[0]] = keyValueTuple[1];
      } else {
        console.warn("Skipping non-key-value pair in assembleObject:", keyValueTuple);
      }
    });
    return resultObject;
  };

  /**
   * Iterates over each element in the series, executing a callback function.
   * Iteration stops if the callback returns `false`.
   *
   * @param {Function} callbackFn The function to call for each element.
   * @returns {boolean} `true` if iteration completed, `false` if stopped early.
   */
  Series.prototype.traverse = function traverse(callbackFn) {
    const seriesCursor = this.acquireCursor();
    let currentIndex = -1;

    while (seriesCursor.advance()) {
      if (callbackFn(seriesCursor.getCurrent(), ++currentIndex) === false) {
        return false;
      }
    }
    return true;
  };

  /**
   * Transforms each element in the series using a provided function,
   * creating a new series with the mapped values.
   *
   * @param {Function} transformFunction The function to apply to each element.
   * @returns {Series} A new series with transformed elements.
   */
  Series.prototype.transform = function transform(transformFunction) {
    const normalizedTransform = _internal.normalizeFn(transformFunction);
    return Series.registerExtension("transform", {
      initialize: function(upstreamSeries, originalTransformFn) {
        this.transformFunction = normalizedTransform;
      },
      acquireCursor: function() {
        return new TransformationCursor(this.upstreamSeries.acquireCursor(), this.transformFunction);
      },
      traverse: function(callbackFn) {
        const tf = this.transformFunction;
        return this.upstreamSeries.traverse((elementItem, currentIndex) => {
          return callbackFn(tf(elementItem, currentIndex), currentIndex);
        });
      }
    })(this, transformFunction);
  };

  /**
   * Represents a series where elements have been transformed by a function.
   * @constructor
   * @augments Series
   */
  function TransformedSeries(upstreamSeries, transformFunction) {
    Series.call(this);
    this.upstreamSeries = upstreamSeries;
    this.transformFunction = transformFunction;
  }
  TransformedSeries.prototype = Object.create(Series.prototype);
  Object.assign(TransformedSeries.prototype, {
    constructor: TransformedSeries,
    acquireCursor: function() {
      return new TransformationCursor(this.upstreamSeries.acquireCursor(), this.transformFunction);
    },
    traverse: function(callbackFn) {
      const tf = this.transformFunction;
      return this.upstreamSeries.traverse((elementItem, currentIndex) => {
        return callbackFn(tf(elementItem, currentIndex), currentIndex);
      });
    }
  });

  /**
   * Cursor for a `TransformedSeries`, applying the transformation function
   * as elements are advanced.
   * @constructor
   * @augments Cursor
   * @param {Cursor} upstreamCursor The cursor of the parent series.
   * @param {Function} transformFunction The function to apply to elements.
   */
  function TransformationCursor(upstreamCursor, transformFunction) {
    Cursor.call(this, []); // Base Cursor does not manage data directly here
    this.upstreamCursor = upstreamCursor;
    this.transformFunction = transformFunction;
    this.currentPosition = -1; // Track index for the transformed series
  }
  TransformationCursor.prototype = Object.create(Cursor.prototype);
  TransformationCursor.prototype.constructor = TransformationCursor;

  TransformationCursor.prototype.advance = function advance() {
    if (this.upstreamCursor.advance()) {
      this.currentPosition++;
      this.currentValue = this.transformFunction(this.upstreamCursor.getCurrent(), this.currentPosition);
      return true;
    }
    this.currentValue = undefined;
    this.hasMore = false;
    return false;
  };

  /**
   * Returns the first element of the series without consuming it.
   * If the series is empty, returns `undefined`.
   * @returns {*} The first element or `undefined`.
   */
  Series.prototype.peek = function peek() {
    const tempCursor = this.acquireCursor();
    if (tempCursor.advance()) {
      return tempCursor.getCurrent();
    }
    return undefined;
  };

  // Expose Flow to the global scope
  globalScope.Flow = Flow;

}(this)); // 'this' refers to the global object (window in browsers, global in Node.js)