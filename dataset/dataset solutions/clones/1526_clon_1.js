/* This JavaScript function, named 'prod', calculates the maximum
   possible product from a given set of four numbers.
   The input 'nums' is expected to be a string containing four space-separated numbers. */
function prod( nums )
{
    // Step 1: Parse the input string into an array of numbers.
    // The 'split(" ")' method divides the string by spaces,
    // and 'map(Number)' converts each resulting string fragment into a numerical value.
    let input = nums.split( " " ) .map( Number ) ;

    // Step 2: Divide the four input numbers into two distinct pairs.
    // The first pair consists of the first two numbers from the input.
    const arr1 = [ input[0] , input[1] ] ;

    // The second pair consists of the remaining two numbers from the input.
    const arr2 = [ input[2] , input[3] ] ;

    // Declare two variables, 'x' and 'y', initialized to zero.
    // These variables are present in the original code but are not utilized in the subsequent logic.
    let x = 0 , y = 0 ;

    // Step 3: Sort the arrays.
    // Note: The .sort() method sorts the array in place and returns a reference to the same array.
    // Sorting 'arr1' in ascending order. After this line, 'arr1' is sorted ascending.
    let asc1 = arr1.sort( ( a , b ) => a - b ) ;

    // Sorting 'arr1' again, this time in descending order.
    // This operation modifies 'arr1' *in place* once more.
    // Consequently, 'asc1' (which references 'arr1') will also now point to the descending-sorted version of 'arr1'.
    let dsc1 = arr1.sort( ( a , b ) => b - a ) ;

    // Sorting 'arr2' in ascending order. 'arr2' is now sorted ascending.
    let asc2 = arr2.sort( ( a , b ) => a - b ) ;

    // Sorting 'arr2' again, in descending order.
    // Similarly, 'asc2' will now reference the descending-sorted version of 'arr2'.
    let dsc2 = arr2.sort( ( a , b ) => b - a ) ;

    // Step 4: Calculate all four possible products.
    // Due to the in-place sorting, by this point:
    // 'asc1[0]' is the largest element of the original 'arr1' pair.
    // 'asc1[1]' is the smallest element of the original 'arr1' pair.
    // 'asc2[0]' is the largest element of the original 'arr2' pair.
    // 'asc2[1]' is the smallest element of the original 'arr2' pair.

    // Product of the largest from the first pair and the largest from the second pair.
    let mul1 = asc1[0] * asc2[0] ;

    // Product of the largest from the first pair and the smallest from the second pair.
    let mul2 = asc1[0] * asc2[1] ;

    // Product of the smallest from the first pair and the largest from the second pair.
    let mul3 = asc1[1] * asc2[0] ;

    // Product of the smallest from the first pair and the smallest from the second pair.
    let mul4 = asc1[1] * asc2[1] ;

    // Step 5: Find the maximum product among the four calculated products.
    // An array containing all four products is created, then sorted in descending order.
    // The largest product will be at index 0 of this sorted array.
    let res = [ mul1 , mul2 , mul3 , mul4 ] .sort( ( a , b ) => b - a ) ;

    // Step 6: Return the highest product found.
    return res[0] ;
}


// This section handles the execution of the 'prod' function with actual input.
// It reads data from standard input ('/dev/stdin') using Node.js's 'fs' module.
// The read data is expected to be UTF-8 encoded.
// The result of the 'prod' function is then printed to the console.
console.log( prod( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ) ;