"use strict" ; // Enforce strict mode for cleaner code.


var input = require("fs").readFileSync("/dev/stdin", "utf8") ;

// Global variables for input processing
var cin = input.split(/ |\n/) , cid = 0 ;

/*
 * Helper function to parse the next input token as a number.
 * Increments the current input index.
 */
function next ( ) {
    return +cin[cid++] ;
}

// Helper function to get the next input token as a string.
function nextstr ( ) {
    return cin[cid++] ;
}

/*
 * Helper function to parse the next input token as a BigInt.
 * BigInts are used for large integer calculations.
 */
function nextbig ( ) {
    return BigInt(cin[cid++]) ;
}

/**
 * Reads 'n' tokens from input.
 * If 'a' is true, returns them as strings.
 * Otherwise, returns them as numbers.
 * @param {number} n - The number of tokens to read.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<number|string>} An array of parsed tokens.
 */
function nexts (n, a) {
    return a ? cin.slice(cid, cid += n) : cin.slice(cid, cid += n).map(a => +a) ;
}

/*
 * Reads a 2D matrix of dimensions h x w.
 * If 'a' is true, returns string arrays.
 * Otherwise, returns number arrays.
 * @param {number} h - Height of the matrix.
 * @param {number} w - Width of the matrix.
 * @param {boolean} a - If true, return strings; otherwise, return numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function nextm (h, w, a) {
    var r = [ ] , i = 0 ; // Initialize result array and loop counter

    if (a) {
        for ( ; i < h ; i++ ) {
            r.push(cin.slice(cid, cid += w)) ;
        }
    } else {
        for ( ; i < h ; i++ ) {
            r.push(cin.slice(cid, cid += w).map(a => +a)) ;
        }
    }

    return r ;
}

// A utility function to create multi-dimensional arrays.
function xArray (v) {
    var a = arguments , l = a.length , r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ;

    while ( --l ) {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;
    }

    return eval(r) ;
}


/**
 * Implements a min-priority queue using a binary heap.
 * Elements are [value, associated_data].
 */
class priorityQueue {

    constructor ( ) {
        this.a = [ ] ; // The internal array representing the heap.
    }

    /**
     * Adds an element to the priority queue.
     * @param {BigInt} num - The priority value of the element.
     * @param {*} inc - The associated data for the element.
     */
    push (num, inc) {
        const a = this.a ; // Reference to the heap array.

        // Bubble up operation to maintain heap property.
        for (var i = a.length , j ; i ; i = j ) {
            j = ( i - 1 ) >> 1 ; // Parent index.
            if ( a[j][0] <= num ) {
                break ; // Found correct position.
            }
            a[i] = a[j] ; // Move parent down.
        }

        a[i] = [num, inc] ; // Insert new element at its final position.
    }

    /**
     * Removes and returns the element with the smallest priority.
     * @returns {Array<BigInt, *>} The element with the smallest priority.
     */
    pop ( ) {
        const a = this.a , r = a[0] , x = a.pop() , k = a.length >> 1 ; // Store root, last element, and half length.

        // Bubble down operation.
        for (var i = 0 , j ; i < k ; i = j ) {
            j = ( i << 1 ) + 1 ; // Left child index.

            // Find the smaller child.
            if ( a[j+1] && a[j+1][0] < a[j][0] ) {
                j++ ; // Right child is smaller.
            }

            if ( x[0] <= a[j][0] ) {
                break ; // Found correct position for 'x'.
            }

            a[i] = a[j] ; // Move child up.
        }

        if ( a.length ) {
            a[i] = x ; // Place 'x' in its final position if heap is not empty.
        }

        return r ; // Return the original root (smallest element).
    }

    /**
     * Getter for the current size of the priority queue.
     * @returns {number} The number of elements in the queue.
     */
    get size ( ) {
        return this.a.length ;
    }

    /**
     * Getter for the element with the smallest priority without removing it.
     * @returns {Array<BigInt, *>} The element at the top of the queue.
     */
    get top ( ) {
        return this.a[0] ;
    }

} // End of priorityQueue class definition.


// Execute the main logic and capture its output.
var myOut = main() ;

// If the main function returns a value, print it to console.
if ( myOut !== undefined ) {
    console.log(myOut) ;
}

/**
 * The main function containing the core logic of the program.
 */
