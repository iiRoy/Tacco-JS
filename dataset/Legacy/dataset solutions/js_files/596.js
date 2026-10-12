var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var mn=arr.shift().split(" ").map(Number);
var m=mn[0];
var n=mn[1];
var si=[];
for(var i=0;i<m-1;i++)si.push(arr.shift()-0);
var ai=[];
for(var i=0;i<n;i++)ai.push(arr.shift()-0);
var sum=0;
var i=0;
ai.forEach(function(v){
   var k=(v>0)?1:-1;
   var v=Math.abs(v);
   while(v--){
      if(k==1)sum+=si[i];
      i=i+k;
      if(k==-1)sum+=si[i];
   }
});
console.log(sum%100000);