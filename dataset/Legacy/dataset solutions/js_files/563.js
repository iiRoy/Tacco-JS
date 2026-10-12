function maxSum(arr,len){
var sum=[];
for(var i=0;i<arr.length-len;i++)sum.push(arr[i]+arr[i+1]+arr[i+2]);
sum.sort(function(a,b){return b-a;});
console.log(sum[0]);
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var a;
var b;
for(var i=0;i<Arr.length;i++){
   var Line=Arr[i].split(" ").map(Number);
   if(Line.length==2 || i==Arr.length-1){
      if(i!=0)maxSum(a,b);
      a=[];
      b=Line[1]-0;
   }else{
      a.push(Line[0]);
   }
if(Arr[i]=="0 0")break;
}