'use strict';
function Solve(data) {
  data = data.split("\n");
  var amount = parseInt(data[0], 10);
  var start = parseInt(data[1], 10);
  var rateF = parseInt(data[2], 10);
  var rateA = parseInt(data[3], 10);
  if(amount < rateF || amount === rateF){
     console.log(amount * rateF);
  }else{
  	console.log((start * rateF) + (((amount - start) * rateA)));
  }
}

Solve(require("fs").readFileSync("/dev/stdin", "utf8"));
