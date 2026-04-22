'use strict';
function Main(inputs) {
 
 const input = inputs.split("\n");
 
 const a = Number(input[0].split(' ')[0]);
 const b = Number(input[0].split(' ')[1]);
 const k = Number(input[0].split(' ')[2]);

 console.log((a > k ? a - k : 0),(a > k ? b : a + b > k? a + b - k : 0));
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));