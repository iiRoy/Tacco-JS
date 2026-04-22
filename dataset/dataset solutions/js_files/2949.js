function Main(input){
var char = input.split("\n")[1];
var K = input.split("\n")[0].split(" ")[1];
var char1 = char.split("");
var a = char[K-1].toLowerCase();
char1.splice(K-1,1,a);
console.log(char1.join(""));
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));