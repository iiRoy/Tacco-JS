var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var nmp=arr.shift().split(" ").map(Number);
var n=nmp[0]-1;
var m=nmp[1];
var p=nmp[2];
var ary=[];
for(var i=0;i<m;i++){
   var d=arr.shift()-0;
   if(d!=p)ary.push(d);
}
ary=ary.concat(p);
ary.sort(function(a,b){return a-b;});
var min=Infinity;
ary.forEach(function(v,i){
if(v<p){
if(i!=0)min=Math.min(min,(p-v)*2+(n-p+1)+ary[i-1]);
else min=Math.min(min,(p-v)*2+(n-p+1));
}
if(p==v){
if(i==0)min=Math.min(min,ary[ary.length-1]-v);
if(i==ary.length-1)min=Math.min(min,v-ary[0]);
if(i!=ary.length-1)min=Math.min(min,p+n-ary[i+1]+1);
if(i!=0)min=Math.min(min,n-p+1+ary[i-1]);
}
if(p<v){
if(i!=ary.length-1)min=Math.min(min,(v-p)*2+p+(n-ary[i+1]+1));
else min=Math.min(min,(v-p)*2+p);
}
});
console.log(min*100);