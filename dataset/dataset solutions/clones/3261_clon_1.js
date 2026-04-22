"use strict"
; // This is a helper function for spread syntax

function _toConsumableArray(arr) {
 return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
} // Helper function for non-iterable spread attempts

function _nonIterableSpread() {
 throw new TypeError("Invalid attempt to spread non-iterable instance");
} // Converts an iterable to an array

function _iterableToArray(iter) {
 if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") {
  return Array.from(iter);
 }
} // Extracts elements from an array without holes

function _arrayWithoutHoles(arr) {
 if (Array.isArray(arr)) {
  for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
   arr2[i] = arr[i];
  }
  return arr2;
 }
} // Helper for destructuring arrays

function _slicedToArray(arr, i) {
 return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
} // Handles non-iterable destructuring

function _nonIterableRest() {
 throw new TypeError("Invalid attempt to destructure non-iterable instance");
} // Limits an iterable to a certain number of elements

function _iterableToArrayLimit(arr, i) {
 var _arr = [];
 var _n = true;
 var _d = false;
 var _e = undefined;
 try {
  for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
   _arr.push(_s.value);
   if (i && _arr.length === i) {
    break;
   }
  }
 } catch (err) {
  _d = true;
  _e = err;
 } finally {
  try {
   if (!_n && _i["return"] != null) {
    _i["return"]();
   }
  } finally {
   if (_d) {
    throw _e;
   }
  }
 }
 return _arr;
} // Returns an array if it has no holes (i.e., is a dense array)

function _arrayWithHoles(arr) {
 if (Array.isArray(arr)) {
  return arr;
 }
} // Main processing function for the problem logic

function main(input) {
 // Split the input string into individual lines
 var lines = input.split('\n');

 // Parse N and K from the first line of input
 var _splitNum = splitNum(lines[0]),
  _splitNum2 = _slicedToArray(_splitNum, 2),
  N = _splitNum2[0],
  K = _splitNum2[1];

 // Process the subsequent N lines to get sushi data
 var tds = lines.slice(1, N + 1).map(function(line, id) {
  var _splitNum3 = splitNum(line),
   _splitNum4 = _slicedToArray(_splitNum3, 2),
   t = _splitNum4[0],
   d = _splitNum4[1];

  return {
   t,
   d,
   id
  };
 });

 // Sort the sushi items by type (t) and then by deliciousness (d)
 tds.sort(function(a, b) {
  if (a.t < b.t) {
   return -1;
  }
  if (a.t > b.t) {
   return 1;
  }
  return b.d - a.d; // For same type, higher deliciousness comes first
 });

 // Create a copy of tds and sort by deliciousness for later use
 var oishisa = tds.slice(0).sort(function(a, b) {
  return b.d - a.d; // Sort by deliciousness in descending order
 });

 var currentT = -1; // Tracks the current sushi type
 var currentArr = null; // Stores sushi of the current type
 var netaMap = new Map(); // Maps sushi type to an array of sushi items of that type

 // Variables for iterator state management
 var _iteratorNormalCompletion = true;
 var _didIteratorError = false;
 var _iteratorError = undefined;

 try {
  // Iterate through the sorted sushi list to populate netaMap
  for (var _iterator = tds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
   var obj = _step.value;

   if (obj.t !== currentT) {
    if (currentArr) {
     netaMap.set(currentT, currentArr); // Store the completed array for the previous type
    }
    currentT = obj.t; // Update to the new type
    currentArr = []; // Start a new array for the current type
   }
   currentArr.push(obj); // Add the sushi item to the current type's array
  }
 } catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
 } finally {
  try {
   if (!_iteratorNormalCompletion && _iterator.return != null) {
    _iterator.return();
   }
  } finally {
   if (_didIteratorError) {
    throw _iteratorError;
   }
  }
 }

 // Ensure the last type's array is added to the map
 if (currentArr) {
  netaMap.set(currentT, currentArr);
 }

 var netas = Array.from(netaMap.keys()); // Get all unique sushi types
 var taken = new Array(N).fill(false); // Array to track if a sushi item has been taken

 // Initialize variables for the greedy approach
 var initArr, // Array of initially chosen sushi
  otherArr = [], // Array of other sushi chosen to fill up to K
  oishisaPoint = 0, // Total deliciousness points
  netaCount = 0; // Count of unique sushi types
 var takeIdx = 0; // Index for iterating through 'oishisa' array

 // Determine initial selection based on number of unique types
 if (netas.length >= K) {
  // If enough unique types, take one of each of the K most delicious types
  initArr = netas.map(function(neta) {
   var sushi = netaMap.get(neta)[0]; // Take the most delicious sushi of this type
   return sushi;
  });
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;
  try {
   for (var _iterator2 = initArr[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
    var sushi = _step2.value;
    taken[sushi.id] = true; // Mark as taken
    oishisaPoint += sushi.d; // Add to total deliciousness
   }
  } catch (err) {
   _didIteratorError2 = true;
   _iteratorError2 = err;
  } finally {
   try {
    if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
     _iterator2.return();
    }
   } finally {
    if (_didIteratorError2) {
     throw _iteratorError2;
    }
   }
  }
  netaCount = K; // All K chosen items are unique types
 } else {
  // If not enough unique types, take one of each available type
  initArr = netas.map(function(neta) {
   var sushi = netaMap.get(neta)[0];
   taken[sushi.id] = true;
   oishisaPoint += sushi.d;
   return sushi;
  });

  // Fill the remaining K slots with the most delicious sushi not yet taken
  while (otherArr.length < K - initArr.length) {
   for (; takeIdx < N; takeIdx++) {
    var _sushi = oishisa[takeIdx];
    if (taken[_sushi.id]) {
     continue; // Skip if already taken
    }
    taken[_sushi.id] = true;
    oishisaPoint += _sushi.d;
    otherArr.push(_sushi);
   }
  }
  netaCount = netas.length; // The number of unique types is limited by available types
 }

 // Sort the initially chosen unique-type sushi by deliciousness (ascending)
 initArr.sort(function(a, b) {
  return a.d - b.d;
 });

 // The following block attempts to improve the score by swapping
 // a low-deliciousness unique-type sushi with a high-deliciousness non-unique-type sushi

 var _iteratorNormalCompletion3 = true;
 var _didIteratorError3 = false;
 var _iteratorError3 = undefined;
 try {
  for (var _iterator3 = range(0, initArr.length)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
   var i = _step3.value; // Loop through each sushi in initArr (unique types)
   var _sushi2 = initArr[i];

   // Try to find a replacement from the remaining most delicious sushi
   for (; takeIdx < N; takeIdx++) {
    var repl = oishisa[takeIdx]; // Candidate replacement sushi

    if (taken[repl.id]) {
     continue; // Skip if replacement is already taken
    }

    // Calculate current and potential new scores
    var _oldPoint = oishisaPoint + Math.pow(netaCount, 2);
    var newPoint = oishisaPoint + repl.d - _sushi2.d + Math.pow(netaCount - 1, 2);

    if (_oldPoint < newPoint) {
     // If swapping improves the score
     oishisaPoint += repl.d - _sushi2.d; // Update deliciousness sum
     netaCount--; // One unique type is lost
     taken[repl.id] = true; // Mark replacement as taken
     taken[_sushi2.id] = false; // Mark original unique-type sushi as untaken
     break; // Move to the next unique-type sushi for potential replacement
    } else {
     // If swapping does not improve the score, no further swaps will either
     // because initArr is sorted by ascending deliciousness and oishisa by descending.
     console.log(_oldPoint);
     return; // Output current best and exit
    }
   }
  }
 } catch (err) {
  _didIteratorError3 = true;
  _iteratorError3 = err;
 } finally {
  try {
   if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
    _iterator3.return();
   }
  } finally {
   if (_didIteratorError3) {
    throw _iteratorError3;
   }
  }
 }

 // Final calculation of the total score
 var oldPoint = oishisaPoint + Math.pow(netaCount, 2);
 console.log(oldPoint);
}

