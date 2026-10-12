var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var trimmed = input.trim();
var str = trimmed.replace(/egg/g, "E");
str = str.replace(/chicken/g, "C");

var expanded = str.replace(/EE/g, "EAE");
expanded = expanded.replace(/CC/g, "CAC");

var ary = expanded.split("A");
var ans = "";

ary.forEach(function(v){
   var candidateLength = v.length;
   var answerLength = ans.length;
   if(answerLength < candidateLength){
      ans = v;
   }
});

var tail = ans.slice(-1);
var result;
if(tail == "E"){
   result = "egg";
}else{
   result = "chicken";
}
console.log(result);
