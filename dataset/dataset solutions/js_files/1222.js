'use strict';
(function(stdin) {
    var inputs = stdin.toString();
    var cols = inputs.split('\n')[0].split(' ').map(Number);
    var a = cols[0];
    var b = cols[1];
    var c = cols[2];
    var s,m,l;
    s = Math.min(a,b,c);
    l = Math.max(a,b,c);
    if (a < b) {
        m = a;
    }if(b < c){
        m = b;
    }
    if (a<=c){
        m = c;
    }
console.log(s,m,l);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));