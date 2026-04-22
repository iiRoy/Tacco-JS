/*
 * This JavaScript file processes input data from standard input.
 * It reads lines, aggregates counts for unique keys, and then
 * prints the keys sorted by alphabetical order and then by length.
 */

// Import the 'fs' (file system) module to read input.
var   input   =    require('fs') . readFileSync('/dev/stdin', 'utf8')   ;

// Trim whitespace from the input and split it into an array of lines.
var   Arr = (   input.trim()   ).split("\n")  ;

// The first line of the input contains the number of subsequent data lines.
var    AL    =    Arr.shift()    ;

// Initialize an empty hash map (object) to store aggregated counts.
var   hash   =   {}   ;

// Loop through the data lines, parsing each one.
for   (  var   i   =   0  ;   i   <   AL  ;   i++   )
{
    // Split the current line by space to get the key and value.
    var   arr   =   Arr[i] . split(" ")   ;

    // The first part is the key.
    var   a   =   arr[0]   ;

    // If the key is not yet in the hash, initialize its count to 0.
    if   (   ! hash.hasOwnProperty(a)   )   hash[a]   =   0   ;

    // Add the numeric value (second part) to the key's total count.
    hash[a]   +=   arr[1]   -   0   ;
}

// Create an empty array to hold the keys from the hash map.
var   K   =   []   ;

// Populate the K array with all the keys found in the hash map.
for   (   var   i   in   hash   )   K.push(i)   ;


/**
 *  Custom comparison function for sorting strings.
 *  It compares strings based on their length.
 *  Returns 1 if a is longer, -1 if b is longer, 0 if lengths are equal.
 */
function   ab   (   a ,   b   )
{
      if   (   a.length   >   b.length   )   return   1   ;
      if   (   a.length   <   b.length   )   return   -1   ;
      return   0   ;
}

// First sort K alphabetically (default sort for strings).
K.sort()   ;

// Then sort K again using the custom comparison function (by length).
K.sort(ab)   ;

// Iterate through the sorted keys and print each key along with its aggregated value.
for   (   var   i   =   0   ;   i   <   K.length   ;   i++   )
{
    console.log(   K[i]   +   " "   +   hash[K[i]]   )   ;
}