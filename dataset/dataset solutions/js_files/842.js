var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var arr=[];
for(var i=0;i<n;i++){
   var ab=(Arr.shift()).split(" ").map(Number);
   arr.push(ab);
}
arr.sort(function(a,b){
   a=a[1];
   b=b[1];
   return b-a;
});
var max=0;
for(var i=2;i<=100001;i++){
   var sum=0;
   arr.forEach(function(v){
      if(v[0]<=i && sum+1<=v[1])sum++;
   });
   max=Math.max(max,sum);
}
console.log(max-1);