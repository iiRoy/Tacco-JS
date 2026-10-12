function prime(max){
   var arr=[];
   for(var i=0;i<=max;i++)arr[i]=i;
   arr[0]=false;
   arr[1]=false;
   var sqrt=Math.floor(Math.sqrt(max));
   for(var i=2;i<=sqrt;i++){
      if(arr[i]==false)continue;
         for(var j=i+i;j<=max;j+=i){
            arr[j]=false;
         }
   }
   var obj={};
   for(var i=0;i<=max;i++){
      if(arr[i]!==false)obj[arr[i]]=true;
   }
   return obj;
}
var p=prime(1000000);
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var nx=Arr.shift().split(" ").map(Number);
   var n=nx[0];
   var x=nx[1];
   if(n==0 && x==0)break;
   var dp=[];
   for(var i=0;i<=1000000;i++)dp[i]=false;
   var arr=[];
   for(var i=0;i<n;i++){
      var v=Arr.shift()-0;
      arr.push(v);
      dp[v]=true;
   }
   dp[0]=true;
   for(var i=0;i<=x;i++){
      for(var j=0;j<arr.length;j++){
         if(dp[i])dp[i+arr[j]]=true;
      }
   }
   for(var i=x;i>0;i--){
      if(dp[i] && p.hasOwnProperty(i))break;
   }
   console.log((i==0)?"NA":i);
}