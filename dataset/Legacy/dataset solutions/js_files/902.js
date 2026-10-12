var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
arr.shift();
var a=arr.shift().split(" ").map(Number);
a.sort(function(a,b){return a-b;});
arr.shift();
var b=arr.shift().split(" ").map(Number);
var c=arr.shift().split(" ");
var ary=[];
for(var i=0;i<1000000;i++)ary[i]=-1;
ary[0]=[0,0];
var sum=[0,0];
a.forEach(function(v){
   sum[1]+=v;
   if(sum[1]>=1000000000){
      sum[0]++;
      sum[1]-=1000000000;
   }
   ary[v]=sum.slice();
});
b.forEach(function(v,i){
   while(true){
      if(ary[v]!==-1)break;
      v--;
   }
   var str=c[i];
   var big=[str.slice(0,str.length-9)-0,str.slice(-9)-0];
   var ans="";
   if(big[0]<ary[v][0]){ans="Yes";}
   else if(big[0]===ary[v][0] && big[1]<=ary[v][1]){ans="Yes";}
   else {ans="No";}
   console.log(ans);
});