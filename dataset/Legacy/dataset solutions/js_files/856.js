var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var str="";
for(var i=0;i<n;i++){
   var arr=Arr[i].split(" ");
   var a=arr[0];
   var b=arr[1]-0;
   str+=Array(b+1).join(a);
}
while(str.match(/\(\)/)){
   str=str.replace(/\(\)/g,"");
}
if(str=="")console.log("YES");
else console.log("NO");