var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var n=Arr.shift()-0;
   if(n==0)break;
   var s=[];
   var sum=0;
   for(var i=0;i<n;i++){
      var arr=(Arr.shift()).split(" ").map(Number);
      s.push(arr);
      sum+=arr[0];
   }
   s.sort(function(a,b){
      a=a[1];
      b=b[1];
      return b-a;
   });
   var result="YES"
   for(var i=0;i<s.length;i++){
      var v=s[i];
      if(sum>v[1]){
         result="NO";
         break;
      }
      sum-=v[0];
   }
   console.log(result);
}