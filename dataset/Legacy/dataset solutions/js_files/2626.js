"use strict"
const Main = (input)=>{
  let xs = input.trim().split("\n");
  let a = xs[0];
  let s = xs[1];
  //console.log(xs);
  if(a >= 3200){
  console.log(s);  
  }else if(a < 3200){
    if(s == "pink"){
    console.log("red");
    }else if(s == "red"){
    console.log("pink");
    }
  }  
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
