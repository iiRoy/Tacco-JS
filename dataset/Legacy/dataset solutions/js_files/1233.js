var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var x = input.split('\n');
for(i=0; i<x.length; i++){
    var row = x[i].split(' ').map(Number);
    a = row[0];
    b = row[1];
    if(a === 0 && b === 0)break;
    var m = row.sort(function(a, b){return a - b});
    console.log(m.join(' '));
}
