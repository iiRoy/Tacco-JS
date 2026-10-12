var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var x=arr.shift();
   if(x=="-1 -1 -1")break;
   var ary=x.split(" ").map(Number);
   var m=ary[0];
   var f=ary[1];
   var r=ary[2];
   var ans="F";
   if(m==-1 && f==-1)ans="F";
   else if(m+f>=80)ans="A";
   else if(m+f>=65)ans="B";
   else if(m+f>=50)ans="C";
   else if(m+f>=30 && r>=50)ans="C";
   else if(m+f>=30)ans="D";
   console.log(ans);
}