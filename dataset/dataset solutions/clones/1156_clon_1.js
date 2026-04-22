/*
 * This is a JavaScript program demonstrating a Union-Find data structure implementation.
 * The Main function processes input to perform Union-Find operations.
 */
function     Main  (  input  )
{
    // Split the entire input string by newline characters
    var arr  =  input.split ( "\n" ) ;

    // The first line contains two numbers: n (number of elements) and q (number of queries)
    var nums = arr [ 0 ] . split ( " " ) ;

    // Parse n, the number of elements for the Union-Find structure
    var n = parseInt ( nums [ 0 ] ,    10 ) ;

    // Parse q, the number of queries to perform
    var q = parseInt ( nums [ 1 ] ,    10 ) ;


    // Create an array to hold individual UnionFind instances
    var set = new Array ( ) ;

    // Initialize n separate UnionFind instances, each representing a distinct element initially
    for ( i  =  0 ;    i  <  n ;    i ++ )
    {
        set.push ( new UnionFind ( ) ) ;
    }

    /*
     * Create a single UnionFind instance. This instance acts as a blueprint
     * and holds the methods for find, unite, and same operations.
     * The actual elements are within the 'set' array, and their parent/size
     * properties are managed by the methods called on 'uf'.
     */
    var uf = new UnionFind ( ) ;


    // Process each query
    for ( i  =  0 ;    i  <  q ;    i ++ )
    {
        // Each query line contains a command type and two element indices
        var command = arr [ i + 1 ] . split ( " " ) ;

        // Parse the first element index
        var a = parseInt ( command [ 1 ] ,    10 ) ;

        // Parse the second element index
        var b = parseInt ( command [ 2 ] ,    10 ) ;

        // Check the command type
        if ( command [ 0 ]  ==  "0" )
        {
            // Command '0': Unite the sets containing elements 'a' and 'b'
            uf.unite ( set [ a ] ,    set [ b ] ) ;
        }
        else
        {
            // Command '1': Check if elements 'a' and 'b' are in the same set
            console.log ( uf.same ( set [ a ] ,    set [ b ] ) ) ;
        }
    }
}


// Define the UnionFind constructor function
function     UnionFind  (  )
{
    // Each new instance initially points to itself as its parent
    this.parent = this ;

    // Each new instance initially represents a set of size 1
    this.size = 1 ;


    /*
     * The find operation: traverses up the parent chain to find the root parent
     * of the current element. This root represents the set.
     */
    this.find = function ( )
    {
        if ( this.parent  ==  this )
        {
            return this ; // If parent is self, this is the root
        }
        else
        {
            // Path compression: set parent directly to the root found
            return this.parent.find ( ) ;
        }
    } ;


    /*
     * The unite operation: merges two sets represented by elements x and y.
     * It uses union by size heuristic to keep the tree flat.
     */
    this.unite = function ( x ,    y )
    {
        // Find the root of the set containing x
        var xtop = x.find ( ) ;

        // Find the root of the set containing y
        var ytop = y.find ( ) ;

        // If roots are already the same, x and y are in the same set, no union needed
        if ( xtop  ==  ytop )
        {
            return false ;
        }
        else
        {
            // Attach the smaller tree under the root of the larger tree
            if ( xtop.size  <  ytop.size )
            {
                xtop.parent = ytop ; // Make ytop the parent of xtop's root
                ytop.size += xtop.size ; // Update the size of the new combined set
            }
            else
            {
                ytop.parent = xtop ; // Make xtop the parent of ytop's root
                xtop.size += ytop.size ; // Update the size of the new combined set
            }
            return true ; // Union was successful
        }
    } ;

    /*
     * The same operation: checks if two elements x and y belong to the same set.
     * This is determined by comparing their root parents.
     */
    this.same = function ( x ,    y )
    {
        if ( x.find ( )  ==  y.find ( ) )
        {
            return 1 ; // Elements are in the same set
        }
        else
        {
            return 0 ; // Elements are in different sets
        }
    } ;
}

// Call the Main function with input read from standard input
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" ) ) ;
// End of program