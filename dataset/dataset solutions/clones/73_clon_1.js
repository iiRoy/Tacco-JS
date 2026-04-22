/*
 * This is a JavaScript example demonstrating
 * array sorting in descending order.
 */

// Declare a variable named 'points'
var    points    =    [  40,  100  ,  1  ,  5  ,  25  ,  10  ]    ;

// Sort the 'points' array using a custom comparison function.
// The function (a, b) => b - a sorts in descending order.
points  .  sort  (  function  (  a  ,  b  )  {
    return    b  -  a    ;
}  )    ;


// Output the sorted array to the console.
console  .  log  (  points  )    ;