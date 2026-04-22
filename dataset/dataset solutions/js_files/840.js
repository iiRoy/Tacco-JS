function A(){
   var max=0;
   var ary=[];
   for(var i=1;i<=8;i++){
      for(var j=1;j<=8;j++){
         if(yx[i][j]!=".")continue;
         var cnt=seach(i,j,"x","o");
         if(cnt>max){ary=[i,j];max=cnt;}
      }
   }
   return ary;
}
function B(){
   var max=0;
   var ary=[];
   for(var i=8;i>=1;i--){
      for(var j=8;j>=1;j--){
         if(yx[i][j]!=".")continue;
         var cnt=seach(i,j,"o","x");
         if(cnt>max){ary=[i,j];max=cnt;}
      }
   }
   return ary;
}
function seach(y,x,a,b){
   var dy=[-1,-1,-1,0,0,1,1,1];
   var dx=[-1,0,1,-1,1,-1,0,1];
   var sum=0;
   for(var i=0;i<8;i++){
      var DY=dy[i];
      var DX=dx[i];
      var cnt=0;
      var k=1; 
      while(true){
         if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;
         else if(yx[y+DY*k][x+DX*k]==a)cnt++;
         else if(yx[y+DY*k][x+DX*k]==b){sum+=cnt;break;}
         k++;
      }
   }
   return sum;
}
function change(y,x,a,b){
   yx[y][x]=b;
   var dy=[-1,-1,-1,0,0,1,1,1];
   var dx=[-1,0,1,-1,1,-1,0,1];
   var cnt=0;
   for(var i=0;i<8;i++){
      var DY=dy[i];
      var DX=dx[i];
      var cnt=0;
      var k=1;
      var flag=false;
      while(true){
         if(yx[y+DY*k][x+DX*k]=="f" || yx[y+DY*k][x+DX*k]==".")break;
         else if(yx[y+DY*k][x+DX*k]==a)flag=true;
         else if(yx[y+DY*k][x+DX*k]==b){
            if(flag){
               while(k--)yx[y+DY*k][x+DX*k]=b;
            }
            break;
         }
         k++;
      }
   }
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
var yx=[];
yx.push("ffffffffff".split(""));
arr.forEach(function(v){
   v="f"+v+"f";
   yx.push(v.split(""));
});
yx.push("ffffffffff".split(""));
var pass=0;
while(true){
   var ansA=A();
   if(ansA.length==0)pass++;
   else {pass=0;change(ansA[0],ansA[1],"x","o");}
   var ansB=B();
   if(ansB.length==0)pass++;
   else {pass=0;change(ansB[0],ansB[1],"o","x");}
   if(pass>=2)break;
}
yx.shift();
yx.pop();
console.log(yx.join("\n").replace(/\,|f/g,""));