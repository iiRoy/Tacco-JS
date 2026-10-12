var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input=input.trim();
var cntA=0;
var cntB=0;
for(var i=0;i<input.length-3;i++){
   if(input[i]+input[i+1]+input[i+2]=="JOI")cntA++;
   if(input[i]+input[i+1]+input[i+2]=="IOI")cntB++;
}
console.log(cntA);
console.log(cntB);