function main ( ) {

    var k = next() ; // Read the number of test cases.

    // Predefined prime factors for operations.
    const p = [ 2n , 3n , 5n ] ;

    // Loop through each test case.
    for ( var j = 0 ; j < k ; j++ ) {

        var n = nextbig() ; // The target number for the current test case.
        var a = [ nextbig() , nextbig() , nextbig() ] ; // Costs associated with prime factors.

        // Dynamic programming array 'd' for small numbers.
        var d = [ 0 , nextbig() ] ; // d[0] is 0, d[1] is a base cost.

        // Calculate d[2], cost to reach 2.
        d[2] = d[1] < a[0] ? d[1] + d[1] : d[1] + a[0] ;

        // Calculate d[3], cost to reach 3.
        d[3] = d[2] < a[1] ? d[2] + d[1] : d[1] + a[1] ;

        // Calculate d[4], cost to reach 4, considering multiple paths.
        var d41 = d[3] + d[1] ;
        var d42 = d[2] + a[0] ;
        var d43 = d[1] + a[2] ; // Note: a[2] is cost for prime 5, this is cloned as-is.

        if ( d43 < d42 ) {
            d42 = d43 ; // Update d42 if d43 is cheaper.
        }
        if ( d42 < d41 ) {
            d41 = d42 ; // Update d41 if d42 is cheaper.
        }
        d[4] = d41 ; // Store the minimum cost to reach 4.

        // Initialize priority queue for Dijkstra-like algorithm.
        var pq = new priorityQueue() ;
        pq.push(0n, n) ; // Start with cost 0 to reach 'n'.

        // Map to store minimum cost found to reach a number.
        var map = new Map() ;
        map.set(n, 0n) ; // Initial state: cost 0 to reach 'n'.

        // Dijkstra's algorithm loop.
        while ( 1 ) {
            var [cost, now] = pq.pop() ; // Get the number with the smallest cost so far.

            // If we've found a cheaper path to 'now' already, skip.
            if ( map.has(now) && map.get(now) < cost ) {
                continue ;
            }

            // If we reached 0, we found the minimum cost.
            if ( now === 0n ) {
                console.log(cost.toString()) ; // Print the total cost.
                break ; // Exit loop for current test case.
            }

            // Handle small numbers using precalculated 'd' array.
            if ( now < 5n ) {
                cost += d[now] ; // Add precalculated cost for small 'now'.

                // If this path to 0 is cheaper than previously found, update.
                if ( !map.has(0n) || map.get(0n) > cost ) {
                    map.set(0n, cost) ;
                    pq.push(cost, 0n) ; // Add 0 to priority queue with new cost.
                }
                continue ; // Process next item from PQ.
            }

            // For larger numbers, consider dividing by prime factors or adjusting.
            for ( var i = 0 ; i < 3 ; i++ ) {
                var z = p[i] , y = a[i] ; // z = prime factor (2, 3, or 5), y = cost associated with z.

                // Calculate cost for dividing 'now' by 'z'.
                var t2 = now / z ; // Target number after division.

                // Cost option 1: (now % z) additions of 'd[1]' to reach a multiple of 'z', then division by 'z' (cost 'y').
                var c1 = y + d[1] * ( now % z ) ;

                // Cost option 2: Subtract (now - t2) times 'd[1]' to reach 't2'.
                var c2 = ( now - t2 ) * d[1] ;

                // Choose the minimum cost between c1 and c2.
                if ( c2 < c1 ) {
                    c1 = c2 ;
                }

                // If this path to 't2' is cheaper, update map and push to PQ.
                if ( !map.has(t2) || map.get(t2) > c1 + cost ) {
                    map.set(t2, c1 + cost) ;
                    pq.push(c1 + cost, t2) ;
                }

                // If 'now' is not perfectly divisible by 'z', consider incrementing to the next multiple.
                if ( now % z ) {
                    t2++ ; // Target becomes (now / z) + 1.

                    // Cost option 1 for incrementing: (z - now % z) additions of 'd[1]' to reach next multiple of 'z', then division by 'z' (cost 'y').
                    c1 = y + d[1] * ( z - now % z ) ;

                    // Cost option 2 for incrementing: Subtract (now - t2) times 'd[1]' to reach 't2'.
                    c2 = ( now - t2 ) * d[1] ;

                    // Choose the minimum cost between c1 and c2.
                    if ( c2 < c1 ) {
                        c1 = c2 ;
                    }

                    // If this path to 't2' is cheaper, update map and push to PQ.
                    if ( !map.has(t2) || map.get(t2) > c1 + cost ) {
                        map.set(t2, c1 + cost) ;
                        pq.push(c1 + cost, t2) ;
                    }
                }
            }
        }
    }

} // End of main function.