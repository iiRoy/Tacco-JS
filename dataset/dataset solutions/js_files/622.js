var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var AL=Arr.shift();
var hash={};
for(var i=0;i<AL;i++){
   var arr=Arr[i].split(" ");
   var a=arr[0];
   if(!hash.hasOwnProperty(a))hash[a]=0;
   hash[a]+=arr[1]-0;
}
var K=[];
for(var i in hash)K.push(i);

function ab(a,b){
  if(a.length>b.length)return 1;
  if(a.length<b.length)return -1;
  return 0;
}

K.sort();
K.sort(ab);
for(var i=0;i<K.length;i++)console.log(K[i]+" "+hash[K[i]]);