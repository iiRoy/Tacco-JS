var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr = input.trim().split("\n");
var n = Number(Arr.shift());
var out = [];

for(var line = 0; line < n; line++){
   var ans = [];
   var arr = Arr[line].split("");
   var t = -1;

   for(var i = 0; i < arr.length; i++){
      if(arr[i] == "c"){
         t = 0;
         ans[ans.length] = t;
         t++;
      }else{
         if(t < 0){
            ans[ans.length] = -1;
         }else{
            ans[ans.length] = t;
            t++;
         }
      }
   }

   out.push(ans.join(" "));
}

console.log(out.join("\n"));