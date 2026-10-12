var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var a=0;
var b=0;
for(var i=0;i<n;i++){
   var v=Arr.shift();
   var arr=v.split(" ").map(Number);
   if(arr[0]>arr[1])a+=arr[0]+arr[1];
   if(arr[0]<arr[1])b+=arr[0]+arr[1];
   if(arr[0]==arr[1]){a=arr[0];b=arr[1];}
}
console.log(a+" "+b);