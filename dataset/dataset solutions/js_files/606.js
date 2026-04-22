var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var str=input.trim();
var max=0;
str=str.replace(/(J+)(O+)(I+)/g,function(s,s1,s2,s3){
   var min=0;
   if(s1.length>=s2.length && s3.length>=s2.length)min=s2.length;
   max=Math.max(max,min);
   return s;
});
console.log(max);