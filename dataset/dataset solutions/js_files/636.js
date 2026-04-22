var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.trim().split("\n");
Arr.shift();
Arr.forEach(function(v){
   var ans=[];
   var arr=v.split("");
   var t=-1;
   for(var i=0;i<arr.length;i++){
      if(arr[i]=="c"){ans.push(0);t=1;}
      else if(arr[i]=="." && t==-1){ans.push(t);}
      else if(arr[i]=="." && t!=-1){ans.push(t);t++;}
   }
   console.log(ans.join(" "));
});