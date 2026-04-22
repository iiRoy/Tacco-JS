/*
 * This file contains JavaScript code implementing a Disjoint Set Union (DSU) data structure
 * to solve a problem related to island connectivity and "unconvenience" calculation.
 *
 * The DSU structure manages islands, allowing them to be merged into groups
 * and efficiently determining if two islands belong to the same group.
 *
 * The main logic processes bridges in reverse order to calculate the unconvenience
 * (number of unconnected island pairs) as bridges are added.
 */

/*
 * This function initializes a collection of islands.
 * Each island is represented by an object containing its parent and size.
 * The index in the array serves as the island's identifier.
 */
function   init_islands  (  n  )
{
    var   islands   =   [  ]  ;  // Declare an empty array to hold island data.

    for  (  var   i  =  0  ;   i  <  n  ;   i  ++  )
    {
        islands  [  i  ]    =    {   // Assign a new island object at the current index.
            parent  :   i  ,  // Initially, each island is its own parent.
            size    :   1  ,   // Each new island starts with a size of 1.
        }  ;
    }

    return   islands  ;   // Return the fully initialized array of islands.
}


/**
 * Checks if two islands belong to the same connected component (group).
 * @param {number} left_index - The index of the first island.
 * @param {number} right_index - The index of the second island.
 * @param {Array<Object>} islands - The array containing all island data.
 * @returns {boolean} True if they are in the same group, false otherwise.
 */
function   same_group  (  left_index  ,   right_index  ,   islands  )
{
    // Find the root parent of the right island.
    const   right_root   =   root  (  right_index  ,   islands  )  ;

    // Find the root parent of the left island.
    const   left_root    =   root  (  left_index  ,   islands  )  ;

    // Compare their root parents to determine if they are in the same group.
    return   (  right_root   ==   left_root  )  ;
}


/* This function attempts to merge two islands or their respective groups. */
function   merge_islands  (  left_index  ,   right_index  ,   islands  )
{
    // If the islands are already in the same group, there's nothing to merge.
    if  (  same_group  (  left_index  ,   right_index  ,   islands  )  )
    {
        return  ;   // Exit the function early.
    }

    // Determine the root of the right island's group.
    const   right_root   =   root  (  right_index  ,   islands  )  ;

    // Determine the root of the left island's group.
    const   left_root    =   root  (  left_index  ,   islands  )  ;

    // Update the size of the left group by adding the size of the right group.
    left_root  .  size   =   left_root  .  size   +   right_root  .  size  ;

    // Make the left island's index the parent of the right island's root.
    // This effectively merges the right group into the left group.
    right_root  .  parent   =   left_index  ;
}


// Function to find the root node of an island's group and perform path compression.
function   root  (  index  ,   islands  )
{
    // Get the node corresponding to the given index.
    var   node   =   islands  [  index  ]  ;

    // If the node's parent is itself, it is the root of its group.
    if  (  node  .  parent   ==   index  )
    {
        return   node  ;   // Return the root node.
    }

    // Recursively find the root of the parent. This also performs path compression.
    var   root_node   =   root  (  node  .  parent  ,   islands  )  ;

    // Update the current node's parent directly to the found root,
    // thereby compressing the path for future lookups.
    node  .  parent   =   root_node  .  parent  ;

    // Return the identified root node.
    return   root_node  ;
}


/**
 * Retrieves the size of the group to which a given island belongs.
 * @param {number} index - The index of the island.
 * @param {Array<Object>} islands - The array containing all island data.
 * @returns {number} The size of the group.
 */
function   get_size  (  index  ,   islands  )
{
    // First, find the root node of the island's group.
    var   root_node   =   root  (  index  ,   islands  )  ;

    // The size property of the root node holds the total size of its group.
    return   root_node  .  size  ;
}


/*
 * The main entry point of the application.
 * It processes input to calculate island connectivity and 'unconvenience'.
 */
function   main  (  input  )
{
    // Parse the input string into a 2D array of numbers.
    const   formatted_input   =   input  .  split  (  '\n'  )  .  map  (  x   =>   x  .  split  (  ' '  )  .  map  (  x   =>   parseInt  (  x  ,   10  )  )  )  ;

    // Extract the number of islands (N) and the number of bridges (M) from the first line of input.
    const   N   =   formatted_input  [  0  ]  [  0  ]  ;
    const   M   =   formatted_input  [  0  ]  [  1  ]  ;

    // Initialize an array to store bridges in reverse order of processing.
    var   reverse_bridges   =   [  ]  ;

    // Populate the reverse_bridges array from the input, skipping the first line.
    for  (  var   i  =  0  ;   i  <  M  ;   i  ++  )
    {
        reverse_bridges  .  push  (  formatted_input  [  1  +  i  ]  )  ;
    }

    // Reverse the order of bridges to process them from last to first.
    reverse_bridges   =   reverse_bridges  .  reverse  (  )  ;

    // Initialize the Disjoint Set Union (DSU) structure for N islands.
    var   islands   =   init_islands  (  N  )  ;

    // Calculate the initial 'unconvenience' (total pairs of unconnected islands).
    var   unconvinience   =   N   *  (  N  -  1  )  /  2  ;

    // Initialize an array to store the unconvenience values at each step.
    var   results   =   [  unconvinience  ]  ;

    // Iterate through the bridges in reverse order.
    for  (  let   bridge   of   reverse_bridges  )
    {
        // Debugging line, commented out.
        // console.log(bridge);

        // Extract and adjust island indices (0-based).
        let   left_index    =   bridge  [  0  ]  -  1  ;
        let   right_index   =   bridge  [  1  ]  -  1  ;

        // Check if the two islands are currently in different groups.
        if  (  !  same_group  (  left_index  ,   right_index  ,   islands  )  )
        {
            // If they are in different groups, calculate the number of new connected pairs
            // that will be formed by connecting these two groups.
            var   diff   =   get_size  (  (  left_index  )  ,   islands  )   *   get_size  (  right_index  ,   islands  )  ;

            // Subtract this 'diff' from the total unconvenience.
            unconvinience   -=   diff  ;
        }

        // Store the current unconvenience value.
        results  .  push  (  unconvinience  )  ;

        // Merge the two island groups.
        merge_islands  (  left_index  ,   right_index  ,   islands  )  ;
    }

    // Reverse the results array to get the unconvenience values in the original bridge order.
    const   reversed_result   =   results  .  reverse  (  )  ;

    // Output the unconvenience values, starting from the second element (index 1)
    // because the first element corresponds to the state before any bridges are removed.
    for  (  var   i   =   1  ;   i   <=   M  ;   i  ++  )
    {
        console  .  log  (  reversed_result  [  i  ]  )  ;
    }
}

// Read input from stdin and pass it to the main function.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )  ;

// End of file marker, indicating the time of completion or last modification.
// 02:05:00 >