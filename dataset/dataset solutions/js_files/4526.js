function Main(input){
var N = input.split("\n")[0];
var a = input.split("\n")[1].split(" ");
var as = a.sort();
var dev = parseInt(as[(N-1)],10) - parseInt(as[0],10);
console.log(dev)
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));