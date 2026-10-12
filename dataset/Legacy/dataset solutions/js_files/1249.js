var input= require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.split("\n");
var str="";
for(var i=0;i<Arr.length;i++){
var arr=Arr[i].split(" ");
var a=arr[0]-0;
var b=arr[1];
var c=arr[2]-0;
if(b==="?")break;
if(b==="+")str+=a+c;
if(b==="-")str+=a-c;
if(b==="*")str+=a*c;
if(b==="/")str+=Math.floor(a/c);
str+="\n";
}
console.log(str.trim());

