/*
 * This file contains a JavaScript implementation of a Priority Queue
 * and a main program that utilizes it to solve a specific problem.
 * The PriorityQueue is implemented as a min-heap.
 */

/*
 * Constructor function for the PriorityQueue.
 * Initializes the internal array that will store the heap elements.
 */
function PriorityQueue ( )
{
  this.heap = [ ] ; // An empty array to represent the heap structure internally.
}

// Define methods for the PriorityQueue prototype.
PriorityQueue.prototype = {

    /*
     * Adds a new element 'x' to the priority queue.
     * This operation maintains the min-heap property by "bubbling up" the new element.
     *
     * @param {any} x - The element to be added to the queue.
     */
    push : function ( x )
    {
        // 'h' is a local reference to the heap array for performance.
        var h = this.heap ,
            // 'i' is the index where the new element 'x' is initially placed (at the end).
            // h.length++ increments the length AFTER its current value is used for 'i'.
            i = h.length++ ,
            j ; // 'j' will store the index of the parent node.

        // Loop to bubble up the new element 'x' if it's smaller than its parent.
        while ( i )
        {
            // Calculate the parent index using bitwise right shift (equivalent to Math.floor((i - 1) / 2)).
            j = ( i - 1 ) >> 1 ;

            // If the parent element is less than or equal to 'x',
            // then 'x' is in its correct position relative to its parent,
            // and the heap property is maintained. We can stop.
            if ( h[j] <= x )
            {
                break ;
            }

            // If 'x' is smaller than its parent, move the parent down to the current position.
            h[i] = h[j] ;

            // Update 'i' to the parent's index to continue bubbling up.
            i = j ;
        }

        // Place the element 'x' at its final sorted position in the heap.
        h[i] = x ;
    } , // End of the push method.


    /*
     * Removes and returns the smallest element (the root) from the priority queue.
     * This operation maintains the min-heap property by "sifting down" the last element.
     *
     * @returns {any} The smallest element that was in the queue.
     */
    pop : function ( )
    {
        // 'h' is a local reference to the heap array.
        var h = this.heap ,
            // 'r' stores the root element (the smallest) which will be returned.
            r = h[0] ,
            // 'x' is the last element of the heap, which is removed and will be used
            // to replace the root and then sifted down.
            x = h.pop ( ) ;

        // 'i' is the current index during the sifting down process, starting at the root.
        var i = 0 ,
            // 'k' represents the index of the last node that can have children.
            // This optimizes the loop by not checking nodes that are guaranteed to be leaves.
            k = h.length >> 1 , // Equivalent to Math.floor(h.length / 2).
            j ; // 'j' will store the index of the child node (left or right).

        // Loop to sift down the element 'x' from the root position.
        while ( i < k )
        {
            // Calculate the index of the left child.
            j = ( i << 1 ) + 1 ; // Equivalent to (i * 2) + 1.

            // Check if the right child exists (j+1 is within bounds)
            // AND if the right child is smaller than the left child.
            if ( h[j+1] < h[j] )
            {
                // If the right child is smaller, we want to compare 'x' with the right child.
                // So, increment 'j' to point to the right child.
                ++j ;
            }

            // If 'x' is smaller than or equal to the smaller of its children,
            // then 'x' is in its correct position, and the sifting process can stop.
            if ( x <= h[j] )
            {
                break ;
            }

            // If 'x' is larger than its smaller child, move the child up to the current position.
            h[i] = h[j] ;

            // Update 'i' to the child's index to continue sifting down.
            i = j ;
        }

        // After the sifting process, if the heap is not empty,
        // place 'x' at its final determined position.
        if ( h.length )
        {
            h[i] = x ;
        }

        // Return the original smallest element that was removed from the queue.
        return r ;
    } , // End of the pop method.


    /*
     * Returns the current number of elements in the priority queue.
     *
     * @returns {number} The count of elements.
     */
    size : function ( )
    {
        return this.heap.length ;
    } , // End of the size method.


    /*
     * Returns the smallest element in the priority queue without removing it.
     * Assumes the queue is not empty; otherwise, it would return undefined.
     *
     * @returns {any} The smallest element.
     */
    top : function ( )
    {
        return this.heap[0] ;
    } // End of the top method.

} ; // End of the PriorityQueue.prototype object definition.


// A utility comparison function for numerical sorting in ascending order.
// This is typically used with Array.prototype.sort().
function compareNumbers2 ( a , b )
{
    // Returns a negative value if 'a' should come before 'b',
    // a positive value if 'b' should come before 'a',
    // and zero if they are considered equal for sorting purposes.
    return a - b ;
}

/*
 * The main entry point function for the program logic.
 * It takes a string 'arg' as input, processes it, and outputs a result.
 *
 * @param {string} arg - The input string, typically from standard input.
 */
function Main ( arg )
{
  // Split the input string by newline characters.
  // The first line contains N, converted to a number by subtracting 0.
  var N = arg.split ( "\n" ) [ 0 ] - 0 ;

  // The second line contains space-separated numbers for array K.
  // It's split by space, and then each part is mapped to a Number type.
  var K = arg.split ( "\n" ) [ 1 ] . split ( " " ) . map ( Number ) ;

  // Sort the array K numerically in ascending order using our custom comparator.
  K.sort ( compareNumbers2 ) ;

  // Instantiate a new PriorityQueue to store the calculated sums of squared differences.
  var ans = new PriorityQueue ( ) ;

  // This loop iterates through a range of potential 'i' values.
  // The range starts from the smallest element in K up to (but not including) the largest.
  for ( var i = K[0] ; i < K[N - 1] ; i++ )
  {
    // Initialize a temporary variable to accumulate the sum of squared differences for the current 'i'.
    var tmp = 0 ;

    // Inner loop to calculate the sum of squared differences for the current 'i'
    // across all elements in the array K.
    for ( var j = 0 ; j < N ; j++ )
    {
      // Calculate (K[j] - i)^2 and add it to 'tmp'.
      tmp += ( K[j] - i ) * ( K[j] - i ) ;
    }

    // Push the calculated sum 'tmp' into the priority queue.
    // The priority queue will automatically ensure the smallest 'tmp' is accessible at the top.
    ans.push ( tmp ) ;
  }


  // After evaluating all possible 'i' values in the specified range,
  // the smallest sum of squared differences will be at the top of the priority queue.
  // Log this minimum value to the console.
  console.log ( ans.top ( ) ) ;

  // Explicitly return from the function; no value is returned.
  return ;
}

// This line is the entry point for running the script, typically in a Node.js environment.
// It reads the entire content of "/dev/stdin" (standard input) as a UTF-8 string,
// and then passes that string as an argument to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;