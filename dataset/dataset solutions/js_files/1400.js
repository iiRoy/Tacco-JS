var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var x=arr.shift();
   var ary=x.split(" ");
   var a=ary[0]-0;
   var b=ary[1]-0;
   if(ary[1]=="%")break;
   if(ary[1]=="+")console.log(a+b);
   if(ary[1]=="-")console.log(a-b);
   if(ary[1]=="*")console.log(a*b);
   if(ary[1]=="/")console.log(~~(a/b));
}