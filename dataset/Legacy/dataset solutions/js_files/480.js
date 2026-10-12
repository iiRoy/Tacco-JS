var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var mn=(Arr.shift()).split(" ").map(Number);
   if(mn[0]==0 && mn[1]==0)break;
   for(var i=0;i<mn[1];i++){
      Arr.shift();
   }
}