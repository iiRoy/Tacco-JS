( function ( env ) {
  /**
   * Encapsulates an incoming data item and yields a {@link Stream}. For `null` or `undefined` inputs,
   * an empty stream is simply returned (refer to {@link Flow.rigorous} for a more constrained
   * behavior).
   *
   * - For **lists** (arrays), Flow will construct a stream consisting of the items within
   *   the list (a {@link ListContainer}).
   * - For **records** (objects), Flow will construct a stream of key-value tuples
   *   (a {@link RecordContainer}).
   * - For **text** (strings), Flow will construct a stream of individual characters (a
   *   {@link TextContainer}).
   *
   * @public
   * @param {Array|Object|string} initialValue The list, record, or text to be encapsulated.
   * @returns {Stream} The encapsulated deferred processing object.
   *
   * @examples
   * Flow([1, 2, 4])       // instanceof Flow.ListContainer
   * Flow({ foo: "bar" })  // instanceof Flow.RecordContainer
   * Flow("hello, world!") // instanceof Flow.TextContainer
   * Flow()                // stream: []
   * Flow(null)            // stream: []
   */
  function Flow( initialValue ) {
    if ( initialValue instanceof Array ) {
      return new ListContainer( initialValue );
    } else if ( typeof initialValue === "string" ) {
      return new TextContainer( initialValue );
    } else if ( initialValue instanceof Stream ) {
      return initialValue;
    }

    if ( Flow.plugins ) {
      let currentPlugins = Flow.plugins,
          pluginCount = currentPlugins.length,
          outcome;

      while ( !outcome && pluginCount-- ) {
        outcome = currentPlugins[pluginCount]( initialValue );
      }
      if ( outcome ) {
        return outcome;
      }
    }

    return new RecordContainer( initialValue );
  }

  Flow.BUILD_NUM = '0.3.0';
  Flow.plugins = [];

  // Miscellaneous helper routines
  // -----------------------------

  Flow.doNothing = function doNothing() {
  };
  Flow.passThrough = function passThrough( val ) {
    return val;
  };

  /**
   * Offers a more rigorous variant of {@link Flow} that will raise an error if
   * one attempts to encapsulate `null`, `undefined`, or elementary number/boolean
   * types as a stream.
   *
   * @public
   * @returns {Function} A more stringent version of the {@link Flow} utility function.
   *
   * @examples
   * var Rigorous = Flow.rigorous();
   *
   * Rigorous()                  // will throw an exception
   * Rigorous(null)              // will throw an exception
   * Rigorous(true)              // will throw an exception
   * Rigorous(5)                 // will throw an exception
   * Rigorous([1, 2, 3])         // instanceof Flow.ListContainer
   * Rigorous({ foo: "bar" })    // instanceof Flow.RecordContainer
   * Rigorous("hello, world!")   // instanceof Flow.TextContainer
   *
   * // Confirm that static methods are also present.
   * Rigorous.span(3)           // stream: [0, 1, 2]
   * Rigorous.create(Date.now) // instanceof Flow.GeneratedStream
   */
  Flow.rigorous = function rigorous() {
    const RigorousFlow = function ( initialValue ) {
      if ( initialValue == null ) {
        throw "Null or undefined values are not permitted with Rigorous Flow.";
      }

      if ( typeof initialValue === "number" || typeof initialValue === "boolean" ) {
        throw "Primitive numeric or boolean values cannot be wrapped by Rigorous Flow.";
      }

      return Flow( initialValue );
    };

    Flow( Flow ).traverse( function ( feature, label ) {
      RigorousFlow[label] = feature;
    } );

    return RigorousFlow;
  };

  /**
   * The `Stream` object presents a consistent interface for conceptualizing
   * an ordered collection of zero or more items within a data pipeline, stream, etc.
   *
   * Deferred Evaluation Principle
   * -----------------------------
   *
   * Typically, the act of constructing a stream should be an inexpensive operation,
   * avoiding immediate iteration over the underlying data source or triggering any
   * unintended side effects. This implies that chaining multiple methods that return
   * streams only incurs the overhead of creating the `Stream` objects themselves,
   * not the repeated cost of processing the data source.
   *
   * For instance, the following snippet generates 4 streams and defers any actual
   * processing of `initialValue`:
   *
   *     var dataFlow = Flow(initialValue) // First stream
   *       .transform(operation)           // Second
   *       .filter(condition)              // Third
   *       .reverse();                     // Fourth
   *
   * Flow's design philosophy is to postpone any iteration or substantial *action*
   * (beyond stream object creation) until the `traverse` method is invoked:
   *
   *     dataFlow.traverse(function(item) { console.log(item); });
   *
   * Crafting Custom Stream Types
   * ----------------------------
   *
   * Defining your own stream type is quite straightforward:
   *
   * 1. Provide an *operation alias* and an object containing *method implementations* to
   *    {@link Stream.registerType}. If the object includes an `initialize` function,
   *    it will be executed upon type instantiation.
   * 2. The object must define at least a `getTraverser` method or a `traverse` method.
   *    The former supports both asynchronous and synchronous traversal but is slightly
   *    more intricate to implement. The latter supports synchronous traversal and can
   *    be automatically derived from `getTraverser`. You may implement both for
   *    performance optimization. For additional details, consult {@link Traverser} and
   *    {@link AsyncStream}.
   *
   * As a simple illustration, the subsequent code establishes a new operation, `pickRandom`,
   * which may or may not include each item from its upstream stream.
   *
   *     Flow.Stream.registerType("pickRandom", {
   *       traverse: function(consumerFn) {
   *         return this.upstream.traverse(function(element) {
   *           // 50% chance to include this element.
   *           if (Math.random() > 0.5) {
   *             return consumerFn(element);
   *           }
   *         });
   *       }
   *     });
   *
   * (Naturally, the above could have been easily achieved using {@link #filter}
   * instead of a custom stream. However, this was presented as a basic example.)
   *
   * Now, it becomes possible to construct this specific stream type from any upstream
   * stream by invoking the designated operation alias. For example:
   *
   *     Flow(someList).pickRandom();
   *     Flow(someList).transform(processFn).pickRandom();
   *     Flow(someList).transform(processFn).filter(validateFn).pickRandom();
   *
   * And so on.
   *
   * @public
   * @constructor
   */
  function Stream() {}

  /**
   * Generates a fresh constructor function for a type that extends `Stream`.
   *
   * @public
   * @param {string|Array.<string>} operationAlias The name(s) of the function(s) to be
   *     employed for creating the new stream type. This function will be appended to
   *     the `Stream` prototype, enabling it to be chained with other
   *     stream operations, such as {@link #transform}, {@link #filter}, etc.
   * @param {Object} implementations An object holding function overrides for this
   *     new stream type. It **must** contain either `getTraverser` or `traverse` (or
   *     both). It *might* also include an `initialize` method. Within these implementations,
   *     `this` will refer to the new stream, and `this.upstream` will point to the base
   *     stream from which this new stream was constructed.
   * @returns {Function} A constructor for a new type derived from `Stream`.
   *
   * @examples
   * // This stream type logs each item to a designated logger during its traversal.
   * Flow.Stream.registerType("audited", {
   *   initialize: function(logHandler) {
   *     this.logHandler = logHandler;
   *   },
   *
   *   traverse: function(consumerFn) {
   *     let logHandler = this.logHandler;
   *     return this.upstream.traverse(function(elementItem, idx) {
   *       logHandler(elementItem);
   *       return consumerFn(elementItem, idx);
   *     });
   *   }
   * });
   *
   * Flow([1, 2, 3]).audited(console.log).traverse(Flow.doNothing) // invokes console.log 3 times
   */
  Stream.registerType = function registerType( operationAlias, implementations ) {
    if ( !implementations || ( !implementations.getTraverser && !implementations.traverse ) ) {
      throw "A custom stream type must implement *at least* getTraverser or traverse!";
    }

    return establishStreamType( Stream, operationAlias, implementations );
  };

  /**
   * Constructs a {@link Traverser} object possessing two key methods: `advance` -- yielding
   * true or false -- and `getCurrent` -- returning the present value.
   *
   * This method is crucial for asynchronous traversal of streams. Any stream type
   * extending from `Stream` must implement this method to enable asynchronous traversal.
   *
   * @public
   * @returns {Traverser} A traverser object.
   *
   * @examples
   * var elementTraverser = Flow([1, 2]).getTraverser();
   *
   * elementTraverser.advance(); // => true
   * elementTraverser.getCurrent();  // => 1
   * elementTraverser.advance(); // => true
   * elementTraverser.getCurrent();  // => 2
   * elementTraverser.advance(); // => false
   */
  Stream.prototype.getTraverser = function getTraverser() {
    return new Traverser( this );
  };

  /**
   * The Traverser object offers an API for navigating through a stream.
   *
   * @public
   * @constructor
   * @param {Stream} dataStream The stream to traverse.
   */
  function Traverser( dataStream ) {
    this.dataStream = dataStream;
    this.position = -1;
  }

  /**
   * Retrieves the current item that this traverser is positioned at.
   *
   * @public
   * @returns {*} The item at the current position.
   */
  Traverser.prototype.getCurrent = function getCurrent() {
    return this.storedPosition && this.storedPosition.get( this.position );
  };

  /**
   * Advances the traverser to the subsequent item within a stream, if feasible.
   *
   * @public
   * @returns {boolean} `true` if the traverser successfully moved to a new item; otherwise, `false`.
   */
  Traverser.prototype.advance = function advance() {
    let storedPosition = this.storedPosition;

    if ( !storedPosition ) {
      storedPosition = this.storedPosition = this.dataStream.getStoredView();
    }

    if ( this.position >= storedPosition.length() - 1 ) {
      return false;
    }

    ++this.position;
    return true;
  };

  /**
   * Generates a list snapshot from a stream.
   *
   * Be advised that for unbounded streams, this operation might trigger an error or,
   * in a worse scenario, lead to an unresponsive execution environment.
   *
   * @public
   * @returns {Array} A list comprising the current items of the stream.
   *
   * @examples
   * Flow([1, 2, 3]).toList() // => [1, 2, 3]
   */
  Stream.prototype.toList = function toList() {
    return this.reduce( function ( collectedList, item ) {
      collectedList.push( item );
      return collectedList;
    }, [] );
  };

  /**
   * Offers an indexed representation of the stream.
   *
   * For streams that are intrinsically indexed, this will simply return the
   * stream itself. For streams without inherent indexing, this will immediately
   * evaluate the stream and store the outcome (thus, consecutive invocations will not
   * generate new lists).
   *
   * @returns {ListContainer} A stream containing the current items of
   *     the stream, accessible by index.
   *
   * @examples
   * function isEvenNumber(val) { return val % 2 === 0; }
   *
   * Flow([1, 2, 3]).filter(isEvenNumber)            // instanceof Flow.Stream
   * Flow([1, 2, 3]).filter(isEvenNumber).getStoredView() // instanceof Flow.ListContainer
   */
  Stream.prototype.getStoredView = function getStoredView() {
    if ( !this.memoizedIndex ) {
      this.memoizedIndex = new ListContainer( this.toList() );
    }
    return this.memoizedIndex;
  };

  /**
   * Constructs a record from a stream of key-value tuples.
   *
   * @public
   * @returns {Object} A record where keys and values align with the tuples
   *     found within the stream.
   *
   * @examples
   * var personData = [
   *   ["firstName", "David"],
   *   ["lastName", "Taylor"],
   *   ["ageValue", 35]
   * ];
   *
   * Flow(personData).toRecord() // => { firstName: "David", lastName: "Taylor", ageValue: 35 }
   */
  Stream.prototype.toRecord = function toRecord() {
    return this.reduce( function ( outputRecord, keyValue ) {
      outputRecord[keyValue[0]] = keyValue[1];
      return outputRecord;
    }, {} );
  };

  /**
   * Traverses this stream, invoking a specified function for each item.
   *
   * @public
   * @aka forEvery
   * @param {Function} processor The function to be executed for each item in the stream.
   *     Returning `false` from this function will terminate the traversal.
   *
   * @examples
   * Flow([1, 2, 3, 4]).traverse(myProcessor) // myProcessor is invoked 4 times
   */
  Stream.prototype.traverse = function traverse( processor ) {
    let currentTraverser = this.getTraverser(),
        itemPosition = -1;

    while ( currentTraverser.advance() ) {
      if ( processor( currentTraverser.getCurrent(), ++itemPosition ) === false ) {
        return false;
      }
    }

    return true;
  };

  Stream.prototype.forEvery = function forEvery( processor ) {
    return this.traverse( processor );
  };

  /**
   * Generates a new stream where items are derived by applying a transformation
   * function to the elements of this stream.
   *
   * @public
   * @aka gather
   * @param {Function} transformerFn The transformation function employed to project this stream's
   *     elements into a new stream.
   * @returns {Stream} The newly created stream.
   *
   * @examples
   * function increaseByOne(value) { return value + 1; }
   *
   * Flow([]).transform(increaseByOne)        // stream: []
   * Flow([1, 2, 3]).transform(increaseByOne) // stream: [2, 3, 4]
   *
   * @performance_metrics
   * function increaseByOne(value) { return value + 1; }
   *
   * var smallList = Flow.span(10).toList(),
   *     largeList = Flow.span(100).toList();
   *
   * Flow(smallList).transform(increaseByOne).traverse(Flow.doNothing) // deferred - 10 items
   * Flow(largeList).transform(increaseByOne).traverse(Flow.doNothing) // deferred - 100 items
   * OtherLib.forEvery(OtherLib.transform(smallList, increaseByOne), OtherLib.doNothing)    // external lib - 10 items
   * OtherLib.forEvery(OtherLib.transform(largeList, increaseByOne), OtherLib.doNothing)    // external lib - 100 items
   */
  Stream.prototype.transform = function transform( transformerFn ) {
    return new TransformedStream( this, generateHandler( transformerFn ) );
  };

  Stream.prototype.gather = function gather( transformerFn ) {
    return this.transform( transformerFn );
  };

  /**
   * @constructor
   */
  function TransformedStream( upstream, transformerFn ) {
    this.upstream = upstream;
    this.transformerFn = transformerFn;
  }

  TransformedStream.prototype = new Stream();

  TransformedStream.prototype.getTraverser = function getTraverser() {
    return new TransformingTraverser( this.upstream, this.transformerFn );
  };

  TransformedStream.prototype.traverse = function traverse( processor ) {
    let transformerFunction = this.transformerFn;
    return this.upstream.traverse( function ( elementItem, idx ) {
      return processor( transformerFunction( elementItem, idx ), idx );
    } );
  };

  /**
   * @constructor
   */
  function TransformingTraverser( dataStream, transformerFn ) {
    this.currentTraverser = dataStream.getTraverser();
    this.transformerFn = transformerFn;
    this.position = -1;
  }

  // Placeholder for missing helper functions that were referenced.
  // In a real scenario, these would also be cloned.
  function ListContainer(items) { this.items = items; this.get = (idx) => this.items[idx]; this.length = () => this.items.length; }
  function TextContainer(text) { this.text = text; this.get = (idx) => this.text[idx]; this.length = () => this.text.length; }
  function RecordContainer(record) { this.record = record; /* simplified */ this.get = (key) => this.record[key]; this.length = () => Object.keys(this.record).length; }
  function establishStreamType(baseStream, alias, impls) { /* simplified */ return function() { /* constructor logic */ }; }
  function generateHandler(fn) { /* simplified */ return fn; }

  // Assuming 'reduce' is defined somewhere or part of Stream's base functionality.
  // For completeness, if it's a separate utility, it would also be cloned.
  // Example placeholder for reduce:
  Stream.prototype.reduce = function(reducer, initial) {
      let accumulator = initial;
      this.traverse(function(item) {
          accumulator = reducer(accumulator, item);
      });
      return accumulator;
  };

  // Example placeholder for filter:
  Stream.prototype.filter = function(predicateFn) {
      const upstream = this;
      return new Stream().registerType("filteredStream", {
          traverse: function(consumerFn) {
              return upstream.traverse(function(item, idx) {
                  if (predicateFn(item, idx)) {
                      return consumerFn(item, idx);
                  }
              });
          }
      });
  };

  // Example placeholder for reverse (if it's a custom type, not just array reverse)
  Stream.prototype.reverse = function() {
      // Simplistic reverse for illustration, would usually involve eager evaluation or specific iterator logic
      return new ListContainer(this.toList().reverse());
  };

  // Example placeholder for range and create (from Flow.rigorous example)
  Flow.span = function(count) {
      return Flow(Array.from({ length: count }, (_, i) => i));
  };
  Flow.create = function(generatorFn) {
      // Simplified: A generated stream would typically have a getTraverser
      // that calls generatorFn for new values.
      return Flow([]); // Placeholder
  };

  // Placeholder for "OtherLib" used in benchmarks:
  const OtherLib = {
    forEvery: (collection, fn) => collection.forEach(fn),
    transform: (collection, fn) => collection.map(fn),
    doNothing: () => {}
  };

}( typeof window !== "undefined" ? window : global ) );