var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var N=Arr.shift()-0;
   if(N==0)break;
   var pm=[];
   for(var i=0;i<N;i++){
      var arr=(Arr.shift()).split(" ").map(Number);
      var m=arr[0];
      var a=arr[1];
      var b=arr[2];
      pm.push([a,m]);
      pm.push([b-0.1,-1*m]);
   }
   pm.sort(function(a,b){
   a=a[0];
   b=b[0];
   return a-b;
   });
   var flag="OK";
   var sum=0;
   for(var i=0;i<pm.length;i++){
      sum+=pm[i][1];
      if(sum>150){flag="NG";break;}
   }
   console.log(flag);
}