/*
 * This JavaScript file contains the implementation for a job scheduling problem
 * using a priority queue. It processes job data from standard input.
 * The goal is to maximize the total reward by selecting jobs that can be completed
 * within their respective deadlines.
 */

// Define the main function that orchestrates the job processing logic.
function   main( input )
{
  // Step 1: Parse the raw input string.
  // First, remove any leading/trailing whitespace, then split the string
  // into an array of lines based on the newline character.
  var    args    =    input.trim().split( "\n" );

  // Step 2: Extract N (total jobs) and M (available days) from the first line.
  // The first element of 'args' (args[0]) contains these two numbers,
  // separated by a space. Split and convert them to integers.
  var  info = args[0].split( " " ).map( (v) => parseInt(v) );

  // N represents the total count of jobs provided in the input.
  var    N    =    info[0]    ;

  // M represents the number of days we have available to work on jobs.
  var  M = info[1];

  // Step 3: Parse the job details from the remaining lines.
  // Filter out the first line (which contains N and M).
  // For each subsequent line, split it by space to get the job's deadline
  // and its reward, then convert these to integers.
  var jobs = args.filter( (v, i) => i !== 0 ).map( (v) => {
    // Each job entry is an array: [deadline, reward].
    return v.split( " " ).map( v2 => parseInt(v2) );
  } ) ;

  // Step 4: Sort the jobs by their deadline.
  // This sorting is crucial for efficiently processing jobs day by day.
  // Jobs with earlier deadlines will be considered first.
  jobs.sort( (a, b) => {
    // Custom comparison function for ascending order of deadlines (a[0]).
    // If a's deadline is greater than b's, a comes after b (return 1).
    // Otherwise, a comes before b (return -1).
    return a[0] > b[0] ? 1 : -1 ;
  } );


  // Step 5: Initialize a PriorityQueue and other variables for the main loop.
  // The PriorityQueue will store jobs that are available to be done on the current day,
  // ordered by their reward (highest reward first).
  var pq = new PriorityQueue() ;

  // 'result' will accumulate the total maximum reward.
  var result = 0 ;

  // 'j' is an index used to iterate through the sorted 'jobs' array.
  var j = 0 ;

  // Step 6: Main loop - Iterate through each day from 1 to M.
  for ( var i = 1 ; M >= i ; i++ ) {
    // On each day 'i', add all jobs whose deadline is exactly 'i'
    // (or rather, can be started on day 'i' as per problem context)
    // into the priority queue.
    while ( !!jobs[j] && jobs[j][0] === i ) {
      // We push the negative of the job's reward into the min-heap PriorityQueue.
      // This way, the smallest value in the PQ will correspond to the largest positive reward,
      // allowing us to easily retrieve the highest-reward job.
      pq.push( -jobs[j][1] ) ;
      // Move to the next job in the sorted list.
      j++ ;
    }

    // If the priority queue is empty for the current day,
    // it means there are no available jobs to pick.
    // In this scenario, we simply skip to the next day.
    if ( !pq.size() ) {
      continue ;
    }

    // If there are available jobs in the priority queue,
    // we extract the one with the highest reward (which is the smallest negative value).
    // Add its positive reward to our total result.
    result += -pq.pop() ;
  }

  // Step 7: Output the final calculated maximum achievable reward.
  console.log( result ) ;
}

/*
 * PriorityQueue Class Implementation.
 * This implementation uses a binary min-heap structure.
 * Elements are stored in an array, maintaining the heap property
 * where each parent node is less than or equal to its children.
 */
function     PriorityQueue()
{
  // The 'heap' array stores the elements of the priority queue.
  this.heap = [] ;
}

// Define methods for the PriorityQueue prototype to extend its functionality.
PriorityQueue.prototype = {
  // The 'push' method adds a new element 'x' to the priority queue.
  push : function(x) {
    var h = this.heap, i = h.length++, j ; // h: heap array, i: index for the new element, j: parent index
    // 'Bubble up' the new element to maintain the min-heap property.
    while ( i ) {
      j = i - 1 >> 1 ; // Calculate the parent's index (integer division by 2).
      if ( h[j] <= x ) break ; // If the parent is smaller or equal, the heap property is satisfied.
      h[i] = h[j] ; // Move the parent down to the current position.
      i = j ; // Move up to the parent's position to continue bubbling.
    }
    h[i] = x ; // Place the new element in its final sorted position.
  },

  // The 'pop' method removes and returns the smallest element from the priority queue.
  pop : function() {
    var h = this.heap, r = h[0], x = h.pop() ; // r: root (smallest element), x: the last element in the heap
    // If the heap becomes empty after removing the root, simply return the removed root.
    if ( !h.length ) return r ;

    var i = 0, k = h.length >> 1, j ; // i: current index, k: index of the last parent node, j: child index
    // 'Bubble down' the last element (now at the root) to maintain the min-heap property.
    while ( i < k ) {
      j = ( i << 1 ) + 1 ; // Calculate the index of the left child.
      // Check if a right child exists and if it's smaller than the left child.
      if ( h[j+1] < h[j] ) ++j ; // If so, compare with the right child (the smaller of the two children).
      if ( x <= h[j] ) break ; // If the current element is smaller than or equal to its smallest child, stop.
      h[i] = h[j] ; // Move the smaller child up to the current position.
      i = j ; // Move down to the child's position to continue bubbling.
    }
    // Place the element (which was originally the last element) in its final position.
    h[i] = x ;
    return r ; // Return the original smallest element that was removed.
  },

  // The 'size' method returns the current number of elements in the priority queue.
  size : function() {
    return this.heap.length ;
  },

  // The 'top' method returns the smallest element without removing it.
  // This is always the element at the root of the heap (index 0).
  top : function() {
    return this.heap[0] ;
  },
};

// This line reads the input from standard input, decodes it as UTF-8,
// and then passes it to the 'main' function to begin processing.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;