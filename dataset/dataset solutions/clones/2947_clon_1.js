"use strict"; /* This file contains a collection of utility functions and a main application logic.
                           It includes implementations for a Binary Indexed Tree (BIT), a data Compressor,
                           and a main function that processes queries. */

// Helper function to slice an array or iterable into a fixed number of elements.
function _slicedToArray( arr,   i) {
    // Check if the input is an array with holes, an iterable, or neither.
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

// Throws an error if an attempt is made to destructure a non-iterable instance.
function _nonIterableRest( ) {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// Extracts a limited number of elements from an iterable.
function _iterableToArrayLimit( arr, i ) {
    var _arr = []; // Initialize an empty array to store extracted elements.
    var _n = true; // Flag to indicate if iteration is still ongoing.
    var _d = false; // Flag to indicate if an error occurred during iteration.
    var _e = undefined; // Stores the error if one occurs.

    try {
        // Obtain the iterator for the array.
        for (var _i = arr[Symbol.iterator](), _s; // Loop through the iterable.
             !(_n = (_s = _i.next()).done); // Check if the iteration is done.
             _n = true) {
            _arr.push(_s.value); // Add the current value to the result array.
            if (i && _arr.length === i) // If a limit 'i' is set and reached, break.
                break;
        }
    } catch (err) {
        _d = true; // Set error flag.
        _e = err; // Store the error.
    } finally {
        try {
            // Ensure the iterator's return method is called if available and iteration wasn't completed.
            if (!_n && _i["return"] != null) _i["return"]();
        } finally {
            if (_d) throw _e; // If an error occurred, rethrow it.
        }
    }
    return _arr; // Return the array of extracted elements.
}

// Checks if the given argument is an array and returns it, otherwise returns false.
function _arrayWithHoles(arr) {
    if (Array.isArray(arr))
        return arr; // If it's an array, return it.
}

// Ensures an instance is created using the 'new' keyword with a constructor function.
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function"); // Error if 'new' is not used.
    }
}

// Defines properties on a target object from a list of property descriptors.
function _defineProperties( target, props ) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false; // Default to non-enumerable.
        descriptor.configurable = true; // Default to configurable.
        if ("value" in descriptor)
            descriptor.writable = true; // Default to writable if 'value' is present.
        Object.defineProperty(target, descriptor.key, descriptor); // Define the property.
    }
}

// Creates a class by applying prototype properties and static properties.
function _createClass( Constructor, protoProps, staticProps ) {
    if (protoProps)
        _defineProperties(Constructor.prototype, protoProps); // Apply prototype methods.
    if (staticProps)
        _defineProperties(Constructor, staticProps); // Apply static methods.
    return Constructor; // Return the constructed class.
}


