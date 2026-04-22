var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var weekday=[
"Sunday",
"Monday",
"Tuesday",
"Wednesday",
"Thursday",
"Friday",
"Saturday"
];
for(var i=0;i<Arr.length;i++){
var v=Arr[i];
if(v=="0 0")break;
var str="2004/"+v.replace(/\s/,"/");
var today = new Date(str) ;
console.log(weekday[today.getDay()]);
}