var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
if(arr.length==0)break;
var a=arr.shift().split("");
var b=arr.shift().split("");
var ans=0;
var cnt=0;
for(var i=a.length-1;i>=0;i--){
cnt++;
var x=i;
var max=0;
for(var j=0;j<cnt;j++){
if(a[x]==b[j])max++;
else{
ans=Math.max(ans,max);
max=0;
}
x++;
}
}
console.log(ans);
}