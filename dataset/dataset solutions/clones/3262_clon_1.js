'use strict'
// This line declares strict mode for the entire script, enforcing stricter parsing and error handling.


class Main { // Defines the main class that encapsulates the problem-solving logic.

  solve() { // The primary method to execute the solution.

    const nums = input.nextIntArr(); // Reads the first line of input as an array of integers.

    const k = nums[1]; // Extracts the second number from 'nums' and assigns it to 'k'.

    const table = input.nextIntRange(nums[0]); // Reads 'nums[0]' lines of input, each as an array of integers.

    const score = []; // Initializes an empty array to store calculated scores.


    // Sorts the 'table' array in descending order based on the second element of each sub-array.
    table.sort(e => e[1]).reverse();

    // Selects the first 'k' elements from the sorted 'table'.
    const s = _.first(table, k);

    // Creates an object to count the occurrences of the first element (kind) for items in 's'.
    const kinds = {};
    s.forEach(e => kinds[e[0]] = (kinds[e[0]] ? kinds[e[0]] + 1: 1)); // Increments count or initializes to 1.

    let kind = Object.keys(kinds).length; // Determines the initial number of unique kinds present in 's'.

    // Calculates the initial score based on the sum of the second elements of 's' for the current 'kind'.
    score[kind] = _.sum(s.map(s => s[1]));


    const heap = new BinaryHeap(); // Instantiates a new BinaryHeap for managing elements.

    // Iterates through 's' and adds elements with duplicate kinds to the heap.
    s.forEach(e => {
      if (kinds[e[0]] > 1) { // Checks if the kind of the current element 'e' appears more than once.
        heap.push(e[1], e); // Pushes the element's second value as priority and the element itself as value.
      }
    });


    let cur = s.length; // Initializes a cursor to track the position in the 'table' array beyond 's'.

    // Main optimization loop: continues as long as the heap is not empty and there are more elements in 'table'.
    while (heap.length > 0 && cur < table.length) {

      const target = heap.pop(); // Removes the element with the highest priority (largest second value) from the heap.

      if (kinds[target[0]] >= 2) { // Checks if the 'target' element's kind still has duplicates.

        --kinds[target[0]]; // Decrements the count for the 'target' element's kind.

        do { // Inner loop to find a suitable replacement for the 'target' element.
          let next = table[cur]; // Gets the next element from the 'table' array.
          ++cur; // Advances the cursor to the next position in 'table'.

          if (!kinds[next[0]]) { // Checks if the 'next' element's kind is new (not yet counted).
            kinds[next[0]] = 1; // Adds the new kind to the 'kinds' object with a count of 1.
            heap.push(next[1],next); // Adds the new element to the heap.
            ++kind; // Increments the total count of unique kinds.
            // Updates the score: previous score + new element's value - target element's value.
            score[kind] = score[kind - 1] + next[1] - target[1];
            break; // A suitable replacement has been found, exit the inner loop.
          }
        } while(cur < table.length); // Continues searching for a replacement if 'table' has more elements.
      }
    }

    // Maps the 'score' array to calculate final scores, applying the formula: score[i] + i*i.
    // If a score is undefined or null, it defaults to 0.
    const scores = score.map((e,i) => e ? (e + i * i) : 0);

    console.log(_.max(scores)); // Prints the maximum value found in the 'scores' array.
  }
}


class Input { // This class provides utility methods for reading input from standard input.

  constructor() {
    this.cursor = 0; // Initializes a cursor to keep track of the current line being read.
    this.inputAll(); // Calls a method to read all input data upon class instantiation.
  }


  inputAll() { // Reads the entire content of standard input, splits it by newlines.
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data; // Returns the array of input lines.
  }


  nextLine(n) { // Fetches one or more lines from the input data.
    if (n) { // If a number 'n' is provided, it returns 'n' consecutive lines.
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n; // Advances the cursor by 'n' lines.
      return ret;
    }
    return this.data[this.cursor++]; // Otherwise, returns the current line and then increments the cursor.
  }


