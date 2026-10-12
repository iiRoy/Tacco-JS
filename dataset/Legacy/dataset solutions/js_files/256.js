var input = require('fs').readFileSync('/dev/stdin', 'utf8');

var Arr=(input.trim()).split("\n\n");
var arrA=(Arr[0].split("\n")).map(function(v){return v.replace(/\,.*/,"")-0;});
var arrB=(Arr[1].split("\n")).map(function(v){return v.replace(/\,.*/,"")-0;});
arrA.sort(function(a,b){a-b;});
var c={};

arrA.forEach(function(v){
if(arrB.indexOf(v)!==-1)c[v]=0;
});

arrA.forEach(function(v){
   if(c[v]!==undefined)c[v]++;
});
arrB.forEach(function(v){
   if(c[v]!==undefined)c[v]++;
});

for(var i in c)console.log(i+" "+c[i]);