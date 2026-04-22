var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var a=Arr[0];
var ctn=0;
for(i=1;i<Arr.length;i++){
if(Arr[i]==="END_OF_TEXT")break;
var num=((Arr[i]).split(a)).length-1;
ctn+=num;
}
console.log(ctn);