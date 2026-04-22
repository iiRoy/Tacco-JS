const input = require  ('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
// Reads the entire content of the standard input file as a UTF-8 string.
const inputs = input . trim ( ) . split ( '\n' ) ;


// Defines a constant array holding the allowed single-character color identifiers.
const COLORS = [ 'r' , 'g' , 'b' ] ;

/**
 * @class Worm
 * @description Represents a "worm" with a unique ID, its depth in a transformation graph,
 *              and its constituent color segments.
 */
class Worm {

  /**
   * @constructor
   * @param {string} id    - The unique string identifier of the worm (e.g., "rgb").
   * @param {number} depth - The depth of this worm in the BFS graph, indicating
   *                         how many transformations it took to reach this state from the initial state.
   */
  constructor ( id , depth ) {
    this . id = id ;
    this . depth = depth ; // The depth of this worm in the transformation sequence.
    this . colors = id . split ( '' ) ;
  }

  /**
   * @method getNextWormIds
   * @description Computes all possible next worm states by applying a specific transformation rule:
   *              If two adjacent color segments are different, they can be transformed into the
   *              third color.
   * @returns {string[]} An array of strings, where each string is the ID of a possible next worm state.
   */
  getNextWormIds ( ) {
    const nextWormIds = [ ] ; // Initialize an empty array to store the IDs of subsequent worms.

    // Iterate through adjacent pairs of colors in the current worm's color sequence.
    for ( let i = 0 ; i < this . colors . length - 1 ; i ++ ) {
      // Extract the current and next color segments.
      const [ current , next ] = this . colors . slice ( i , i + 2 ) ;

      // If the adjacent colors are identical, no transformation is possible for this pair.
      if ( current === next ) {
        continue ; // Skip to the next pair.
      }

      // Determine the 'changed' color: it's the color that is neither 'current' nor 'next'.
      const changed = COLORS . filter ( s => s !== current && s !== next ) [ 0 ] ;

      // Create a mutable copy of the current worm's color segments.
      const changedColors = this . colors . slice ( ) ; // This creates a shallow copy of the array.

      // Replace the two adjacent different colors with two instances of the 'changed' color.
      changedColors . splice ( i , 2 , changed , changed ) ; // 置き換え (Replacement operation)

      // Add the new worm ID (formed by joining the modified color segments) to the list.
      nextWormIds . push ( changedColors . join ( '' ) ) ;
    }

    return nextWormIds ; // Return the collection of all derivable worm IDs.
  }
}

/**
 * @class Graph
 * @description Represents a graph for worm transformations, using a Breadth-First Search (BFS)
 *              algorithm to find the shortest path (minimum depth) to a terminal state.
 */
class Graph {

  /**
   * @constructor
   * @description Initializes the graph with an empty map to store visited worms and their properties.
   */
  constructor ( ) {
    this . map = new Map ( ) ; // Stores wormId -> Worm object for visited worms.
  }

  /**
   * @method bfs
   * @description Performs a Breadth-First Search starting from a given worm ID to find
   *              the shortest sequence of transformations until a worm with no further
   *              possible transformations is reached.
   * @param {string} wormId - The starting worm ID for the BFS.
   * @returns {Worm|undefined} The terminal worm object if found, otherwise undefined (though
   *                           the problem implies a terminal state is always reachable).
   */
  bfs ( wormId ) {
    this . queue = [ ] ; // Initialize the queue for BFS.

    // Add the starting worm to the map with depth 0.
    this . map . set ( wormId , new Worm ( wormId , 0 ) ) ;
    this . queue . push ( wormId ) ; // Enqueue the starting worm ID.

    // Continue BFS as long as there are worms in the queue to process.
    while ( this . queue . length ) {
      const currentWormId = this . queue . shift ( ) ; // Dequeue the next worm ID.
      const currentWorm = this . map . get ( currentWormId ) ; // Retrieve the corresponding Worm object.

      // Get all possible next worm IDs from the current worm.
      const nextWormIds = currentWorm . getNextWormIds ( ) ;

      // If there are no next worm IDs, this is a terminal state. Return this worm.
      if ( ! nextWormIds . length ) {
        return currentWorm ;
      }

      // For each potential next worm state:
      nextWormIds . forEach ( newWormId => {
        // If this worm ID has already been visited, skip it.
        if ( this . map . has ( newWormId ) ) {
          return ;
        }

        // Mark the new worm ID as visited, creating a new Worm object with an incremented depth.
        this . map . set ( newWormId , new Worm ( newWormId , currentWorm . depth + 1 ) ) ;
        this . queue . push ( newWormId ) ; // Enqueue the new worm ID for future processing.
      } ) ;
    }
  }
}

// Main execution block: Process each input worm ID.
inputs . forEach ( inputWormId => {
  // If the input is '0', it signifies the end of input, so skip processing.
  if ( inputWormId === '0' ) {
    return ;
  }

  const graph = new Graph ( ) ; // Create a new graph for each input worm.
  const resultWorm = graph . bfs ( inputWormId ) ; // Run BFS to find the terminal worm.

  // Output the depth of the terminal worm, or 'NA' if no terminal worm was found (shouldn't happen based on problem).
  console . log ( resultWorm ? resultWorm . depth : 'NA' ) ;
} ) ;