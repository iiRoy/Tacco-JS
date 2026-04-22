(function(scope) {
  /**
   * Orchestrates data streams, wrapping various data types to enable
   * pipeline-style processing. For `null` or `undefined` inputs, it
   * gracefully yields an empty stream. For a more stringent behavior,
   * consider using {@link StreamFlow.rigorous}.
   *
   * - For **arrays**, StreamFlow creates a collection of elements
   *   (an {@link ArrayLink}).
   * - For **objects**, StreamFlow generates a stream of key/value pairs
   *   (a {@link MapLink}).
   * - For **strings**, StreamFlow produces a sequence of characters
   *   (a {@link TextLink}).
   *
   * @public
   * @param {Array|Object|string} initialData An array, object, or string to process.
   * @returns {ProcessingNode} The wrapped data stream.
   */
  function StreamFlow(initialData) {
    if (initialData instanceof Array) {
      return new ArrayLink(initialData);
    } else if (typeof initialData === "string") {
      return new TextLink(initialData);
    } else if (initialData instanceof ProcessingNode) {
      return initialData;
    }

    if (StreamFlow.plugins) {
      let activePlugins = StreamFlow.plugins, totalPlugins = activePlugins.length, outcome;
      while (!outcome && totalPlugins--) {
        outcome = activePlugins[totalPlugins](initialData);
      }
      if (outcome) {
        return outcome;
      }
    }

    // Default for objects, null, undefined, or other types
    return new MapLink(initialData);
  }

  StreamFlow.RELEASE_VERSION = '0.3.0';
  StreamFlow.plugins = [];

  /**
   * Utility function that does nothing.
   * @public
   */
  StreamFlow.doNothing = function doNothing() {};

  /**
   * Utility function that returns its input unchanged.
   * @public
   * @param {*} value The input value.
   * @returns {*} The input value.
   */
  StreamFlow.passThrough = function passThrough(value) { return value; };

  /**
   * Provides a strict version of {@link StreamFlow} which prevents wrapping
   * `null`, `undefined`, or primitive numeric or boolean values.
   *
   * @public
   * @returns {Function} A rigorous version of the {@link StreamFlow} factory.
   */
  StreamFlow.rigorous = function rigorous() {
    function RigorousStreamFlow(initialData) {
      if (initialData == null) {
        throw "Cannot process null or undefined with rigorous StreamFlow.";
      }

      if (typeof initialData === "number" || typeof initialData === "boolean") {
        throw "Cannot process primitive values with rigorous StreamFlow.";
      }

      return StreamFlow(initialData);
    };

    // Copy static methods from original StreamFlow
    StreamFlow(StreamFlow).consume(function(prop, name) {
      RigorousStreamFlow[name] = prop;
    });

    return RigorousStreamFlow;
  };

  /**
   * Internal helper to create a callable function, handling string property access.
   * @private
   */
  function establishCallable(actionSource, thisContext) {
    if (typeof actionSource === "function") {
      return function() { return actionSource.apply(thisContext, arguments); };
    } else if (typeof actionSource === "string") {
      return function(entity) { return entity[actionSource]; };
    } else {
      return actionSource;
    }
  }

  /**
   * The `ProcessingNode` object serves as the foundation for all data stream
   * operations, encapsulating a sequence of zero or more elements.
   * It is designed for lazy evaluation.
   *
   * @public
   * @constructor
   */
  function ProcessingNode() {}

  /**
   * Creates an {@link ElementCursor} object, providing `advance` and
   * `presentValue` methods.
   *
   * This method is crucial for iterating through the stream. Any `ProcessingNode`
   * must implement this method or provide a `consume` method.
   *
   * @public
   * @returns {ElementCursor} An element cursor object.
   */
  ProcessingNode.prototype.createCursor = function createCursor() {
    throw new Error("`createCursor` must be implemented by derived processing nodes.");
  };

  /**
   * Creates an array snapshot of the current stream's elements.
   *
   * For indefinite streams, this method may lead to exceptions or infinite loops.
   *
   * @public
   * @returns {Array} An array containing all elements from the stream.
   */
  ProcessingNode.prototype.collectAll = function collectAll() {
    return this.fold(function(accumulator, item) {
      accumulator.push(item);
      return accumulator;
    }, []);
  };

  /**
   * Provides an indexed view into the stream.
   *
   * For streams that are already indexed (like {@link ArrayLink}), this returns
   * the stream itself. For others, it eagerly evaluates and caches the stream's
   * contents as an {@link ArrayLink} for efficient indexed access.
   *
   * @returns {ArrayLink} A stream providing indexed access to its elements.
   */
  ProcessingNode.prototype.materializeIndexed = function materializeIndexed() {
    if (!this.cachedResult) {
      this.cachedResult = new ArrayLink(this.collectAll());
    }
    return this.cachedResult;
  };

  /**
   * Creates an object from a stream of key/value pairs.
   *
   * @public
   * @returns {Object} An object where keys and values correspond to the pairs
   *     in the stream.
   */
  ProcessingNode.prototype.assembleObject = function assembleObject() {
    return this.fold(function(resultObject, pair) {
      resultObject[pair[0]] = pair[1];
      return resultObject;
    }, {});
  };

  /**
   * Iterates over this stream, executing a function for every element.
   *
   * @public
   * @aka forEachElement
   * @param {Function} consumerFunc The function to call on each element.
   *     Returning `false` from this function will halt the iteration.
   */
  ProcessingNode.prototype.consume = function consume(consumerFunc) {
    let dataCursor = this.createCursor(),
        currentIdx = -1;

    while (dataCursor.advance()) {
      if (consumerFunc(dataCursor.presentValue(), ++currentIdx) === false) {
        return false;
      }
    }

    return true;
  };

  ProcessingNode.prototype.forEachElement = function forEachElement(consumerFunc) {
    return this.consume(consumerFunc);
  };

  /**
   * Creates a new stream whose values are produced by passing this stream's
   * elements through a mapping function.
   *
   * @public
   * @aka project
   * @param {Function} projectionFunc The function used to transform elements.
   * @param {*} [thisContext] Optional context for `projectionFunc`.
   * @returns {ProcessingNode} The new transformed stream.
   */
  ProcessingNode.prototype.transform = function transform(projectionFunc, thisContext) {
    return new TransformationNode(this, establishCallable(projectionFunc, thisContext));
  };

  ProcessingNode.prototype.project = function project(projectionFunc, thisContext) {
    return this.transform(projectionFunc, thisContext);
  };

  /**
   * Creates a new stream containing only elements that satisfy a given predicate.
   *
   * @public
   * @param {Function} predicateFunc The function used to test each element.
   * @param {*} [thisContext] Optional context for `predicateFunc`.
   * @returns {ProcessingNode} The new filtered stream.
   */
  ProcessingNode.prototype.filterElements = function filterElements(predicateFunc, thisContext) {
    return new FilteredNode(this, establishCallable(predicateFunc, thisContext));
  };

  /**
   * Aggregates all elements in the stream into a single value using a reducer function.
   *
   * @public
   * @param {Function} reducerFunc The function to apply to each element,
   *     accumulating a result.
   * @param {*} initialAccumulator The initial value of the accumulator.
   * @param {*} [thisContext] Optional context for `reducerFunc`.
   * @returns {*} The aggregated value.
   */
  ProcessingNode.prototype.fold = function fold(reducerFunc, initialAccumulator, thisContext) {
    let accumulator = initialAccumulator;
    const boundReducer = establishCallable(reducerFunc, thisContext);
    this.consume(function(item, idx) {
      accumulator = boundReducer(accumulator, item, idx);
    });
    return accumulator;
  };

  /**
   * Registers a new custom processing stage, adding a method to `ProcessingNode.prototype`.
   *
   * @public
   * @param {string|Array.<string>} methodIdentifier The name(s) of the method(s) to add.
   * @param {Object} behaviorOverrides An object containing `createCursor` or `consume`
   *     implementations, and optionally an `init` method.
   * @returns {Function} A constructor for the new custom processing node type.
   */
  ProcessingNode.registerStage = function registerStage(methodIdentifier, behaviorOverrides) {
    if (!behaviorOverrides || (!behaviorOverrides.createCursor && !behaviorOverrides.consume)) {
      throw "A custom processing stage must implement *at least* `createCursor` or `consume`!";
    }

    function CustomProcessingNode(upstreamNode, ...args) {
      this.upstreamNode = upstreamNode;
      if (behaviorOverrides.init) {
        behaviorOverrides.init.apply(this, args);
      }
    }
    CustomProcessingNode.prototype = Object.create(ProcessingNode.prototype);
    CustomProcessingNode.prototype.constructor = CustomProcessingNode;

    Object.keys(behaviorOverrides).forEach(key => {
      if (key !== 'init') {
        CustomProcessingNode.prototype[key] = behaviorOverrides[key];
      }
    });

    const attachMethod = function(name) {
      ProcessingNode.prototype[name] = function(...args) {
        return new CustomProcessingNode(this, ...args);
      };
    };

    if (Array.isArray(methodIdentifier)) {
      methodIdentifier.forEach(attachMethod);
    } else {
      attachMethod(methodIdentifier);
    }

    return CustomProcessingNode;
  };

  /**
   * The `ElementCursor` object provides an API for stepping through a stream.
   *
   * @public
   * @constructor
   * @param {ProcessingNode} processingNode The node to iterate over.
   */
  function ElementCursor(processingNode) {
    this.processingNode = processingNode;
    this.currentElement = undefined;
    this.currentIndex = -1;
  }

  /**
   * Retrieves the element the cursor is currently pointing to.
   *
   * @public
   * @returns {*} The current element.
   */
  ElementCursor.prototype.presentValue = function presentValue() {
    return this.currentElement;
  };

  /**
   * Advances the cursor to the next element in the stream, if available.
   *
   * @public
   * @returns {boolean} `true` if the cursor moved to a new element, `false` otherwise.
   */
  ElementCursor.prototype.advance = function advance() {
    throw new Error("`advance` must be implemented by derived cursors.");
  };

  /**
   * Represents a stream derived from an array.
   * @constructor
   * @param {Array} initialArray The source array.
   */
  function ArrayLink(initialArray) {
    this.data = initialArray || [];
  }
  ArrayLink.prototype = Object.create(ProcessingNode.prototype);
  ArrayLink.prototype.constructor = ArrayLink;
  ArrayLink.prototype.createCursor = function createCursor() {
    return new ArrayCursor(this.data);
  };
  ArrayLink.prototype.countElements = function countElements() { return this.data.length; };
  ArrayLink.prototype.retrieveElement = function retrieveElement(idx) { return this.data[idx]; };

  /**
   * Cursor for an array source.
   * @constructor
   * @param {Array} arraySource The array to iterate.
   */
  function ArrayCursor(arraySource) {
    this.sourceArray = arraySource;
    this.currentIdx = -1;
    this.currentElement = undefined;
  }
  ArrayCursor.prototype = Object.create(ElementCursor.prototype);
  ArrayCursor.prototype.constructor = ArrayCursor;
  ArrayCursor.prototype.advance = function advance() {
    if (this.currentIdx >= this.sourceArray.length - 1) {
      return false;
    }
    this.currentIdx++;
    this.currentElement = this.sourceArray[this.currentIdx];
    return true;
  };
  ArrayCursor.prototype.presentValue = function presentValue() {
    return this.currentElement;
  };
  ArrayCursor.prototype.countElements = function countElements() { return this.sourceArray.length; };
  ArrayCursor.prototype.retrieveElement = function retrieveElement(idx) { return this.sourceArray[idx]; };

  /**
   * Represents a stream derived from a string.
   * @constructor
   * @param {string} initialString The source string.
   */
  function TextLink(initialString) {
    this.data = initialString || "";
  }
  TextLink.prototype = Object.create(ProcessingNode.prototype);
  TextLink.prototype.constructor = TextLink;
  TextLink.prototype.createCursor = function createCursor() {
    return new TextCursor(this.data);
  };

  /**
   * Cursor for a string source.
   * @constructor
   * @param {string} stringSource The string to iterate.
   */
  function TextCursor(stringSource) {
    this.sourceString = stringSource;
    this.currentIdx = -1;
    this.currentElement = undefined;
  }
  TextCursor.prototype = Object.create(ElementCursor.prototype);
  TextCursor.prototype.constructor = TextCursor;
  TextCursor.prototype.advance = function advance() {
    if (this.currentIdx >= this.sourceString.length - 1) {
      return false;
    }
    this.currentIdx++;
    this.currentElement = this.sourceString[this.currentIdx];
    return true;
  };
  TextCursor.prototype.presentValue = function presentValue() {
    return this.currentElement;
  };

  /**
   * Represents a stream derived from an object (yielding key-value pairs).
   * @constructor
   * @param {Object} initialObject The source object.
   */
  function MapLink(initialObject) {
    this.data = initialObject || {};
  }
  MapLink.prototype = Object.create(ProcessingNode.prototype);
  MapLink.prototype.constructor = MapLink;
  MapLink.prototype.createCursor = function createCursor() {
    return new MapCursor(this.data);
  };

  /**
   * Cursor for an object source, iterating key-value pairs.
   * @constructor
   * @param {Object} objectSource The object to iterate.
   */
  function MapCursor(objectSource) {
    this.sourceObject = objectSource;
    this.keys = Object.keys(objectSource);
    this.currentIdx = -1;
    this.currentElement = undefined; // [key, value] pair
  }
  MapCursor.prototype = Object.create(ElementCursor.prototype);
  MapCursor.prototype.constructor = MapCursor;
  MapCursor.prototype.advance = function advance() {
    if (this.currentIdx >= this.keys.length - 1) {
      return false;
    }
    this.currentIdx++;
    const currentKey = this.keys[this.currentIdx];
    this.currentElement = [currentKey, this.sourceObject[currentKey]];
    return true;
  };
  MapCursor.prototype.presentValue = function presentValue() {
    return this.currentElement;
  };

  /**
   * Represents a stream that transforms elements from an upstream node.
   * @constructor
   * @param {ProcessingNode} upstreamNode The preceding node in the pipeline.
   * @param {Function} projectionFunc The function to apply to each element.
   */
  function TransformationNode(upstreamNode, projectionFunc) {
    this.upstreamNode = upstreamNode;
    this.projectionFunc = projectionFunc;
  }
  TransformationNode.prototype = Object.create(ProcessingNode.prototype);
  TransformationNode.prototype.constructor = TransformationNode;
  TransformationNode.prototype.createCursor = function createCursor() {
    return new TransformingCursor(this.upstreamNode.createCursor(), this.projectionFunc);
  };
  // Optimized consume for direct pipeline execution
  TransformationNode.prototype.consume = function consume(consumerFunc) {
    const projFunc = this.projectionFunc;
    return this.upstreamNode.consume(function(item, idx) {
      return consumerFunc(projFunc(item, idx), idx);
    });
  };

  /**
   * Cursor for a transformation node, applying a projection function.
   * @constructor
   * @param {ElementCursor} upstreamCursor The cursor from the preceding node.
   * @param {Function} projectionFunc The function to apply.
   */
  function TransformingCursor(upstreamCursor, projectionFunc) {
    this.upstreamCursor = upstreamCursor;
    this.projectionFunc = projectionFunc;
    this.currentElement = undefined;
    this.currentIdx = -1;
  }
  TransformingCursor.prototype = Object.create(ElementCursor.prototype);
  TransformingCursor.prototype.constructor = TransformingCursor;
  TransformingCursor.prototype.advance = function advance() {
    if (this.upstreamCursor.advance()) {
      this.currentIdx++;
      this.currentElement = this.projectionFunc(this.upstreamCursor.presentValue(), this.currentIdx);
      return true;
    }
    return false;
  };
  TransformingCursor.prototype.presentValue = function presentValue() {
    return this.currentElement;
  };

  /**
   * Represents a stream that filters elements from an upstream node.
   * @constructor
   * @param {ProcessingNode} upstreamNode The preceding node in the pipeline.
   * @param {Function} predicateFunc The function to test each element.
   */
  function FilteredNode(upstreamNode, predicateFunc) {
    this.upstreamNode = upstreamNode;
    this.predicateFunc = predicateFunc;
  }
  FilteredNode.prototype = Object.create(ProcessingNode.prototype);
  FilteredNode.prototype.constructor = FilteredNode;
  FilteredNode.prototype.createCursor = function createCursor() {
    return new FilteringCursor(this.upstreamNode.createCursor(), this.predicateFunc);
  };
  // Optimized consume for direct pipeline execution
  FilteredNode.prototype.consume = function consume(consumerFunc) {
    const predFunc = this.predicateFunc;
    return this.upstreamNode.consume(function(item, idx) {
      if (predFunc(item, idx)) {
        return consumerFunc(item, idx);
      }
    });
  };

  /**
   * Cursor for a filtering node, applying a predicate function.
   * @constructor
   * @param {ElementCursor} upstreamCursor The cursor from the preceding node.
   * @param {Function} predicateFunc The function to test.
   */
  function FilteringCursor(upstreamCursor, predicateFunc) {
    this.upstreamCursor = upstreamCursor;
    this.predicateFunc = predicateFunc;
    this.currentElement = undefined;
    this.currentIdx = -1;
  }
  FilteringCursor.prototype = Object.create(ElementCursor.prototype);
  FilteringCursor.prototype.constructor = FilteringCursor;
  FilteringCursor.prototype.advance = function advance() {
    while (this.upstreamCursor.advance()) {
      this.currentIdx++;
      const item = this.upstreamCursor.presentValue();
      if (this.predicateFunc(item, this.currentIdx)) {
        this.currentElement = item;
        return true;
      }
    }
    return false;
  };
  FilteringCursor.prototype.presentValue = function presentValue() {
    return this.currentElement;
  };

  scope.StreamFlow = StreamFlow;
})(typeof global !== 'undefined' ? global : window);