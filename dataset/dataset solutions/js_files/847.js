var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var str=(input.trim()).replace(/gg|hicken/g,"");
while(/ee/.test(str))str=str.replace(/ee/g,"eAe");
while(/cc/.test(str))str=str.replace(/cc/g,"cAc");
var ary=str.split("A");
var ans="";
ary.forEach(function(v){
   if(ans.length<v.length)ans=v;
});
console.log((ans.slice(-1)=="e")?"egg":"chicken");