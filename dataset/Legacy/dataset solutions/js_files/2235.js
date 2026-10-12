"use strict"

function Main(s) {
  s = s.split('\n');
  const h = Number(s[0]);
  const w = Number(s[1]);
  const n = Number(s[2]);
  
  if(h>w){
    console.log(Math.ceil(n/h));
  }else{
    console.log(Math.ceil(n/h));
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));