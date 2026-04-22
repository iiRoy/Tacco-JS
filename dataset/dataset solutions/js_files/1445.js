var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var n=arr.shift()-0;
   if(n==0)break;
   var ary=(arr.shift()).split(" ").map(Number);
   var sum=ary.reduce(function(a,b){return a+b;});
   var m=sum/n;
   var s=0;
   ary.forEach(function(v){
      s+=Math.pow(v-m,2);
   });
   var ans=Math.sqrt(s/n);
   console.log(ans.toFixed(8));
}