input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input as a UTF-8 string

// Split the input string into an array of lines
lines = input.split('\n');

// The first line contains two space-separated numbers, N and K
line = lines.shift().split(' ');

// Parse N and K from the first line. The `* 1` converts string to number.
N = line[0] * 1;
K = line[1] * 1;

// The second line contains the initial array A, also space-separated
A = lines.shift().split(' ');


// Define a custom Heap data structure.
// This implementation uses 1-based indexing for the internal array,
// where index 0 is left unused to simplify parent/child calculations.
_Heap = {

    heap: [], // The array that stores the heap elements. heap[0] is a placeholder.

    // Default comparison function for a min-heap (a < b).
    // This will be overridden in `create` for a max-heap.
    compare: (a, b) => a < b,


    /**
     * Initializes the heap with a given array of values.
     *
     * @param {Array<string>} arr - An array of string representations of numbers to be added to the heap.
     * @param {boolean} desc - If true, the heap will be a max-heap; otherwise, a min-heap.
     */
    create: function(arr, desc) {
        // Initialize the heap array with a dummy element at index 0.
        this.heap = [0];

        // If 'desc' is true, configure the heap to be a max-heap.
        if (desc) {
            this.compare = (a, b) => a > b; // Comparison for max-heap
        }

        // Iterate through the input array and push each element into the heap.
        // Each element is converted to a number using `* 1`.
        for (var i = 0; i < arr.length; i++) {
            this.push(arr[i] * 1);
        }
    },


    /**
     * Inserts a new value into the heap, maintaining the heap property.
     *
     * @param {number} v - The value to be inserted.
     */
    push: function(v) {
        // Start from the end of the heap (the next available position).
        var idx = this.heap.length;

        // Bubble up the new value by comparing it with its parent.
        while (idx > 1) {
            // Calculate the parent's index. `~~` is a bitwise trick for floor division.
            var parent = ~~(idx / 2);

            // If the new value 'v' is "smaller" (according to `compare`) than its parent,
            // then the parent needs to move down.
            if (this.compare(v, this.heap[parent])) {
                this.heap[idx] = this.heap[parent]; // Move parent to current position
                idx = parent; // Update current position to parent's position
            } else {
                // If `v` is not "smaller" than its parent, it's in the correct place.
                break;
            }
        }
        // Place the new value `v` at its final sorted position.
        this.heap[idx] = v;
    },


    /**
     * Removes and returns the top element of the heap (either the minimum or maximum,
     * depending on whether it's a min-heap or max-heap).
     *
     * @returns {number | undefined} The top element, or `undefined` if the heap is empty.
     */
    pop: function() {
        // If the heap contains only the dummy element (length 1), it's empty.
        if (this.heap.length == 1) {
            return;
        }
        // If the heap contains only one actual element (length 2), just remove and return it.
        else if (this.heap.length == 2) {
            return this.heap.pop();
        }

        // Store the root element to be returned later.
        var val = this.heap[1];

        // Take the last element from the heap and use it to replace the root.
        var last = this.heap.pop();

        // Start bubbling down the 'last' element from the root position.
        var idx = 1;

        // Loop until the 'last' element finds its correct position.
        while (true) {
            // Calculate the indices of the left and right children.
            var left = idx * 2;
            var right = idx * 2 + 1;
            var next = idx; // 'next' will store the index of the child to swap with.

            // If the left child exists and is "smaller" than 'last', consider it for a swap.
            if (left < this.heap.length && this.compare(this.heap[left], last)) {
                next = left;
            }

            // If the right child exists and is "smaller" than 'last',
            // AND also "smaller" than the left child (if left was chosen), then choose the right child.
            if (
                   right < this.heap.length
                && this.compare(this.heap[right], last)
                && this.compare(this.heap[right], this.heap[next])
            ) {
                next = right;
            }

            // If a child was chosen for swapping (meaning 'last' needs to move down).
            if (next != idx) {
                this.heap[idx] = this.heap[next]; // Move the chosen child up to current position.
                idx = next; // Move down to the child's position.
            } else {
                // If no child was smaller, 'last' is in its correct place.
                break;
            }
        }
        // Place the 'last' element at its final sorted position.
        this.heap[idx] = last;

        // Return the original root value.
        return val;
    }

}; // End of _Heap object definition.


// Initialize the heap with the array A.
// The `true` argument indicates that a max-heap should be created.
_Heap.create(A, true);


// Perform K operations as described in the problem:
// For each operation, pop the largest element, divide it by 2 (integer division),
// and push the result back into the heap.
for (i = 0; i < K; i++) {
    a = _Heap.pop(); // Get the current maximum element
    _Heap.push(~~(a / 2)); // Integer divide by 2 and push back
}


// Calculate the sum of all elements remaining in the heap.
// Start from index 1 because heap[0] is unused.
sum = 0;
for (i = 1; i < _Heap.heap.length; i++) {
    sum += _Heap.heap[i];
}


// Print the final calculated sum to the console.
console.log(sum);