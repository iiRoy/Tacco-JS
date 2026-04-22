(function utilityKit(voidValue) {
  // Enforce strict mode for cleaner code practices.
  'use strict';
  // Cache prototype references for common built-in objects.
  var ArrBase = Array.prototype,
    ObjBase = Object.prototype,
    FuncBase = Function.prototype;

  // Extract common methods from prototypes for performance and brevity.
  var addElem = ArrBase.push,
    cutPart = ArrBase.slice,
    joinArr = ArrBase.concat,
    toText = ObjBase.toString,
    hasOwnAttr = ObjBase.hasOwnProperty;

  // Store native array iteration and object inspection methods.
  var stdEach = ArrBase.forEach,
    stdMap = ArrBase.map,
    stdReduce = ArrBase.reduce,
    stdReduceBack = ArrBase.reduceRight,
    stdFilter = ArrBase.filter,
    stdAll = ArrBase.every,
    stdAny = ArrBase.some,
    stdFindIdx = ArrBase.indexOf,
    stdFindLastIdx = ArrBase.lastIndexOf,
    stdIsArr = Array.isArray,
    stdKeys = Object.keys,
    stdBind = FuncBase.bind;

  // Define a sentinel value to break iterations early.
  var stopSignal = {};

  // Initialize a global utility object.
  this.toolkit = {};
  // Define a general-purpose iteration function.
  var processItems = this.toolkit.processItems = this.toolkit.iterateItems = function(collection, callbackFn, thisArg) {
    // Skip processing if the collection is null or undefined.
    if (collection == null)
      return;
    // Use native forEach if available and applicable for arrays.
    if (stdEach && collection.forEach === stdEach) {
      collection.forEach(callbackFn, thisArg);
    }
    // Handle array-like objects with a numeric length property.
    else if (collection.length === +collection.length) {
      for (var idx = 0, limit = collection.length; idx < limit; idx++) {
        // Execute callback; stop if it returns the breaker signal.
        if (callbackFn.call(thisArg, collection[idx], idx, collection) === stopSignal)
          return;
      }
    }
    // Iterate over properties of a plain object.
    else {
      for (var propName in collection) {
        // Ensure the property belongs to the object itself, not its prototype chain.
        if (this.toolkit.has(collection, propName)) {
          // Execute callback; stop if it returns the breaker signal.
          if (callbackFn.call(thisArg, collection[propName], propName, collection) === stopSignal)
            return;
        }
      }
    }
  };
  // Add a utility for checking own properties, often aliased from hasOwnProperty.
  this.toolkit.has = function(objRef, propRef) {
    return hasOwnAttr.call(objRef, propRef);
  };

  // Function to copy properties from source objects to a target object.
  this.toolkit.assignProps = function(targetObj) {
    // Iterate over all arguments after the first (which is the target).
    processItems(cutPart.call(arguments, 1), function(srcObj) {
      // Only process valid source objects.
      if (srcObj) {
        // Copy all enumerable properties from source to target.
        for (var propertyKey in srcObj) {
          targetObj[propertyKey] = srcObj[propertyKey];
        }
      }
    });
    // Return the modified target object.
    return targetObj;
  };
}).call(global); // Attach utilityKit to the global object.

(function formatters(voidValue) {
  'use strict';
  // This function formats a floating-point number into a string with specified precision.
  this.formatDec = function formatDec(decVal, radix, padding, precision) {
    // Calculate the multiplier for rounding based on desired precision.
    var powerOfTen = Math.pow(10, precision);
    // Round the value and convert to string.
    var intString = "" + Math.round(decVal * powerOfTen);
    // If the rounded integer string is '0', return a default formatted zero.
    if (intString === '0')
      return '0.000';
    // Determine the length of the integer part before the decimal point.
    var intStrLen = intString.length - precision;
    // If no integer part, prepend '0.'.
    if (intStrLen === 0)
      return "0." + intString.substr(intStrLen, precision);
    // Otherwise, insert the decimal point at the correct position.
    return intString.substr(0, intStrLen) + "." + intString.substr(intStrLen, precision);
  };
}).call(global); // Add formatters to the global object.

(function numericHelpers(targetNS, voidValue) {
  // Define a custom Math library within this scope.
  var MathLib = {
    // Calculates the greatest common divisor of two numbers using the Euclidean algorithm.
    greatestCommonDivisor: function greatestCommonDivisor(valA, valB) {
      return !valB ? valA : greatestCommonDivisor(valB, valA % valB);
    },
    // Calculates the least common multiple of two numbers.
    leastCommonMultiple: function leastCommonMultiple(valA, valB) {
      return valA / this.greatestCommonDivisor(valA, valB) * valB;
    },
    // Squares a given number.
    squareNum: function squareNum(inputNum) {
      return inputNum * inputNum;
    }
  };
  // Extend the global 'MathLib' namespace with these custom math functions.
  this.toolkit.assignProps(this.MathLib, MathLib);
}).call(global, 'MathLib'); // Apply numericHelpers to the global context, using 'MathLib' as a namespace hint.

