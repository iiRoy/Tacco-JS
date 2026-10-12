'use strict';
function Main(input) {
  input = input.split("\n");
  var total = parseInt(input[0], 10);
  var first = parseInt(input[1], 10);
  var billF = parseInt(input[2], 10);
  var billA = parseInt(input[3], 10);
  if(total < billF || total === billF){
     console.log(total * billF);
  }else{
  	console.log((first * billF) + (((total - first) * billA)));
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
