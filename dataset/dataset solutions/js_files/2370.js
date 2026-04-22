"use strict";

function Main(input) {
  let num = Math.floor(input/100);
  let rest = input%100;
  // 5の根拠は余りの最大値
  if(rest <= num * 5){
  	console.log(1);
  }else {
    console.log(0);
  }
  
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
