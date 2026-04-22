var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var str=arr.shift();
   if(str=="0 0 0 0 0 0")break;
   var ary=str.split(" ").map(Number);
   var MD=ary[0]+ary[3];
   var GG=ary[1]+ary[4];
   var GO=ary[2]+ary[5];
   var cnt=0;
   cnt+=(MD-(MD%3))/3;
   cnt+=(GG-(GG%3))/3;
   cnt+=(GO-(GO%3))/3;
   MD=MD%3;
   GG=GG%3;
   GO=GO%3;
   while(MD%3>=1 && GG>=1 && GO>=1){
      MD--;
      GG--;
      GO--;
      cnt++;
   }
   console.log(cnt);
}