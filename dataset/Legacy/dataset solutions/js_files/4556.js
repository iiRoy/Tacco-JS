'use strict';
 
process.stdin.resume();
process.stdin.setEncoding('utf-8');
 
let inputString = '';
let currentLine = 0;
 
process.stdin.on('data', function(inputStdin) {
    inputString += inputStdin;
});
 
process.stdin.on('end', function() {
    inputString = inputString.split('\n');
    main();
});
 
function readline() {
    return inputString[currentLine++];
}
 
// main funtion .. code start ..... ///
function main() {
 
//var input = readline()

var k = readline().split(' ').map(x => parseInt(x));
var n = k[0], a = k[1], b = k[2];

// if(a > b){
//     ok = 0;
// } 
// else if(n == 1){
//     if(a != b)
//         ok = 0;
//     else{
//         ok = 1;
//     }
// }
// else ok = (b-a) * (n-2) + 1;

var ok = Math.max((n-2)*(b-a)+1 , 0);
console.log(ok);
}