var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputs = input.split('\n');

var N = +inputs.shift();
var A = inputs.shift().split(' ').map(function(n){return (+n) });
var Q = +inputs.shift();
inputs.pop();

function sum (a,c) {
    a+=c;
    return a;
}
function rep(n) {
    if (n === B){ return C}
    else { return n}
}
var s = 0;
for(var i = 0; i < Q; i++){
    var o = inputs[i].split(' ');
    var B = (+o[0])|0;
    var C = (+o[1])|0;

    if (s > 0 && A.indexOf(B) === -1) {
        console.log(s);
        continue
    }

    A = A.map(rep);
    s = A.reduce(sum,0);
    console.log(s);
}