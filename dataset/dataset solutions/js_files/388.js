function bomb(y,x,z){
   if(yx[y][x]!="+")return;
   var dy=[-1,0,1,0];
   var dx=[0,1,0,-1];
   var Y=y+dy[z];
   var X=x+dx[z];
   if(Y<0 || X<0 || Y>=n || X>=n){
      z=(z+1)%4;
      bomb(y,x,z);
   }else{
      if(yx[Y][X]=="#"){
         yx[Y-dy[z]][X-dx[z]]="+";
         if(z==3)bomb(Y-2*dy[z]-1,X-2*dx[z],0);
         else if(z==0)bomb(Y-2*dy[z],X-2*dx[z]+1,1);
         else if(z==1)bomb(Y-2*dy[z]+1,X-2*dx[z],2);
         else if(z==2)bomb(Y-2*dy[z],X-2*dx[z]-1,3);
      }else{
         yx[y][x]="#";
         last=[y,x];
         bomb(Y,X,z);
      }
   }
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n").map(Number);
var d=arr.shift();
while(d--){
   var n=arr.shift();
   if(n==1){
      console.log("#");
      continue;
   }
   var yx=[];
   for(var i=0;i<n;i++){
      yx[i]=[];
      for(var j=0;j<n;j++){
         yx[i][j]="+";
      }
   }
   var last=[];
   bomb(n-1,0,0);
   if(n%2==0)yx[last[0]][last[1]]="+";
   console.log(yx.join("\n").replace(/\,/g,"").replace(/\+/g," "));
}