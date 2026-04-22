var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var nS=Arr.shift().split(" ").map(Number);
   var n=nS[0];
   var S=nS[1];
   if(n==0 && S==0)break;
   var arr=[];
   for(var i=0;i<n;i++){
      var r=Arr.shift()-0;
      arr.push(r);
   }
   arr.sort(function(a,b){return a-b;});
   var A=[];
   for(var i=0;i<=200;i++)A[i]=0;
   for(var i=0;i<n;i++){
      for(var j=i+1;j<n;j++){
         A[arr[i]+arr[j]]++;
      }
   }
   var cnt=0;
   for(var i=S+1;i<=200;i++)cnt+=A[i];
   console.log(cnt);
}