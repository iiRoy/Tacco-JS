var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
for(var i=0;i<Arr.length;i++){
   var L=Arr[i]-0;
   if(L==0)break;
   var sum=0;
   for(var j=1;j<=12;j++){
      var arr=Arr[i+j].split(" ").map(Number);
      sum+=arr[0]-arr[1];
      if(sum>=L)break;
   }
   (sum>=L)?console.log(j):console.log("NA");
   i=i+12;
}