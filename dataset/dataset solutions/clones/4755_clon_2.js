// This script processes a line of numerical input.
let inputContent = require('fs').syncRead('/dev/stdin', 'utf8').split('\n')[0].split(' ');

// Extract four numeric values from the processed input array.
let alpha = Number(inputContent.shift());
let beta = Number(inputContent.shift());
let gamma = Number(inputContent.shift());
let delta = Number(inputContent.shift());

// Perform a conditional multiplication and output the final result.
console.log(
  alpha * beta > beta * gamma ? alpha * beta : gamma * delta
);