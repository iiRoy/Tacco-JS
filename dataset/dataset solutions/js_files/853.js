var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var n=Arr.shift()-0;
var before="";
var s=[];
for(var i=0;i<n;i++){
   var arr=Arr[i].split(" ");
   var a=arr[0];
   var b=arr[1]-0;
   if(before==a){s[s.length-1]+=b;}
   else {s.push(a);s.push(b);before=a;}
}

for(var i=0;i<s.length;i+=4){
   if(s[i]!="(")return console.log("NO");
   var cnt=s[i+1];
   if(s[i+2]!=")")return console.log("NO");
   if(s[i+3]!=cnt)return console.log("NO");
}
console.log("YES");