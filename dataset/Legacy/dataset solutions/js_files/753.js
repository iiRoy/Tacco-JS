var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr= input.trim().split("\n");
var n=arr.shift()-0;
var [a,d]=arr.shift().split(" ").map(Number);
var obj={};
var m=arr.shift()-0;
for(var i=0;i<m;i++){
   var [x,y,z] = arr.shift().split(" ");
   if(obj.hasOwnProperty(y)==false)obj[y]=y;
   if(obj.hasOwnProperty(z)==false)obj[z]=z;
   if(x=="0")[obj[y],obj[z]]=[obj[z],obj[y]]
   else obj[y]=obj[z];
}
var k=arr.shift()-0;
if(obj.hasOwnProperty(k+""))k=obj[k]-0;
console.log(a+((k-1)*d));
