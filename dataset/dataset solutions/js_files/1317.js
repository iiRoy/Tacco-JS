var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = input.split('\n');
var s = input[0]+input[0];
var p = input[1];
if(s.indexOf(p)!==-1){
    console.log('Yes');
}
else{
    console.log('No');
}
