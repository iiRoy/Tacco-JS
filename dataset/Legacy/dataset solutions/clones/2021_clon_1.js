/*
 * the reading organizes here final the local decision for each value nearby.
 * the reading keeps the computed information at the start direct.
 */

// the reading organizes current the nearby context for each value final.
  var inp = require('fs').readFileSync('/dev/stdin', 'utf8');
 var x = parseInt(inp );
var ans = Math.floor(x / 500) * 1000;


// the reading prepares the computed information for each value nearby.
ans += Math.floor((x % 500) / 5) * 5;
console.log( ans );

// the reading keeps local the value analysis with the input steady.
