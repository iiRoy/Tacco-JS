/* *****************************************************************************
 * This script provides robust, reusable functionality for solving Traveling
 * Salesperson Problem (TSP) instances specifically tailored for use with
 * Google Maps API. It includes various optimization algorithms.
 *
 * Original Authors:
 *   - James Tolley <info [at] gmaptools.com>
 *   - Geir K. Engdahl <geir.engdahl (at) gmail.com>
 *
 * Project Home (for latest version and documentation):
 *   http://code.google.com/p/google-maps-tsp-solver/
 *
 * For updates and community discussions, subscribe to:
 *   google-maps-tsp-solver@googlegroups.com
 *
 * Version Information:
 *   Version: 1.0
 *   Date:    05/07/10
 *
 * Please refer to the project website for detailed usage instructions and examples.
 **************************************************************************** */

( function ( ) { // Immediately Invoked Function Expression to encapsulate scope

    // Core TSP Solver instance, designed as a singleton pattern.
    var tsp ;

    // Google Maps API related objects:
    var gebMap ;                // Reference to the Google Map DOM element.
    var directionsPanel ;       // DOM object for displaying driving directions.
    var gebDirectionsResult ;   // Stores the result object from Google DirectionsService.
    var gebDirectionsService ;  // Service for requesting driving directions.
    var gebGeocoder ;           // Service for geocoding addresses.

    // Configuration and limits for the TSP solver:
    var maxTspSize = 100 ;      // Maximum number of locations allowed in a TSP problem.
    var maxTspBF = 0 ;          // Maximum problem size for brute-force algorithm.
    var maxTspDynamic = 15 ;    // Max problem size for dynamic programming algorithm.
    var maxSize = 10 ;          // Max waypoints per single Google Directions API request.
    var maxTripSentry = 2000000000 ; // A very large number to initialize 'best trip' cost.
    var avoidHighways = false ; // Option to avoid highways in route calculations.
    var avoidTolls = false ;    // Option to avoid toll roads.
    var travelMode ;            // Specifies the travel mode (e.g., DRIVING, WALKING).
    var distIndex ;             // Helper index for distance calculations.

    // Arrays to store problem data and internal states:
    var waypoints = new Array ( ) ;     // Array of LatLng objects for waypoints.
    var addresses = new Array ( ) ;     // Array of address strings.
    var GEO_STATUS_MSG = new Array ( ) ; // Geocoding status messages.
    var DIR_STATUS_MSG = new Array ( ) ; // Directions status messages.
    var labels = new Array ( ) ;        // Labels for waypoints/markers.
    var addr = new Array ( ) ;          // Temporary storage for addresses.
    var wpActive = new Array ( ) ;      // Boolean array indicating active waypoints.

    // Request handling and processing flags:
    var addressRequests = 0 ;           // Counter for pending geocoding requests.
    var addressProcessing = false ;     // Flag indicating if address processing is ongoing.
    var requestNum = 0 ;                // General request counter.
    var currQueueNum = 0 ;              // Current queue number for processing.

    // Variables for storing intermediate and final route calculation results:
    var wayArr ;                        // Array of waypoints for directions request.
    var legsTmp ;                       // Temporary storage for route legs.
    var distances ;                     // Matrix of distances between waypoints.
    var durations ;                     // Matrix of durations between waypoints.
    var legs ;                          // Final processed route legs.
    var dist ;                          // Shorter alias for distances matrix.
    var dur ;                           // Shorter alias for durations matrix.
    var visited ;                       // Boolean array to track visited nodes in algorithms.
    var currPath ;                      // Stores the current path being evaluated.
    var bestPath ;                      // Stores the best path found so far.
    var bestTrip ;                      // Stores the cost of the best path found so far.
    var nextSet ;                       // Used in dynamic programming for set manipulation.
    var numActive ;                     // Number of active waypoints in the current problem.
    var costForward ;                   // Precomputed forward costs for path segments.
    var costBackward ;                  // Precomputed backward costs for path segments.
    var improved = false ;              // Flag to indicate if an improvement was made in an iteration.
    var chunkNode ;                     // Temporary node for chunk processing.
    var okChunkNode ;                   // Another temporary node for chunk processing.

    // Directions computation tracking:
    var numDirectionsComputed = 0 ;     // Count of directions requests completed.
    var numDirectionsNeeded = 0 ;       // Total directions requests required.
    var cachedDirections = false ;      // Flag if directions data is cached.
    var requestLimitWait = 1000 ;       // Time to wait between directions requests (ms).
    var fakeDirResult ;                 // Dummy object for travel info, needed by route renderer.

    // Callback functions for external interaction:
    var onSolveCallback = function ( ) { } ; // Callback executed upon successful TSP solution.
    var onProgressCallback = null ;           // Callback for progress updates during computation.
    var originalOnFatalErrorCallback = function ( tsp , errMsg ) { alert ( "Request failed: " + errMsg ) ; } ; // Default error handler.
    var onFatalErrorCallback = originalOnFatalErrorCallback ; // Current error handler, can be overridden.

    // Control flags:
    var doNotContinue = false ;         // Flag to stop ongoing processes.

    // Event listeners:
    var onLoadListener = null ;         // Listener for load events.
    var onFatalErrorListener = null ;   // Listener for fatal error events.

    // Units for directions (e.g., METRIC, IMPERIAL):
    var directionunits ;

    /**
     * Computes a greedy (nearest-neighbor) solution to the Traveling Salesperson Problem.
     * This is a heuristic approach, not guaranteed to be optimal.
     * @param {number} mode - Specifies problem variant (e.g., 0 for full TSP, 1 for fixed start/end).
     */
    function tspGreedy ( mode ) {
        // Initialize current node and total distance.
        var curr = 0 ;
        var currDist = 0 ;

        // Determine the number of steps based on the mode.
        var numSteps = numActive - 1 ;
        var lastNode = 0 ;
        var numToVisit = numActive ;

        // If mode is 1, it implies a fixed start (0) and end (numActive - 1) node.
        if ( mode == 1 ) {
            numSteps = numActive - 2 ;      // Exclude start and end nodes from intermediate steps.
            lastNode = numActive - 1 ;      // The last node is fixed.
            numToVisit = numActive - 1 ;    // Don't visit the fixed last node until the end.
        }

        // Iterate through each step to build the path.
        for ( var step = 0 ; step < numSteps ; ++step ) {
            visited [ curr ] = true ;         // Mark the current node as visited.
            bestPath [ step ] = curr ;        // Add current node to the best path array.

            var nearest = maxTripSentry ;     // Initialize 'nearest' distance to a very large value.
            var nearI = -1 ;                  // Initialize index of the nearest node.

            // Find the nearest unvisited neighbor.
            for ( var next = 1 ; next < numToVisit ; ++next ) {
                if ( ! visited [ next ] && dur [ curr ] [ next ] < nearest ) {
                    nearest = dur [ curr ] [ next ] ; // Update nearest distance.
                    nearI = next ;                    // Update index of nearest node.
                }
            }

            // Move to the nearest neighbor.
            currDist += dur [ curr ] [ nearI ] ; // Add distance to current total.
            curr = nearI ;                       // Set the nearest node as the new current node.
        }

        // Handle the last node of the path based on the mode.
        if ( mode == 1 ) {
            bestPath [ numSteps ] = lastNode ; // For mode 1, the last node is fixed.
        } else {
            bestPath [ numSteps ] = curr ;     // For full TSP, the last node is the current node.
        }

        // Complete the trip by adding the distance back to the starting node (or fixed end node).
        currDist += dur [ curr ] [ lastNode ] ;
        bestTrip = currDist ; // Update the best trip found.
    }

    /**
     * Calculates the travel cost along a segment of the current solution path.
     * This function intelligently uses precomputed forward or backward costs
     * depending on the direction of traversal (from index 'a' to index 'b').
     * @param {number} a - Starting index in the current path.
     * @param {number} b - Ending index in the current path.
     * @returns {number} The cumulative cost (duration) between path[a] and path[b].
     */
    function cost ( a , b ) {
        // If traversing forward (a comes before or is same as b).
        if ( a <= b ) {
            return costForward [ b ] - costForward [ a ] ;
        }
        // Otherwise, traversing backward.
        else {
            return costBackward [ b ] - costBackward [ a ] ;
        }
    }

    /**
     * Computes the total cost of a specific 3-opt permutation applied to the current path.
     * This helps evaluate if a given 3-opt move would improve the total trip duration.
     * @param {number} a - Index 1 of the first segment.
     * @param {number} b - Index 2 of the first segment.
     * @param {number} c - Index 1 of the second segment.
     * @param {number} d - Index 2 of the second segment.
     * @param {number} e - Index 1 of the third segment.
     * @param {number} f - Index 2 of the third segment.
     * @returns {number} The calculated cost for the proposed permutation.
     */
    function costPerm ( a , b , c , d , e , f ) {
        // Retrieve the actual node indices from the current path.
        var A = currPath [ a ] ;
        var B = currPath [ b ] ;
        var C = currPath [ c ] ;
        var D = currPath [ d ] ;
        var E = currPath [ e ] ;
        var F = currPath [ f ] ;
        var g = currPath.length - 1 ; // The last index of the path.

        // Calculate the total cost by summing segment costs and new edge costs.
        var ret = cost ( 0 , a ) +      // Cost from start to 'a'.
                  dur [ A ] [ B ] +     // Cost of the new edge A-B.
                  cost ( b , c ) +      // Cost of segment from 'b' to 'c'.
                  dur [ C ] [ D ] +     // Cost of the new edge C-D.
                  cost ( d , e ) +      // Cost of segment from 'd' to 'e'.
                  dur [ E ] [ F ] +     // Cost of the new edge E-F.
                  cost ( f , g ) ;      // Cost from 'f' to the end.

        return ret ; // Return the total cost.
    }

    /**
     * Recalculates and updates the `costForward` and `costBackward` arrays.
     * These arrays are crucial for efficient computation of segment costs
     * within the path, particularly used by `cost(a,b)` and `costPerm`.
     */
    function updateCosts ( ) {
        // Initialize arrays to store cumulative costs.
        costForward = new Array ( currPath.length ) ;
        costBackward = new Array ( currPath.length ) ;

        // Calculate forward cumulative costs.
        costForward [ 0 ] = 0.0 ; // Starting point has zero cost.
        for ( var i = 1 ; i < currPath.length ; ++i ) {
            // Sum previous forward cost with the duration of the current segment.
            costForward [ i ] = costForward [ i - 1 ] + dur [ currPath [ i - 1 ] ] [ currPath [ i ] ] ;
        }
        // After calculating all forward costs, the total cost of the path is the last element.
        bestTrip = costForward [ currPath.length - 1 ] ;

        // Calculate backward cumulative costs.
        costBackward [ currPath.length - 1 ] = 0.0 ; // Ending point has zero cost when going backward.
        for ( var i = currPath.length - 2 ; i >= 0 ; --i ) {
            // Sum previous backward cost with the duration of the current segment (in reverse).
            costBackward [ i ] = costBackward [ i + 1 ] + dur [ currPath [ i + 1 ] ] [ currPath [ i ] ] ;
        }
    }

    /**
     * Applies a specified 3-opt move to the `currPath`, effectively re-ordering segments
     * of the path to achieve a potentially shorter total duration.
     * This function also flags that an improvement has been made.
     * @param {number} a - Start index of the first segment.
     * @param {number} b - End index of the first segment.
     * @param {number} c - Start index of the second segment.
     * @param {number} d - End index of the second segment.
     * @param {number} e - Start index of the third segment.
     * @param {number} f - End index of the third segment.
     */
    function updatePerm ( a , b , c , d , e , f ) {
        improved = true ; // Indicate that an improvement has occurred.

        // Create a new path array to store the reordered sequence.
        var nextPath = new Array ( currPath.length ) ;

        // Copy the initial segment of the path (up to 'a').
        for ( var i = 0 ; i < currPath.length ; ++i ) {
            nextPath [ i ] = currPath [ i ] ;
        }

        // Start filling the `nextPath` from `a + 1`.
        var offset = a + 1 ;

        // Apply the first part of the 3-opt permutation.
        nextPath [ offset++ ] = currPath [ b ] ;

        // Reorder the segment between 'b' and 'c'.
        if ( b < c ) {
            for ( var i = b + 1 ; i <= c ; ++i ) {
                nextPath [ offset++ ] = currPath [ i ] ;
            }
        } else { // Reverse order if b > c.
            for ( var i = b - 1 ; i >= c ; --i ) {
                nextPath [ offset++ ] = currPath [ i ] ;
            }
        }

        // Apply the second part of the 3-opt permutation.
        nextPath [ offset++ ] = currPath [ d ] ;

        // Reorder the segment between 'd' and 'e'.
        if ( d < e ) {
            for ( var i = d + 1 ; i <= e ; ++i ) {
                nextPath [ offset++ ] = currPath [ i ] ;
            }
        } else { // Reverse order if d > e.
            for ( var i = d - 1 ; i >= e ; --i ) {
                nextPath [ offset++ ] = currPath [ i ] ;
            }
        }

        // Apply the third part of the 3-opt permutation.
        nextPath [ offset++ ] = currPath [ f ] ;

        // Replace the current path with the newly permuted path.
        currPath = nextPath ;

        // Recalculate cost arrays as the path has changed.
        updateCosts ( ) ;
    }

    /**
     * Implements the 3-opt algorithm to find a locally optimal,
     * or at least significantly improved, solution to the TSP.
     * This algorithm iteratively attempts to improve the path by
     * reordering three segments until no further improvements are found.
     * @param {number} mode - Problem mode (currently unused in this function's logic, but kept for consistency).
     */
    function tspK3 ( mode ) {
        // The original code started with tspGreedy(mode) but it's commented out.
        // For a Type I clone, we preserve this comment state.
        // tspGreedy ( mode ) ;

        // Initialize `currPath` with the `bestPath` (which would have been set by tspGreedy
        // if it were active, or some other initial path if not).
        currPath = new Array ( bestPath.length ) ;
        for ( var i = 0 ; i < bestPath.length ; ++i ) {
            currPath [ i ] = bestPath [ i ] ;
        }

        // Prepare the cost calculation data structures.
        updateCosts ( ) ;

        // Loop until no further improvements can be made.
        improved = true ; // Start with the assumption that improvement is possible.
        while ( improved ) {
            improved = false ; // Reset flag for the current iteration.

            // Iterate through all possible combinations of three segments (i, j, k).
            for ( var i = 0 ; i < currPath.length - 3 ; ++i ) {
                for ( var j = i + 1 ; j < currPath.length - 2 ; ++j ) {
                    for ( var k = j + 1 ; k < currPath.length - 1 ; ++k ) {
                        // Evaluate 7 possible 3-opt permutations and apply if they improve the path.
                        // The order of these checks matters for how the algorithm explores the solution space.

                        // Permutation 1: (i, i+1), (j, k), (j+1, k+1)
                        if ( costPerm ( i , i + 1 , j , k , j + 1 , k + 1 ) < bestTrip ) {
                            updatePerm ( i , i + 1 , j , k , j + 1 , k + 1 ) ;
                        }
                        // Permutation 2: (i, j), (i+1, j+1), (k, k+1)
                        if ( costPerm ( i , j , i + 1 , j + 1 , k , k + 1 ) < bestTrip ) {
                            updatePerm ( i , j , i + 1 , j + 1 , k , k + 1 ) ;
                        }
                        // Permutation 3: (i, j), (i+1, k), (j+1, k+1)
                        if ( costPerm ( i , j , i + 1 , k , j + 1 , k + 1 ) < bestTrip ) {
                            updatePerm ( i , j , i + 1 , k , j + 1 , k + 1 ) ;
                        }
                        // Permutation 4: (i, j+1), (k, i+1), (j, k+1)
                        if ( costPerm ( i , j + 1 , k , i + 1 , j , k + 1 ) < bestTrip ) {
                            updatePerm ( i , j + 1 , k , i + 1 , j , k + 1 ) ;
                        }
                        // Permutation 5: (i, j+1), (k, j), (i+1, k+1)
                        if ( costPerm ( i , j + 1 , k , j , i + 1 , k + 1 ) < bestTrip ) {
                            updatePerm ( i , j + 1 , k , j , i + 1 , k + 1 ) ;
                        }
                        // Permutation 6: (i, k), (j+1, i+1), (j, k+1)
                        if ( costPerm ( i , k , j + 1 , i + 1 , j , k + 1 ) < bestTrip ) {
                            updatePerm ( i , k , j + 1 , i + 1 , j , k + 1 ) ;
                        }
                        // Permutation 7: (i, k), (j+1, j), (i+1, k+1)
                        if ( costPerm ( i , k , j + 1 , j , i + 1 , k + 1 ) < bestTrip ) {
                            updatePerm ( i , k , j + 1 , j , i + 1 , k + 1 ) ;
                        }
                    }
                }
            }
        }

        // Once no more improvements can be found, the `currPath` is the best found local optimum.
        // Copy it back to `bestPath`.
        for ( var i = 0 ; i < bestPath.length ; ++i ) {
            bestPath [ i ] = currPath [ i ] ;
        }
    }

    /*
     * Computes a near-optimal solution to the TSP problem using Ant Colony Optimization (ACO).
     * This method incorporates local optimization in the form of k2-opting each candidate route
     * discovered by the artificial ants.
     *
     * Estimated Run-time Complexity:
     *   - ACO part: O(numWaves * numAnts * numActive ^ 2)
     *   - K2-rewiring part: O(numWaves * numAnts * numActive ^ 3)
     *
     * If 'mode' is set to 1, the algorithm will find a path starting at node 0
     * and ending at node numActive-1, visiting intermediate nodes in an optimized order.
     */
    function tspAntColonyK2 ( mode ) {
        // ACO Algorithm Parameters:
        var alfa = 0.1 ; // The influence/importance of existing pheromone trails.
        var beta = 2.0 ; // The influence/importance of edge durations (inverse desirability).
        var rho = 0.1 ;  // The evaporation rate of pheromone trails.
        var asymptoteFactor = 0.9 ; // Factor for shaping the pheromone reward function.

        // Pheromone matrices and probability array.
        var pher = new Array ( ) ;     // Current pheromone levels on edges.
        var nextPher = new Array ( ) ; // Pheromone levels to be added in the next iteration.
        var prob = new Array ( ) ;     // Probabilities of choosing the next node.

        // Simulation parameters:
        var numAnts = 20 ; // Number of artificial ants in each wave.
        var numWaves = 20 ; // Number of iterations (waves) of ants.

        // Initialize pheromone matrices.
        for ( var i = 0 ; i < numActive ; ++i ) {
            pher [ i ] = new Array ( ) ;
            nextPher [ i ] = new Array ( ) ;
        }
        for ( var i = 0 ; i < numActive ; ++i ) {
            for ( var j = 0 ; j < numActive ; ++j ) {
                pher [ i ] [ j ] = 1 ;      // Initialize all pheromone trails to 1.
                nextPher [ i ] [ j ] = 0.0 ; // Initialize next pheromone updates to 0.
            }
        }

        // Mode-specific parameters for path construction.
        var lastNode = 0 ;
        var startNode = 0 ;
        var numSteps = numActive - 1 ;
        var numValidDests = numActive ;

        if ( mode == 1 ) {
            lastNode = numActive - 1 ;    // Fixed end node.
            numSteps = numActive - 2 ;    // Number of intermediate steps.
            numValidDests = numActive - 1 ; // Don't consider the fixed end node as an intermediate destination.
        }

        // Main ACO loop: Iterate through waves of ants.
        for ( var wave = 0 ; wave < numWaves ; ++wave ) {
            // Each ant constructs a solution.
            for ( var ant = 0 ; ant < numAnts ; ++ant ) {
                var curr = startNode ; // Start each ant at the specified start node.
                var currDist = 0 ;     // Initialize current path distance for this ant.

                // Reset visited status for the new ant.
                for ( var i = 0 ; i < numActive ; ++i ) {
                    visited [ i ] = false ;
                }
                currPath [ 0 ] = curr ; // Set the first node in the ant's path.

                // Construct the path step-by-step.
                for ( var step = 0 ; step < numSteps ; ++step ) {
                    visited [ curr ] = true ; // Mark current node as visited.
                    var cumProb = 0.0 ;       // Cumulative probability for selecting the next node.

                    // Calculate probabilities for all unvisited neighbors.
                    for ( var next = 1 ; next < numValidDests ; ++next ) {
                        if ( ! visited [ next ] ) {
                            prob [ next ] = Math.pow ( pher [ curr ] [ next ] , alfa ) * // Pheromone influence.
                                            Math.pow ( dur [ curr ] [ next ] , 0.0 - beta ) ; // Duration influence (inverse).
                            cumProb += prob [ next ] ;
                        }
                    }

                    // Select the next node probabilistically.
                    var guess = Math.random ( ) * cumProb ;
                    var nextI = -1 ;
                    for ( var next = 1 ; next < numValidDests ; ++next ) {
                        if ( ! visited [ next ] ) {
                            nextI = next ;
                            guess -= prob [ next ] ;
                            if ( guess < 0 ) { // If the random guess falls within this node's probability range.
                                nextI = next ;
                                break ;
                            }
                        }
                    }
                    currDist += dur [ curr ] [ nextI ] ; // Add to current ant's path distance.
                    currPath [ step + 1 ] = nextI ;      // Add node to path.
                    curr = nextI ;                       // Move to the next node.
                }

                // Complete the path by adding the last node.
                currPath [ numSteps + 1 ] = lastNode ;
                currDist += dur [ curr ] [ lastNode ] ; // Add distance to the last node.

                // --- Apply 2-opt (k2-rewire) local optimization to the ant's generated path ---
                var lastStep = numActive ;
                if ( mode == 1 ) {
                    lastStep = numActive - 1 ; // For fixed end, the last node is not part of the rewireable segment.
                }

                var changed = true ; // Flag to track if an improvement was made in this 2-opt pass.
                var i = 0 ;          // Loop counter for the first segment.

                while ( changed ) {
                    changed = false ; // Reset flag for this pass.
                    for ( ; i < lastStep - 2 && ! changed ; ++i ) {
                        // Segment (i, i+1) and (i+1, i+2) are part of the current path.
                        var cost = dur [ currPath [ i + 1 ] ] [ currPath [ i + 2 ] ] ; // Cost of original segment (i+1) -> (i+2).
                        var revCost = dur [ currPath [ i + 2 ] ] [ currPath [ i + 1 ] ] ; // Cost of reversed segment (i+2) -> (i+1).
                        var iCost = dur [ currPath [ i ] ] [ currPath [ i + 1 ] ] ; // Cost of original segment (i) -> (i+1).

                        var tmp ;       // Temporary variable for swapping.
                        var nowCost ;   // Cost of the current path segment.
                        var newCost ;   // Cost of the path segment after 2-opt swap.

                        for ( var j = i + 2 ; j < lastStep && ! changed ; ++j ) {
                            // Calculate current cost of the segment being considered for swap.
                            nowCost = cost + iCost + dur [ currPath [ j ] ] [ currPath [ j + 1 ] ] ;

                            // Calculate new cost if edges (i)-(i+1) and (j)-(j+1) are replaced by (i)-(j) and (i+1)-(j+1).
                            newCost = revCost + dur [ currPath [ i ] ] [ currPath [ j ] ] +
                                      dur [ currPath [ i + 1 ] ] [ currPath [ j + 1 ] ] ;

                            if ( nowCost > newCost ) {
                                currDist += newCost - nowCost ; // Update total distance for the ant.

                                // Reverse the detached road segment (from i+1 to j).
                                for ( var k = 0 ; k < Math.floor ( ( j - i ) / 2 ) ; ++k ) {
                                    tmp = currPath [ i + 1 + k ] ;
                                    currPath [ i + 1 + k ] = currPath [ j - k ] ;
                                    currPath [ j - k ] = tmp ;
                                }
                                changed = true ; // Mark that an improvement was made.
                                --i ;            // Restart inner loop from previous 'i' to re-evaluate.
                            }

                            // Update costs for the next 'j' iteration.
                            cost += dur [ currPath [ j ] ] [ currPath [ j + 1 ] ] ;
                            revCost += dur [ currPath [ j + 1 ] ] [ currPath [ j ] ] ;
                        }
                    }
                }

                // If this ant's path (after k2-rewire) is better than the global best path.
                if ( currDist < bestTrip ) {
                    bestPath = currPath ; // Update global best path.
                    bestTrip = currDist ; // Update global best trip duration.
                }

                // Update pheromone trails based on the quality of the ant's solution.
                for ( var i = 0 ; i <= numSteps ; ++i ) {
                    nextPher [ currPath [ i ] ] [ currPath [ i + 1 ] ] +=
                        ( bestTrip - asymptoteFactor * bestTrip ) /
                        ( numAnts * ( currDist - asymptoteFactor * bestTrip ) ) ;
                }
            } // End of ant loop.

            // Apply pheromone evaporation and deposit new pheromone for the next wave.
            for ( var i = 0 ; i < numActive ; ++i ) {
                for ( var j = 0 ; j < numActive ; ++j ) {
                    pher [ i ] [ j ] = pher [ i ] [ j ] * ( 1.0 - rho ) + rho * nextPher [ i ] [ j ] ;
                    nextPher [ i ] [ j ] = 0.0 ; // Reset for the next wave.
                }
            }
        } // End of wave loop.
    }

    /*
     * This function calculates the *optimal* solution to the TSP problem
     * by exhaustively checking all possible permutations (brute-force approach).
     *
     * Complexity: The run-time is factorial, specifically O((numActive-1)!).
     * Due to this high complexity, it is only practical for very small numbers of locations.
     *
     * Preconditions for correct operation:
     *   - `numActive`: Must contain the total number of locations to visit.
     *   - `dur[i][j]`: Must contain the travel duration (weight) of the edge from node `i` to node `j`.
     *   - `visited[i]`: All entries in this boolean array should initially be `false` before the first call.
     *   - `bestTrip`: Should be initialized to a very large number (e.g., `maxTripSentry`)
     *                 to ensure any valid path is considered an improvement.
     *
     * @param {number} mode     - If 1, solves the path problem (fixed start at 0, fixed end at numActive-1).
     *                            If 0, solves the full TSP (start at 0, end back at 0).
     * @param {number} currNode - The index of the current node in the recursion.
     * @param {number} currLen  - The cumulative length (duration) of the path traversed so far.
     * @param {number} currStep - The current step count in building the path.
     */
    function tspBruteForce ( mode , currNode , currLen , currStep ) {
        // Initialize mode-specific parameters for the path traversal.
        var numSteps = numActive ;      // Total steps for a full TSP (including return to start).
        var lastNode = 0 ;              // Default last node for full TSP (return to start).
        var numToVisit = numActive ;    // Default number of nodes to consider visiting.

        if ( mode == 1 ) {
            numSteps = numActive - 1 ;    // For path problem, steps are one less.
            lastNode = numActive - 1 ;    // Fixed end node for path problem.
            numToVisit = numActive - 1 ;  // Don't visit the fixed last node until the very end.
        }

        // Pruning step: If the current path length plus the cost to return to the lastNode
        // is already greater than or equal to the best trip found so far,
        // then this branch cannot lead to a better solution, so we stop exploring it.
        if ( currLen + dur [ currNode ] [ lastNode ] < bestTrip ) {

            // Base case: If we have reached the last step in the path construction.
            if ( currStep == numSteps ) {
                currLen += dur [ currNode ] [ lastNode ] ; // Add the cost to connect to the final node.
                currPath [ currStep ] = lastNode ;         // Assign the last node to the current path.
                bestTrip = currLen ;                       // Update the overall best trip duration.

                // Copy the current path to `bestPath` as it's the new optimum.
                for ( var i = 0 ; i <= numSteps ; ++i ) {
                    bestPath [ i ] = currPath [ i ] ;
                }
            }
            // Recursive case: If not yet at the last step, continue exploring.
            else {
                // Iterate through all possible next nodes (excluding the start node 0,
                // and the fixed last node if in mode 1, as those are handled by setup/base case).
                for ( var i = 1 ; i < numToVisit ; ++i ) {
                    if ( ! visited [ i ] ) { // Only visit unvisited nodes.
                        visited [ i ] = true ;                  // Mark node as visited for this path.
                        currPath [ currStep ] = i ;             // Add node to the current path.

                        // Recursively call with the next node, updated length, and next step.
                        tspBruteForce ( mode , i , currLen + dur [ currNode ] [ i ] , currStep + 1 ) ;

                        visited [ i ] = false ;                 // Backtrack: Mark node as unvisited for other paths.
                    }
                }
            }
        }
    }

    /*
     * This utility function generates the next lexicographically ordered bitmask (integer)
     * that contains exactly `num` bits set to 1. It's used in the dynamic programming
     * TSP solver to iterate through all combinations of `s` cities.
     * The `nextSet` array is modified in place to represent the bit pattern.
     *
     * @param {number} num - The desired number of bits that should be set to 1 in the bitmask.
     * @returns {number} The integer representation of the next bitmask, or -1 if no such set exists.
     */
    function nextSetOf ( num ) {
        var count = 0 ; // Counter for currently set bits in `nextSet`.
        var ret = 0 ;   // The integer representation of the resulting bitmask.

        // Count the number of set bits in the current `nextSet` configuration.
        for ( var i = 0 ; i < numActive ; ++i ) {
            count += nextSet [ i ] ;
        }

        // Case 1: If the current set has fewer than `num` bits set,
        // initialize `nextSet` to the smallest possible set with `num` bits (i.e., first `num` bits set).
        if ( count < num ) {
            for ( var i = 0 ; i < num ; ++i ) {
                nextSet [ i ] = 1 ;
            }
            for ( var i = num ; i < numActive ; ++i ) {
                nextSet [ i ] = 0 ;
            }
        }
        // Case 2: The current set already has `num` bits set, find the next one.
        else {
            // Step A: Find the index of the first '1' bit from the left.
            var firstOne = -1 ;
            for ( var i = 0 ; i < numActive ; ++i ) {
                if ( nextSet [ i ] ) {
                    firstOne = i ;
                    break ;
                }
            }

            // Step B: Find the index of the first '0' bit that is to the right of `firstOne`.
            var firstZero = -1 ;
            for ( var i = firstOne + 1 ; i < numActive ; ++i ) {
                if ( ! nextSet [ i ] ) {
                    firstZero = i ;
                    break ;
                }
            }

            // If no '0' bit is found after 'firstOne', it means we've iterated through all combinations.
            if ( firstZero < 0 ) {
                return -1 ; // Indicate that no further sets exist.
            }

            // Step C: "Increment" the bitmask by setting `firstZero` to '1'.
            nextSet [ firstZero ] = 1 ;

            // Step D: Reset the bits preceding `firstZero` to form the lexicographically smallest arrangement.
            // This involves setting `firstZero - firstOne - 1` bits to '1' starting from index 0.
            for ( var i = 0 ; i < firstZero - firstOne - 1 ; ++i ) {
                nextSet [ i ] = 1 ;
            }
            // And setting the remaining bits before `firstZero` to '0'.
            for ( var i = firstZero - firstOne - 1 ; i < firstZero ; ++i ) {
                nextSet [ i ] = 0 ;
            }
        }

        // Convert the `nextSet` array (bit pattern) into its integer representation.
        for ( var i = 0 ; i < numActive ; ++i ) {
            ret += ( nextSet [ i ] << i ) ; // Bit shift and add to form the integer.
        }
        return ret ; // Return the integer value of the generated bitmask.
    }

    /*
     * Solves the Traveling Salesperson Problem to *optimality* using a dynamic programming approach.
     * This method guarantees the shortest path but has a high memory and time complexity,
     * making it suitable only for problems with a moderate number of locations.
     *
     * Memory Requirement: O(numActive * 2^numActive)
     * Time Requirement:   O(numActive^2 * 2^numActive)
     *
     * @param {number} mode - Specifies the problem variant.
     *                        Currently, only mode 0 (full TSP returning to start) is fully implemented here.
     */
    function tspDynamic ( mode ) {
        // Calculate the total number of possible subsets of cities.
        var numCombos = 1 << numActive ;

        // Initialize cost matrix `C` and parent tracking matrix `parent`.
        // C[mask][k] stores the minimum cost to visit all cities in 'mask', ending at city 'k'.
        // parent[mask][k] stores the city that came before 'k' in the optimal path for 'mask'.
        var C = new Array ( ) ;
        var parent = new Array ( ) ;

        // Allocate memory for the DP tables.
        for ( var i = 0 ; i < numCombos ; ++i ) {
            C [ i ] = new Array ( ) ;
            parent [ i ] = new Array ( ) ;
            for ( var j = 0 ; j < numActive ; ++j ) {
                C [ i ] [ j ] = 0.0 ; // Initialize costs to zero.
                parent [ i ] [ j ] = 0 ; // Initialize parent pointers.
            }
        }

        // Base cases: Paths of length 2 (from city 0 to city k).
        // The mask `1 + (1 << k)` represents the set containing cities 0 and k.
        for ( var k = 1 ; k < numActive ; ++k ) {
            var index = 1 + ( 1 << k ) ; // Bitmask where the 0-th and k-th bits are set.
            C [ index ] [ k ] = dur [ 0 ] [ k ] ; // Cost is simply the direct duration from 0 to k.
        }

        // Main DP loop: Iterate for subsets of increasing size 's'.
        // 's' represents the number of cities in the current subset (excluding the start city 0).
        for ( var s = 3 ; s <= numActive ; ++s ) {
            // Reset `nextSet` for the `nextSetOf` utility function.
            for ( var i = 0 ; i < numActive ; ++i ) {
                nextSet [ i ] = 0 ;
            }

            // Iterate through all possible subsets of size 's' (represented by 'index').
            var index = nextSetOf ( s ) ;
            while ( index >= 0 ) { // Continue as long as valid subsets are found.
                // Consider each city 'k' in the current subset 'index' as the ending city.
                for ( var k = 1 ; k < numActive ; ++k ) {
                    if ( nextSet [ k ] ) { // If city 'k' is part of the current subset.
                        // `prevIndex` is the subset 'index' without city 'k'.
                        var prevIndex = index - ( 1 << k ) ;
                        C [ index ] [ k ] = maxTripSentry ; // Initialize cost to a very high value.

                        // Find the minimum cost to reach 'k' from any other city 'm' in `prevIndex`.
                        for ( var m = 1 ; m < numActive ; ++m ) {
                            if ( nextSet [ m ] && m != k ) { // If 'm' is in `prevIndex` and not 'k'.
                                // Calculate cost: (min cost to reach 'm' in `prevIndex`) + (duration from 'm' to 'k').
                                if ( C [ prevIndex ] [ m ] + dur [ m ] [ k ] < C [ index ] [ k ] ) {
                                    C [ index ] [ k ] = C [ prevIndex ] [ m ] + dur [ m ] [ k ] ; // Update min cost.
                                    parent [ index ] [ k ] = m ; // Store 'm' as the parent of 'k'.
                                }
                            }
                        }
                    }
                }
                index = nextSetOf ( s ) ; // Get the next subset of size 's'.
            }
        }

        // After filling the DP tables, reconstruct the optimal path.
        // Initialize `bestPath` array.
        for ( var i = 0 ; i < numActive ; ++i ) {
            bestPath [ i ] = 0 ;
        }

        // The final index represents the set of all cities (excluding city 0 if mode 1, but this part is for mode 0).
        var index = ( 1 << numActive ) - 1 ;

        if ( mode == 0 ) {