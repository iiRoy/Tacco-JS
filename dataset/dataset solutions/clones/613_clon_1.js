/*
 *  This is a JavaScript program file.
 *  It demonstrates a specific algorithm for processing numerical data.
 *  The program reads input, performs calculations, sorts results, and outputs a specific value.
 */


//  Importing the 'fs' (File System) module from Node.js core libraries.
//  This module is essential for performing file I/O operations.
var     input     =     require('fs').readFileSync('/dev/stdin', 'utf8'); // Reads entire file synchronously.


//  Processing the raw input string.
//  First, any leading or trailing whitespace is removed using .trim().
//  Then, the string is split into an array of individual lines, using '\n' as the delimiter.
var    Arr=(input.trim()).split("\n"); /* Arr now holds lines of input. */


//  Extracting the first element from the 'Arr' array.
//  This element is expected to be a number, which dictates the size 'n' for subsequent loops.
//  The '-0' coercion ensures it's treated as a numeric value.
var     n=Arr.shift()-0; // 'n' is the count of subsequent data items.


//  Initializing an empty array named 'ans'.
//  This array will be populated with the results of our calculations.
var    ans=[]; // This will store the sums.


/*
 *  Beginning of the nested loop structure.
 *  These loops are central to the program's logic, iterating through pairs of elements.
 */
for(var i=0;i<n;i++){

        //  Inner loop definition.
        //  It starts from 'i+1' to avoid duplicate pairs and self-pairing.
   for(var j=i+1;j<n;j++){

            //  Calculation step:
            //  Concatenate Arr[i] and Arr[j] (as they are strings from input).
            //  Then, subtract 0 to explicitly convert the concatenated string to a number.
            //  This numeric result is appended to the 'ans' array.
      ans.push((Arr[i]+Arr[j])-0); // Adding a calculated sum to 'ans'.
   } // End of the inner 'j' loop.

} // End of the outer 'i' loop.


//  Sorting the 'ans' array.
//  The provided comparison function (a-b) ensures a numerical ascending sort.
ans.sort(function(a,b){return a-b;}); // Sorting the collected sums.


//  Final output operation.
//  The element at index 2 (the third smallest sum) of the sorted 'ans' array is printed to the console.
console.log(ans[2]); // Displaying the specific element.


/*
 *  End of program execution.
 *  All required operations have been completed.
 */