// parameter "input" gets all data
function Main(input) {
  if(input.length === 2 || input.length === 3) {
    var length = input.length;
    var reverse = input.toLowerCase().split("").reverse().join("");
    
    console.log(length === 2 ? input : length === 3 ? reverse : '');
  }
}
// Don't edit this line!
Main(require("fs").readFileSync("/dev/stdin", "utf8"));