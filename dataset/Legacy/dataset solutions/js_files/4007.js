function Main(input){
input  = input.slice(‘¥n’);
arare = input[1].slice(‘ ’);

if(arare.indexOf(‘Y’) != -1)
  console.log(‘Four’);
else
console.log(‘Three’);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));