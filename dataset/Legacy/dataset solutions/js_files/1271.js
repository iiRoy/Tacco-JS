var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input=(input.trim())-0;
var str="";
for(var i=3;i<=input;i++){
if(i%3==0)str+=i+" ";
if(i%3!==0 && (i+"").match(/3/))str+=i+" ";
}
console.log(str.trim());