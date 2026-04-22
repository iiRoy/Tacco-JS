function bomb(){
   var obj={};
   var ans="NA";
   var leaf=[[0,0,0],[1,0,0]];
   while(true){
      if(leaf.length==0)break;
      var ary=leaf.shift();
      var x=ary[0];
      var y=ary[1];
      if(obj.hasOwnProperty(x+","+y))continue;
      else obj[x+","+y]=true;
      var cnt=ary[2];
      if(y==n-1 && xy[x][y]!=2){
         ans=cnt;
         break;
      }
      var v=xy[x][y];
      if(v==1){
         var flag=false;
         while(true){
            y++;
            if(y>=n-1){
               flag=true;
               break;
            }
            if(xy[x][y]!=1){
               y--;
               break;
            }
         }
         if(flag){
            ans=cnt;
            break;
         }
      }else if(v==2){
         while(true){
            y--;
            if(xy[x][y]!=2)break;
         }
      }
      for(var i=0;i<=2;i++)leaf.push([1-x,y+i,cnt+1]);
   }
   return ans;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
while(true){
   var n=arr.shift()-0;
   if(n==0)break;
   var xy=[];
   xy[0]=arr.shift().split(" ").map(Number);
   xy[1]=arr.shift().split(" ").map(Number);
   console.log(bomb());
}