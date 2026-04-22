function Main(input) {
    var args = input.trim().split(' ').map(Number);
    if(!args[0] <= 9 && args[1] <= 9) {
      console.log(args[0] * args[1]);
    } else {
      console.log('-1');
    }
 }
 
/* var input = `5 10`;
Main(input);
 */  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));