var P = 1e9 + 7; // A common large prime number, not used in this specific problem logic
main(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input and call main function

// Utility function to parse numbers from a line
function splitNum(line) {
 return (Array.isArray(line) ? line : line.split(/\s+/)).map(function(n) {
  return parseInt(n);
 });
}

/**
 * Iterates over integers in [start, end).
 * This is a generator function.
 */
function* range(start, end) {
 for (var i = start; i < end; i++) {
  yield i;
 }
}

/**
 * Iterates over integers in [end, start) in desc order.
 * This is also a generator function.
 */
function* rangeRev(start, end) {
 for (var i = start - 1; i >= end; i--) {
  yield i;
 }
}

/**
 * Runs a recursive function expressed as a generator function.
 * This function manages its own call stack to avoid recursion depth limits.
 */
function runRecursive(func) {
 // Object to receive the final return value from the generator function
 var rootCaller = {
  lastReturnValue: null
 };

 // Custom call stack for iterative recursion
 var callStack = [];

 // Collect arguments passed to runRecursive after 'func'
 for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  args[_key - 1] = arguments[_key];
 }

 // Push the initial function call onto the stack
 callStack.push({
  iterator: func.apply(void 0, args),
  lastReturnValue: null,
  caller: rootCaller
 });

 // Process the call stack until it's empty
 while (callStack.length > 0) {
  var stackFrame = callStack[callStack.length - 1]; // Get the current frame
  var iterator = stackFrame.iterator,
   lastReturnValue = stackFrame.lastReturnValue,
   caller = stackFrame.caller;

  // Resume the generator function's execution
  var _iterator$next = iterator.next(lastReturnValue),
   value = _iterator$next.value,
   done = _iterator$next.done;

  if (done) {
   // If the function has completed (returned a value)
   caller.lastReturnValue = value; // Record its return value in the caller
   callStack.pop(); // Remove from stack
  } else {
   // If the function yielded (meaning it's making a recursive call)
   // 'value' contains the arguments for the new recursive call
   callStack.push({
    iterator: func.apply(void 0, _toConsumableArray(value)),
    lastReturnValue: null,
    caller: stackFrame // The current frame becomes the caller of the new frame
   });
  }
 }

 return rootCaller.lastReturnValue; // Return the result of the initial call
}