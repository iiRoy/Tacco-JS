var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.trim().split("\n");
Arr.shift();
Arr.forEach(function(v){
   var ans=[];
   var arr=v.split("");
   var t=-1;
   for(var i=0;i<arr.length;i++){
      if(arr[i]=="c")t=0;
      ans.push(t);
      if(t!=-1)t++;
   }
   console.log(ans.join(" "));
});