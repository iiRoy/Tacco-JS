function GCD(a,b){
   var m=Math.max(a,b);
   var n=Math.min(a,b);
   while(n!=0){
      var N=n;
      n=m%n;
      m=N;
   }
   return m;
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
for(var i=0;i<Arr.length;i++){
   var arr=Arr[i].split(" ").map(Number);
   var gcd=GCD(arr[0],arr[1]);
   var num=(arr[0]/gcd)/(arr[1]/gcd);
   var n=arr[2];
   var sum=0;
   while(n--){
      var str=(num.toFixed(n+2)).slice(-2);
      sum+=(str[0]-0);
   }
   console.log(sum);
}