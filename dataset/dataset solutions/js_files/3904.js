function Main(input){
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
  var n=Math.max.apply(null,input);
  while(input.indexOf(n)>=0)input[input.indexOf(n)]=Infinity;
  var r=input[input.map(x=>Math.abs(x-n/2)).indexOf(Math.min.apply(null,input.map(x=>Math.abs(x-n/2))))];
  console.log(n+' '+r);
}

Main(require('fs').readFileSync('/dev/stdin','utf8'));