// Main application logic encapsulated in an immediately invoked function expression (IIFE).
!function ( ) {

    // Binary Indexed Tree (BIT) or Fenwick Tree implementation.
    var BIT =
    /*#__PURE__*/
    (function () {
        // Constructor for the BIT.
        function BIT(N) {
            _classCallCheck(this, BIT); // Ensure 'new' is used.

            this.N = N; // Stores the maximum size of the tree.
            this.data = new Array(N + 1).fill(0); // Initialize data array with zeros.
        }

        // Define methods for the BIT class.
        _createClass(BIT, [{
            key: "add", // Method to add a value to an index.
            value: function add(x, v) {
                // Iterate through the tree, updating relevant nodes.
                for (var i = x; i <= this.N; i += i & -i) {
                    this.data[i] += v;
                }
            }
        }, {
            key: "sum", // Method to get the prefix sum up to an index.
            value: function sum(x) {
                var sum = 0; // Initialize sum.
                // Iterate through the tree, accumulating sums.
                for (var i = x; i > 0; i -= i & -i) {
                    sum += this.data[i];
                }
                return sum; // Return the calculated sum.
            }
        }]);

        return BIT; // Return the BIT class.
    }());

    // Compressor class to map unique values to a compressed range (0 to N-1).
    var Compressor =
    /*#__PURE__*/
    (function () {
        // Constructor for the Compressor.
        function Compressor(xs) {
            _classCallCheck(this, Compressor); // Ensure 'new' is used.

            // Sort the input array to identify unique values and their order.
            xs.sort(function (a, b) {
                return a - b;
            });

            var l = xs.length; // Length of the sorted array.
            this.min = xs[0]; // Smallest value in the original data.
            this.max = xs[l - 1]; // Largest value in the original data.

            var to = new Array(l); // Array to map compressed index back to original value.
            var from = new Map(); // Map to map original value to compressed index.
            var dataNumber = 0; // Counter for unique data points.
            var last = null; // Used to track the last unique value processed.

            // Populate the 'to' array and 'from' map.
            for (var i = 0; i < l; i++) {
                var x = xs[i];
                if (last !== x)
                    dataNumber++; // Increment count for unique values.
                to[i] = x; // Store original value at its sorted index.
                from.set(x, i); // Map original value to its sorted index.
                last = x; // Update last processed value.
            }

            this.toArray = to; // Store the array mapping index to original value.
            this.fromMap = from; // Store the map mapping original value to index.
            this.dataNumber = dataNumber; // Store the total number of unique data points.
        }

        // Define methods for the Compressor class.
        _createClass(Compressor, [{
            key: "to", // Method to get the original value from a compressed index.
            value: function to(i) {
                return this.toArray[i];
            }
        }, {
            key: "from", // Method to get the compressed index from an original value.
            value: function from(x) {
                return this.fromMap.get(x);
            }
        }]);

        return Compressor; // Return the Compressor class.
    }());

    // Function to parse a line of numbers, either from an array or a space-separated string.
    function splitNum(line) {
        return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
            return parseInt(n); // Convert each part to an integer.
        });
    }

    // Main execution block.
    !function (input) {
        var lines = input.split("\n"); // Split input into individual lines.

        // Parse the first line to get the number of queries (Q).
        var _splitNum = splitNum(lines[0]),
            _splitNum2 = _slicedToArray(_splitNum, 1),
            Q = _splitNum2[0];

        // Parse the query lines.
        var query = lines.slice(1, Q + 1).map(function (line) {
            var _splitNum3 = splitNum(line),
                _splitNum4 = _slicedToArray(_splitNum3, 3),
                t = _splitNum4[0], // Query type.
                a = _splitNum4[1], // First parameter.
                b = _splitNum4[2]; // Second parameter.

            return {
                t: t,
                a: a,
                b: b
            }; // Return query as an object.
        });

        // Extract all 'a' values from type 1 queries for compression.
        var xs = query.filter(function (_ref) {
            var t = _ref.t;
            return 1 === t; // Filter for type 1 queries.
        }).map(function (_ref2) {
            var a = _ref2.a;
            return a; // Extract 'a' value.
        });

        var c = new Compressor(xs); // Create a new Compressor instance.
        var data = new BIT(c.dataNumber); // Create a BIT with the number of unique data points.

        var minValue = 0, // Stores the current minimum value.
            minPoint = null; // Stores the compressed index of the current minimum.

        var _iteratorNormalCompletion = true; // Flag for normal iterator completion.
        var _didIteratorError = false; // Flag if an error occurred during iteration.
        var _iteratorError = undefined; // Stores the error.

        try {
            // Iterate through each query.
            for (var _iterator = query[Symbol.iterator](), _step;
                 !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                 _iteratorNormalCompletion = true) {
                var _step$value = _step.value,
                    t = _step$value.t, // Query type.
                    a = _step$value.a, // Parameter 'a'.
                    b = _step$value.b; // Parameter 'b'.

                if (1 === t) {
                    // If query type is 1 (add/update).
                    // Determine the previous minimum point for calculation.
                    var prevMin = 0 === data.sum(minPoint) ? minPoint + 1 : minPoint;
                    var ai = c.from(a) + 1; // Get compressed index for 'a', add 1 for BIT 1-based indexing.

                    data.add(1, -1); // Adjust BIT for previous min.
                    data.add(ai, 2); // Adjust BIT for new point 'a'.

                    // Update minValue based on whether minPoint was null or not.
                    if (null == minPoint)
                        minValue = b;
                    else
                        minValue += Math.abs(a - c.to(prevMin)) + b;

                    minPoint = getMinPoint(); // Find the new minimum point.
                } else
                    console.log(`${c.to(minPoint)} ${minValue}`); // If query type is 2 (output).
            }
        } catch (err) {
            _didIteratorError = true; // Set error flag.
            _iteratorError = err; // Store the error.
        } finally {
            try {
                // Ensure iterator's return method is called if not completed normally.
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError; // Rethrow error if one occurred.
                }
            }
        }

        // Helper function to find the minimum point using binary search on the BIT.
        function getMinPoint() {
            var start = 1, // Start of search range (1-based index).
                end = c.dataNumber + 1; // End of search range (exclusive).

            // Binary search loop.
            for (; start < end;) {
                var center = Math.floor((start + end) / 2); // Calculate middle point.
                var s = data.sum(center); // Get sum up to center.
                if (s > 0)
                    end = center; // If sum is positive, min is in left half.
                else if (0 === s) {
                    start = center; // If sum is zero, min is at center or right.
                    break; // Found potential min, break.
                } else
                    start = center + 1; // If sum is negative, min is in right half.
            }

            return start - 1; // Return 0-based compressed index.
        }
    }(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from stdin.

}(); // End of IIFE.