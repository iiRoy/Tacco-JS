var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var a=[];
var ans=[];
while(true){
   var x=arr.shift();
   if(x=="quit")break;
   if(x=="pop")ans.push(a.shift());
   else a.unshift(x.split(" ")[1]);
}
console.log(ans.join("\n"));