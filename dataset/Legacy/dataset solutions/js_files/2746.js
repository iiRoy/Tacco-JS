"use strict";
(function(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  const N=input.shift();
  const A=(N%3===0),
        B=((input.reduce((a,c)=>a+c*c,0))===0);
  if((!A)&&(!B)){
    console.log("No");
    return;
  }
  if(B){
    console.log("Yes");
    return;
  }
  const values=[],
        counts=[0,0,0];
  for(let i=0;i<N;i++){
    let V=values.length;
    if(V>3){
      console.log("No");
      return;
    }
    for(let v=0;v<V;v++){
      if(input[i]===values[v]){
        counts[v]++;
        i++;
        v=-1;
        continue;
      }
    }
    values.push(input[i]);
    if(counts[V]===0)counts[V]++;
  }
  if(values.length>3){
    console.log("No");
    return;
  }
  const C=((counts[0]===counts[1])&&(counts[1]===counts[2]));
  const E=((counts[2]===0)&&((counts[0]===(2*counts[1]))||(counts[1]===(2*counts[0]))));
  if((!C)&&(!E)){
    console.log("No");
    return;
  }
  const D=((values[0]^values[1]^values[2])===0);
  if(!D){
    console.log("No");
    return;
  }else{
    console.log("Yes");
    return;
  }
})(require("fs").readFileSync("/dev/stdin","utf8"));
