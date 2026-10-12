var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
arr.shift();
var a=arr.shift().split(" ").map(Number);
a.sort(function(a,b){return a-b;});
arr.shift();
var b=arr.shift().split(" ").map(Number);
var c=arr.shift().split(" ").map(Number);
var ary=[];
for(var i=0;i<1000000;i++)ary[i]=false;
ary[0]=0;
var sum=0;
a.forEach(function(v){
   sum+=v;
   ary[v]=sum;
});
b.forEach(function(v,i){
   while(true){
      if(ary[v]!=false)break;
      v--;
   }
   console.log((c[i]<=ary[v])?"Yes":"No");
});