var _compilerUtils = _compilerUtils || {}; // Initialize a utility object for compatibility features
_compilerUtils.context = {};                 // Store internal context for polyfills
_compilerUtils.ASSUME_LEGACY_JS = false;     // Flag indicating assumption of ES5 environment
_compilerUtils.NO_NATIVE_MAP_SUPPORT = false; // Flag for environments without native Map
_compilerUtils.NO_NATIVE_SET_SUPPORT = false; // Flag for environments without native Set
_compilerUtils.USE_FROUND_POLYFILL = false;  // Flag for when a fround polyfill is required

// Function to establish a property on an object, handling older JavaScript environments
_compilerUtils.establishProperty = _compilerUtils.ASSUME_LEGACY_JS || typeof Object.defineProperties === "function"
    ? Object.defineProperty // Use native Object.defineProperty if available and not assuming legacy
    : function (targetObj, propName, propDesc) {
        // Custom implementation for older environments: directly assign value
        if (targetObj !== Array.prototype && targetObj !== Object.prototype) {
            targetObj[propName] = propDesc.value;
        }
    };

// Function to retrieve the global object, compatible across different JavaScript runtimes (browser, Node.js)
_compilerUtils.fetchGlobalObject = function (currentScope) {
    // Check for browser window object
    if (typeof window !== "undefined" && window === currentScope) {
        return currentScope;
    }
    // Check for Node.js global object
    else if (typeof global !== "undefined" && global !== null) {
        return global;
    }
    // Fallback to the current scope (e.g., web workers)
    return currentScope;
};

// Set the root global object for later use by polyfills
_compilerUtils.rootScope = _compilerUtils.fetchGlobalObject(this);

// Function to implement a polyfill for missing browser features or newer JavaScript syntax
_compilerUtils.implementPolyfill = function (pathStr, polyfillFn, versionTag, iterationIndex) {
    // Only proceed if a polyfill function is actually provided
    if (polyfillFn) {
        let currentScope = _compilerUtils.rootScope; // Start from the root global scope
        const pathSegments = pathStr.split(".");     // Split the feature path (e.g., "Array.from") into segments

        // Traverse the object path to ensure all intermediate objects exist
        for (iterationIndex = 0; iterationIndex < pathSegments.length - 1; iterationIndex++) {
            const segment = pathSegments[iterationIndex];
            if (!(segment in currentScope)) {
                currentScope[segment] = {}; // Create missing intermediate objects (e.g., `window.Array`)
            }
            currentScope = currentScope[segment]; // Move to the next segment in the path
        }

        // Get the final property name and its current value (if any)
        const finalPropName = pathSegments[pathSegments.length - 1];
        const existingValue = currentScope[finalPropName];

        // Apply the polyfill function to the existing value to get the new value
        const newValue = polyfillFn(existingValue);

        // If the new value is different from the existing one and not null, define the property
        if (newValue !== existingValue && newValue !== null) {
            _compilerUtils.establishProperty(currentScope, finalPropName, {
                configurable: true, // Allow the property to be changed or deleted later
                writable: true,     // Allow the property's value to be reassigned
                value: newValue     // The new polyfilled value
            });
        }
    }
};

// Apply polyfill for `Array.from` if it's not natively available or needs improvement
_compilerUtils.implementPolyfill(
    "Array.from", // The feature path for the polyfill
    function (existingFrom) {
        // If `Array.from` already exists, return it, no polyfill needed
        if (existingFrom) {
            return existingFrom;
        }

        // Otherwise, provide a custom implementation for `Array.from`
        return function (iterableObject, mapFunction, thisArgument) {
            // Default `mapFunction` if not provided, simply returns the item
            mapFunction = (mapFunction !== null && mapFunction !== undefined)
                ? mapFunction
                : function (item) { return item; };

            const resultArray = []; // Array to store the results
            // Check for Symbol.iterator support to handle true iterables
            const symbolIterator = typeof Symbol !== "undefined" && Symbol.iterator && iterableObject[Symbol.iterator];

            // If the object is iterable using Symbol.iterator
            if (typeof symbolIterator === "function") {
                const iteratorInstance = symbolIterator.call(iterableObject);
                let currentItem;
                let itemIndex = 0;
                // Loop through iterator results until 'done' is true
                while (!(currentItem = iteratorInstance.next()).done) {
                    resultArray.push(mapFunction.call(thisArgument, currentItem.value, itemIndex++));
                }
            } else {
                // Fallback for array-like objects (e.g., `arguments`, `NodeList`) without Symbol.iterator
                const lengthOfObject = iterableObject.length;
                for (let itemIndex = 0; itemIndex < lengthOfObject; itemIndex++) {
                    resultArray.push(mapFunction.call(thisArgument, iterableObject[itemIndex], itemIndex));
                }
            }
            return resultArray; // Return the newly constructed array
        };
    },
    "es6", // Indicates this polyfill targets ECMAScript 2015 (ES6) features
    "es3"  // Indicates compatibility with ECMAScript 3 environments
);

// Main processing function for the input data to solve the problem
function processInput(rawData) {
    // Split the raw input string into an array of lines
    let lineParts = rawData.split("\n");

    // Parse the first line as the count of items, using radix 10
    let itemCount = parseInt(lineParts[0], 10);

    // Initialize an array to store the numbers parsed from the input
    const parsedNumbers = [];

    // Split the second line into space-separated string parts
    lineParts[1] = lineParts[1].split(" ");

    // Iterate through the string parts, parse each as an integer, and add to `parsedNumbers`
    for (let loopIndex = 0; loopIndex < itemCount; ++loopIndex) {
        parsedNumbers.push(parseInt(lineParts[1][loopIndex], 10));
    }

    // Create a sorted copy of the `parsedNumbers` array using `Array.from` and a numeric sort
    let sortedNumbers = Array.from(parsedNumbers);
    sortedNumbers.sort((valA, valB) => valA - valB); // Ensure numeric sort, not lexicographical

    // Log both the original and sorted arrays for inspection (or problem-specific output)
    console.log(parsedNumbers, sortedNumbers);

    let differenceCount = 0; // Counter to track the number of differing elements

    // Compare the original `parsedNumbers` array with the `sortedNumbers` array
    for (let compareIndex = 0; compareIndex < itemCount; ++compareIndex) {
        // If an element in the original array does not match its corresponding element in the sorted array
        if (parsedNumbers[compareIndex] !== sortedNumbers[compareIndex]) {
            differenceCount += 1; // Increment the difference counter
        }
    }

    // Output "YES" if the number of differences is 2 or less, otherwise output "NO"
    console.log(2 >= differenceCount ? "YES" : "NO");
}

// Execute the main processing function with data read from standard input
processInput(
    // Load the file system module (common in Node.js environments)
    require("fs").readFileSync(
        "/dev/stdin", // Path to read from standard input (Unix-like systems)
        "utf8"        // Specify UTF-8 encoding for reading the file content
    )
);