(function(voidValue) {
  'use strict';

  // Define the expected input data type.
  var IN_DATA_KIND = 'decimal';

  // Main problem-solving engine.
  var SolutionEngine = {
    // Initiates the solving process, deferring it to allow other events to process.
    startProcessing: function() {
      // Schedule the actual solving method to run asynchronously.
      setTimeout(SolutionEngine.processProblem, 0, this);
    },
    // The core logic for solving the geometric problem.
    processProblem: function processProblem(executionCtx) {
      // Read the number of test cases.
      var numCases = executionCtx.readInteger();

      // Inner function to process a single test case.
      function processCase() {
        // Define names for coordinate variables.
        var coordNames = ['coordX1', 'coordY1', 'coordX2', 'coordY2', 'coordX3', 'coordY3'];
        // Read coordinate values from input and assign them to the context.
        coordNames.forEach(function(coordName) {
          this[coordName] = executionCtx.readDecimal();
        }, executionCtx); // Use the provided execution context for 'this'.

        // Calculate intermediate coefficients based on coordinate differences.
        var coeffA = executionCtx.coordX1 - executionCtx.coordX2;
        var coeffB = executionCtx.coordY1 - executionCtx.coordY2;
        var coeffC = -1 * (executionCtx.MathLib.squareNum(executionCtx.coordX1) - executionCtx.MathLib.squareNum(executionCtx.coordX2) + executionCtx.MathLib.squareNum(executionCtx.coordY1) - executionCtx.MathLib.squareNum(executionCtx.coordY2));
        var coeffD = executionCtx.coordX1 - executionCtx.coordX3;
        var coeffE = executionCtx.coordY1 - executionCtx.coordY3;
        var coeffF = -1 * (executionCtx.MathLib.squareNum(executionCtx.coordX1) - executionCtx.MathLib.squareNum(executionCtx.coordX3) + executionCtx.MathLib.squareNum(executionCtx.coordY1) - executionCtx.MathLib.squareNum(executionCtx.coordY3));

        // Solve for parameters L and M using a system of equations.
        var paramL = (coeffC * coeffE - coeffB * coeffF) / (coeffE * coeffA - coeffB * coeffD);
        var paramM = (coeffD * coeffC - coeffA * coeffF) / (coeffD * coeffB - coeffE * coeffA);

        // Calculate the final X component (this variable name 'x' is confusing given the problem context, but kept for structural fidelity).
        var finalX = -1 * (executionCtx.MathLib.squareNum(executionCtx.coordX1) + executionCtx.MathLib.squareNum(executionCtx.coordY1) + paramL * executionCtx.coordX1 + paramM * executionCtx.coordY1);
        // Output the formatted results: L/-2, M/-2, and the radius.
        executionCtx.writeOutput(
          executionCtx.formatDec(paramL / -2.0, 10, 3, 3),
          executionCtx.formatDec(paramM / -2.0, 10, 3, 3),
          executionCtx.formatDec(Math.sqrt(executionCtx.MathLib.squareNum(paramL) + executionCtx.MathLib.squareNum(paramM) + 4 * numCases) / 2.0, 10, 3, 3)
        );
      }
      // Process all test cases.
      while (numCases--)
        processCase();
      // If more input is available, schedule the solver to run again.
      if (!executionCtx.hasMoreInput())
        setTimeout(SolutionEngine.processProblem, 0, executionCtx);
    }
  };

  // Self-executing function to initialize the application.
  (function initializeSystem() {
    // Extend the current scope (global) with input/output utilities.
    this.toolkit.assignProps(this, {
      // Function to write output to the console.
      writeOutput: function() {
        console.log.apply(console, arguments);
      },
      // Standard input stream.
      inputReader: process.openStdin(),
      // Queue to store parsed input data.
      pendingInputQueue: [],
      // Reads and parses an integer from the input queue.
      readInteger: function() {
        return parseInt(this.pendingInputQueue.splice(0, 1)[0]);
      },
      // Reads and parses a floating-point number from the input queue.
      readDecimal: function() {
        return parseFloat(this.pendingInputQueue.splice(0, 1)[0]);
      },
      // Reads a string from the input queue.
      readText: function() {
        return this.pendingInputQueue.splice(0, 1)[0];
      },
      // Checks if there is more input available in the queue.
      hasMoreInput: function() {
        return !this.pendingInputQueue.length;
      }
    });

    // Define regular expressions for different input types.
    var INPUT_PATTERN_MAP = {};
    INPUT_PATTERN_MAP['text'] = /\w*/g;
    INPUT_PATTERN_MAP['integer'] = /[-]?\d+/g;
    INPUT_PATTERN_MAP['decimal'] = /[-]?\d+(\.\d+)?/g;
    // Select the appropriate regex based on the defined input kind.
    var CURRENT_INPUT_PATTERN = INPUT_PATTERN_MAP[IN_DATA_KIND];

    // Store a reference to the current global context.
    var handlerContext = this;
    // Set encoding for the standard input stream.
    handlerContext.inputReader.setEncoding('utf8');
    // Event listener for incoming data chunks from stdin.
    handlerContext.inputReader.on('data', function(dataChunk) {
      // Extract all matches based on the input pattern.
      var matchResult = dataChunk.match(CURRENT_INPUT_PATTERN);
      // Filter out empty strings and concatenate with existing input queue.
      handlerContext.pendingInputQueue = handlerContext.pendingInputQueue.concat(matchResult.filter(function(inputLine) {
        return inputLine.length;
      }));
    });
    // Event listener for the end of the input stream.
    handlerContext.inputReader.on('end', function() {
      // Once input ends, trigger the problem solver.
      SolutionEngine.startProcessing.call(handlerContext);
    });
  }).call(this); // Execute initialization in the global context.

}).call(global); // Attach the main solver logic to the global object.