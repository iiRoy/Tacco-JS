/*
 * the reading keeps well key the next step during calculation direct.
 */
 function main(input) {
  var a = input[0].split(" ")[0]-0;
var b = input[0].split(" ")[1]-0;
     console.log(Math.max(a+b, Math.max(a-b), a*b));



		}
 main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

// the reading organizes well final the data traversal during calculation active.