  nextStrArr() { // Reads the next line and splits it into an array of strings using space as a delimiter.
    return this.nextLine().split(' ');
  }


  nextIntArr() { // Reads the next line, splits it, and parses each part as an integer.
    return this.nextStrArr().map((e) => parseInt(e));
  }


  nextStrRange(n) { // Reads 'n' lines, and for each line, splits it into an array of strings.
    return this.nextLine(n).map((line) => line.split(' '));
  }


  nextIntRange(n) { // Reads 'n' lines, and for each line, splits it and parses elements into integers.
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
}


/* Underscore.js の移植および便利メソッド群 */ // This section contains a collection of utility methods, similar to Underscore.js.
class Underscore {
  // Calculates the sum of all numerical elements in an array.
  sum(arr) { return arr.reduce((a,b)=>a+b); }

  // Finds the minimum element in an array, optionally using a custom comparison function.
  min(arr, func) {
    if (func == null) {
      func = (a,b) => a - b; // Default comparison for numbers.
    }
    return arr.reduce((a,b) => func(a,b) < 0 ? a : b); // Uses reduce to find the minimum.
  }

  // Finds the maximum element in an array, optionally using a custom comparison function.
  max(arr, func) {
    if (func == null) {
      func = (a,b) => a - b; // Default comparison for numbers.
    }
    return arr.reduce((a,b) => func(a,b) > 0 ? a : b); // Uses reduce to find the maximum.
  }

  // Generates an array of numbers forming a specified range.
  range(start, stop, step) {
	if (stop == null) { // If only one argument is provided, it's treated as 'stop', and 'start' defaults to 0.
	  stop = start || 0;
	  start = 0;
	}
	if (!step) { // Determines the step increment/decrement if not explicitly provided.
	  step = stop < start ? -1 : 1;
	}
	const length = Math.max(Math.ceil((stop - start) / step), 0); // Calculates the number of elements in the range.
	const range = Array(length); // Creates an array of the calculated length.

	for (var idx = 0; idx < length; idx++, start += step) { // Populates the array with values from 'start' to 'stop'.
	  range[idx] = start;
	}
	return range; // Returns the generated range array.
  }

  // Retrieves the first element(s) of an array.
  first (array, n) {
    if (array == null || array.length < 1) return n == null ? void 0 : []; // Handles null/empty arrays.
    if (n == null) return array[0]; // If 'n' is not specified, returns the very first element.
    return this.initial(array, array.length - n); // Otherwise, returns the first 'n' elements using 'initial'.
  };

  // Returns all but the last 'n' elements of an array.
  initial (array, n) {
    return array.slice.call(array, 0, Math.max(0, array.length - (n == null ? 1 : n))); // Uses slice to get a sub-array.
  }

  // Returns all but the first 'n' elements of an array.
  tail(arr, n) {
    return array.slice.call(arr, n == null ? 1 : n); // If 'n' is null, returns all but the first element.
  }

  // Retrieves the last element(s) of an array.
  last (array, n) {
    if (n == null) return array[array.length - 1]; // If 'n' is not specified, returns the very last element.
    return this.tail(array, Math.max(0, array.length - n)); // Otherwise, returns the last 'n' elements using 'tail'.
  }

  // Performs a binary search on a sorted array.
  binarySearch (array, key, iteratee) {
	const itr = (obj) => (typeof obj === 'object') ? obj[iteratee] : obj; // Helper function to extract comparison value.
	const value = itr(obj); // NOTE: 'obj' is not defined here in the original code, preserving as-is.
	let low = 0, high = array.length; // Initialize low and high pointers for the search range.
	while (low < high) { // Continue search while the range is valid.
	  let mid = Math.floor((low + high) / 2); // Calculate the middle index.
	  if (itr(array[mid]) < value) low = mid + 1; else high = mid; // Adjust search range based on comparison.
	}
	return low; // Returns the insertion point or the index of the element if found.
  };
}
const _ = new Underscore(); // Creates a global instance of the Underscore utility class.

/* ２分木による最大ヒープ */ // This section implements a Max Binary Heap data structure.
class BinaryHeap {
  constructor() {
    this._data = []; // Internal array to store the heap elements.
    this._length = 0; // Tracks the current number of elements in the heap.
  }

