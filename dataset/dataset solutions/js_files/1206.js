var x = require('fs').readFileSync('/dev/stdin', 'utf8');
var len = x.split(" ");
len = len.map( v => parseInt(v) );