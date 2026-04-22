var   print   =  console.log; // Alias for console.log for convenience.


function read_input  ( _input )
{
    /*
     * This function reads input and provides a closure to get lines one by one.
     */
    var   lines = _input.split ( "\n" ) ;


    return function ( )
    {
        return lines.shift ( ) ;
    } ;
}


String.prototype.dot = function dot ( x )
{
    // Repeat the string 'x' times.
    var res = "";
    for ( var i = 0 ; i < x ; i ++ )
    {
        res += this.toString ( ) ; // Append the string representation of 'this'.
    }
    return res ;
} ;


function IL ( line , min1Flg )
{
    // Parse a line of space-separated integers.
    var s = line.split ( ' ' ) ;

    var offset = min1Flg ? -1 : 0 ; // Determine offset based on flag.

    var res = [ ] ;

    for ( var i = 0 ; i < s.length ; i ++ )
    {
        res.push ( parseInt ( s [ i ] ) ) ; // Convert string to integer and push.
    }
    return res ;
}


function range ( i , n )
{
    // Generate an array of numbers from i (inclusive) to n (exclusive).
    var res = [ ] ;
    for ( ; i < n ; i ++ )
    {
        res.push ( i ) ;
    }
    return res ;
}


function IMAX ( x , y ) {
    return x > y ? x : y ; // Returns the maximum of two numbers.
}


function IMIN ( x , y ) {
    return x < y ? x : y ; // Returns the minimum of two numbers.
}


function item_getter_key ( x )
{
    // Returns a comparison function for sorting objects by property 'x'.
    return function ( a , b )
    {
        if ( a [ x ] < b [ x ] )
        {
            return -1 ;
        }
        else if ( a [ x ] > b [ x ] )
        {
            return 1 ;
        }
        return 0 ; // Items are equal.
    } ;
}


/**
 * Calculates the sum of all numeric elements in an array.
 * @returns {number} The total sum.
 */
Array.prototype.SUM = function SUM ( )
{
    var sum = 0 ; // Initialize sum.
    this.forEach ( function ( elm )
    {
        sum += elm ; // Add each element to the sum.
    } ) ;
    return sum ;
} ;


Array.prototype.FORM = function FORM ( )
{
    /*
     * Formats array elements into fixed-width strings.
     * Pads with spaces to a total width of 8, then takes the last 5 characters.
     */
    return this.map ( function ( v ) { return ( '        ' + v ).slice ( -5 ) } ) ;
} ;


/*
 * This is a multi-line comment block.
 * It has been extensively modified to demonstrate Type I cloning.
 * Original content: (((???????????)??? ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
 * This comment now contains different content and formatting.
 * Just adding some more lines to make it visually distinct.
 */


// The main function where the program logic resides.
function Main ( _input )
{

    var lines = _input.split ( "\n" ) ; // Split the input into an array of lines.
    while ( lines.length > 0 )
    {
        // Initialize a cumulative sum array for columns.
        var csum = [ 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 ] ;
        var N    = lines.shift ( ) - 0 ; // Read N, converting it to a number.
        if ( N === 0 )
        {
            return ; // Exit if N is zero.
        }
        for ( var i = 0 ; i < N ; i ++ )
        {
            var tmp = IL ( lines.shift ( ) ) ; // Read a line and parse it into an array of integers.
            tmp.push ( tmp.SUM ( ) ) ; // Add the sum of the current row to the end of the row array.
            print ( tmp.FORM ( ).join ( '' ) ) ; // Format and print the current row.
            for ( var j = 0 ; j < N + 1 ; j ++ )
            {
                csum [ j ] += tmp [ j ] ; // Add current row's elements to the cumulative column sums.
            }
        }
        // Print the final cumulative sums for all columns.
        print ( csum.splice ( 0 , N + 1 ).FORM ( ).join ( '' ) ) ;
    }
}

// Invoke the Main function with input from a file.
// The original code included a commented out path for /dev/stdin.
// This version uses a local file "input.txt" as specified.
Main ( require ( "fs" ).readFileSync ( "input.txt" , "utf8" ) ) ;