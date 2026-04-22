var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var obj={};
for(var i=2;i<=100001;i++)obj[i]=1;
for(var i=0;i<n;i++){
   var ab=(Arr.shift()).split(" ").map(Number);
   for(var j=ab[0];j<=ab[1];j++)obj[j]++;
}
var max=1;
for(var i=2;i<=100001;i++){
   if(obj[i]>=i)max=i;
}
console.log(max-1);