'use strict'
function Main(input){
  input=input.trim().split(/\s+/);
  var N=input.shift()-0;
  var rightA=input.reduce((acc,str)=>acc+(str[str.length-1]==='A'?1:0), 0);
  var leftB=input.reduce((acc,str)=>acc+(str[0]==='B'?1:0), 0);
  var both=input.reduce((acc,str)=>acc+((str[0]==='B'&&str[str.length-1]==='A')?1:0),0);
  var AB=input.reduce((acc,str)=>acc+str.split('AB').length-1, 0);
  var m=Math.min(rightA,leftB);
  if(both===rightA&&rightA===leftB)m--;
  console.log(AB+m);
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));
