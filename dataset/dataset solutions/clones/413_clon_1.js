// This is a Type I clone of the original JavaScript code.
// It maintains exact logical and structural identity,
// with extensive variations only in whitespace and comments.

// Import the 'fs' module to read from the file system.
const    input    =    require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,  'utf8'  ) ;

// Process the raw input: trim whitespace and split into an array of lines.
const    inputs    =    input . trim (  ) . split (  '\n'  ) ;


// Define the allowed colors for the worm segments.
const    COLORS    =    [ 'r' , 'g' , 'b' ] ;

/**
 * Represents a worm in the game.
 * Each worm has an ID (string of colors) and a depth (distance from the start).
 */
class    Worm    {

  /**
   * Constructs a new Worm instance.
   * @param {string} id - The string representation of the worm's colors (e.g., "rgb").
   * @param {number} depth - The depth of this worm in the BFS tree.
   */
  constructor (  id  ,  depth  )    {
    this . id    =    id ;        // Store the worm's unique identifier.
    this . depth    =    depth ;    // Store the depth (number of transformations to reach this state).
    this . colors    =    id . split (  ''  ) ;    // Convert the ID string into an array of individual color characters.
  }

  /**
   * Calculates all possible next worm IDs that can be reached from the current worm.
   * A transformation occurs when two adjacent segments of the same color are found.
   * If two adjacent segments are different colors, they are replaced by the third color.
   * @returns {string[]} An array of strings, where each string is a potential next worm ID.
   */
  getNextWormIds (  )    {
    const    nextWormIds    =    [  ] ;    // Initialize an empty array to store the IDs of the next possible worms.

    // Iterate through the worm's colors, checking pairs of adjacent segments.
    for    (    let    i    =    0 ;    i    <    this . colors . length    -    1 ;    i ++    )    {
      const    color    =    this . colors [    i    ] ;        // Get the current segment's color.
      const    nextColor    =    this . colors [    i    +    1    ] ;    // Get the next segment's color.

      // If the adjacent colors are the same, no transformation is possible at this position.
      if    (    color    ===    nextColor    )    {
        continue ;    // Skip to the next pair of segments.
      }

      // Determine the third color (the one not present in the current pair).
      const    changedColor    =    COLORS . filter (    s    =>    s    !==    color    &&    s    !==    nextColor    ) [    0    ] ;

      // Create a mutable copy of the current colors array.
      const    changedColors    =    this . colors . slice (  ) ;    // This creates a shallow copy of the array.

      // Replace the two adjacent different-colored segments with two segments of the 'changedColor'.
      changedColors . splice (    i    ,    2    ,    changedColor    ,    changedColor    ) ;    // Replace 2 elements from index i.

      // Add the new worm ID (string representation of the changed colors) to the list.
      nextWormIds . push (    changedColors . join (  ''  )    ) ;
    }

    return    nextWormIds ;    // Return the array of all generated next worm IDs.
  }
}

/**
 * Implements a graph structure to perform Breadth-First Search (BFS)
 * on worm transformations.
 */
class    Graph    {

  /**
   * Initializes a new Graph instance.
   * Uses a Map to store Worm objects, keyed by their ID.
   */
  constructor (  )    {
    this . map    =    new    Map (  ) ;    // A Map to store all visited Worm objects, indexed by their string ID.
  }

  /**
   * Checks if a worm with the given ID already exists in the graph.
   * @param {string} id - The ID of the worm to check.
   * @returns {boolean} True if the worm exists, false otherwise.
   */
  has (  id  )    {
    return    this . map . has (    id    ) ;
  }

  /**
   * Retrieves a Worm object by its ID.
   * @param {string} id - The ID of the worm to retrieve.
   * @returns {Worm|undefined} The Worm object if found, otherwise undefined.
   */
  get (  id  )    {
    return    this . map . get (    id    ) ;
  }

  /**
   * Adds a new Worm object to the graph, or updates an existing one.
   * @param {string} id - The ID of the worm.
   * @param {number} depth - The depth of the worm in the BFS tree.
   */
  set (  id  ,  depth  )    {
    this . map . set (    id    ,    new    Worm (    id    ,    depth    )    ) ;    // Create a new Worm instance and store it.
  }

  /**
   * Performs a Breadth-First Search starting from a given worm ID.
   * The goal is to find the shortest path to a worm from which no further transformations are possible.
   * @param {string} wormId - The starting ID of the worm for the BFS.
   * @returns {Worm|undefined} The terminal Worm object if found, or undefined if the queue becomes empty without finding one.
   */
  bfs (  wormId  )    {
    this . queue    =    [  ] ;    // Initialize the BFS queue.

    this . set (    wormId    ,    0    ) ;    // Add the starting worm to the graph with depth 0.
    this . queue . push (    wormId    ) ;    // Enqueue the starting worm ID.

    // Continue BFS as long as there are worms in the queue to process.
    while (    this . queue . length    )    {
      const    currentWormId    =    this . queue . shift (  ) ;    // Dequeue the next worm ID.
      const    currentWorm    =    this . get (    currentWormId    ) ;    // Retrieve the corresponding Worm object.

      // Generate all possible next worm IDs from the current worm.
      const    nextWormIds    =    currentWorm . getNextWormIds (  ) ;

      // If no further transformations are possible from this worm, it's a terminal state.
      if    (    ! nextWormIds . length    )    {
        return    currentWorm ;    // This is the worm we are looking for.
      }

      // Process each generated next worm ID.
      nextWormIds . forEach (    nextId    =>    {
        // If this worm ID has already been visited, skip it to avoid cycles and redundant work.
        if    (    this . has (    nextId    )    )    {
          return ;
        }
        // If it's a new worm ID, add it to the graph with an incremented depth.
        this . set (    nextId    ,    currentWorm . depth    +    1    ) ;
        this . queue . push (    nextId    ) ;    // Enqueue the new worm ID for future processing.
      }    )
    }

    // If the queue becomes empty and no terminal worm was found, return undefined.
    // This case theoretically shouldn't happen if there's always a terminal state.
    return    undefined ;
  }

  /**
   * (This method is not used in the provided problem context but demonstrates graph traversal).
   * Prints information about all nodes in the graph.
   */
  print (  )    {
    for    (    let    i    =    1 ;    i    <=    this . map . size ;    i ++    )    {
      const    node    =    this . map . get (    i    ) ;
      console . log (    node . toString (  )    ) ;
    }
  }
}


// Main execution loop: process each input worm ID.
inputs . forEach (    initialWormId    =>    {
  // If the input is '0', it signifies the end of input or a special case to ignore.
  if    (    initialWormId    ===    '0'    )    {
    return ;    // Skip processing for '0'.
  }

  // Create a new graph for each independent worm transformation problem.
  const    graph    =    new    Graph (  ) ;

  // Perform BFS to find the terminal worm and its depth.
  const    terminalWorm    =    graph . bfs (    initialWormId    ) ;

  // Output the depth of the terminal worm, or 'NA' if no terminal worm was found.
  // The problem implies a terminal worm is always found.
  console . log (    terminalWorm    ?    terminalWorm . depth    :    'NA'    ) ;
}    ) ;