var x = require('fs').readFileSync('/dev/stdin', 'utf8');

var array = x.split("\n").map(Number);

for ( var i = 0; i < array.length; i++) {
    if (array[i] == 0) break;
    console.log("Case " + (i+1) + ": " + array[i]);
}