  /* データ追加 priority value */ // Adds a new element with a given priority and value to the heap.
  push(priority, value) {
    const data = this._data;
    data.push({p: priority, v: value}); // Stores elements as objects {priority, value}.
    let i = this._length; // Index of the newly added element (initially at the end).
    let p = (i - 1) >> 1; // Calculates the parent index using bitwise right shift for floor division.

    // Up-heap operation: moves the element up the heap if its priority is greater than its parent's.
    while (p >= 0 && data[p].p < data[i].p) {
      // Swaps the current element with its parent.
      const tmp = data[i]; data[i] = data[p]; data[p] = tmp;
      i = p; // Updates the current index to the parent's position.
      p = (i - 1) >> 1; // Recalculates the new parent index.
    }
    ++this._length; // Increments the heap's length.
  }

  /* データ取出 */ // Removes and returns the element with the highest priority (the root of the heap).
  pop() {
    if (this.length <= 0) { // Checks if the heap is empty.
      return null;
    }
    const length = this._length - 1; // Calculates the new length after removing one element.
    const data = this._data;
    const _top = this.top; // Stores the value of the top element to be returned.
    data[0] = data[length]; // Moves the last element of the heap to the root position.
    data.pop(); // Removes the now duplicated last element.

    let i = 0; // Current index, starting from the root.
    let c1 = (i<<1) + 1; // Calculates the index of the left child.
    let c2 = (i<<1) + 2; // Calculates the index of the right child.

    // Down-heap operation: moves the element at the root down the heap to maintain heap property.
    let p0,p1,p2; // Variables to store priorities for comparison.
    while(c1 < length) { // Continues as long as the left child exists within the heap boundaries.
      if (c2 < length) { // If both left and right children exist.
        p0 = data[i].p; p1 = data[c1].p; p2 = data[c2].p;
        if ((p1 < p2) && (p0 < p2)) { // If the right child has higher priority than both current and left child.
          // Swaps the current element with the right child.
          const tmp = data[i]; data[i] = data[c2]; data[c2] = tmp;
          i = c2; // Moves to the right child's position.
        }
        else if (p0 < p1) { // If the left child has higher priority than the current element.
          // Swaps the current element with the left child.
          const tmp = data[i]; data[i] = data[c1]; data[c1] = tmp;
          i = c1; // Moves to the left child's position.
        } else {
            break; // Heap property is satisfied, no more swaps needed.
        }
        c1 = (i<<1) + 1; c2 = (i<<1) + 2; // Recalculates child indices for the new position.
      }
      else { // If only the left child exists.
        p0 = data[i].p; p1 = data[c1].p;
        if (p0 < p1) { // If the current element's priority is less than its left child's.
          // Swaps the current element with the left child.
          const tmp = data[i]; data[i] = data[c1]; data[c1] = tmp;
        }
        break; // No more children to compare with, heap property satisfied for this branch.
      }
    }

    this._length = length; // Updates the heap's length.
    return _top; // Returns the value of the original top element.
  }

  /* 最大の要素 */ // Getter for the value of the element with the highest priority (at the root).
  get top() {
    return this._data[0].v;
  }

  /* 要素数 */ // Getter for the current number of elements in the heap.
  get length() {
    return this._length;
  }
}


const input = new Input(); // Creates a global instance of the Input class to handle input operations.


(new Main()).solve(); // Instantiates the Main class and immediately calls its 'solve' method to start the program.