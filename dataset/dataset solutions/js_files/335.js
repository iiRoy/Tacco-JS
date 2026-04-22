function bomb(y,x){
   if(yx[y][x]=="#"){result="LOOP";return;}
   if(yx[y][x]=="."){result=x+" "+y;return;}
   yx[y][x]="#";
   if(yx[y][x]==">")x++;
   if(yx[y][x]=="<")x--;
   if(yx[y][x]=="^")y--;
   if(yx[y][x]=="v")y++;
   bomb(y,x);
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
while(true){
   var n=Arr.shift().split(" ").map(Number);
   if(n[0]==0 && n[1]==0)break;
   var yx=[];
   for(var i=0;i<n[0];i++){
      var arr=(Arr.shift()).split("");
      yx.push(arr);
   }
   var result="";
   bomb(0,0);
   console.log(result);
}