function BFS(X,Y){
   var dx=[0,-1,1,0];
   var dy=[-1,0,0,1];
   var cnt=0;
   var bfs=[[X,Y,cnt,1]];
   var obj={};
   var memo=[];
   for(var i=0;i<=1000;i++){
      memo[i]=[];
      for(var j=0;j<=1000;j++){
         memo[i][j]=0;
      }
   }
   memo[X][Y]=0;
   var J=0;
   while(true){
      var leaf=bfs[J];
      J++;
      var x=leaf[0];
      var y=leaf[1];
      var c=leaf[2];
      var s=leaf[3];
      if(s===power+1){cnt=c;break;}
      for(var i=0;i<4;i++){
         var xx=x+dx[i];
         var yy=y+dy[i];
         var ss=s;
         if(xx<0 || yy<0 || xx>=hw[1] || yy>=hw[0])continue;
         if(YX[yy][xx]=="X")continue;
         if(YX[yy][xx]===""+ss)ss++;
         if(memo[xx][yy]>=ss)continue;
         memo[xx][yy]=ss;
         bfs[bfs.length]=[xx,yy,c+1,ss];
      }
   }
   return cnt;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var hw=(Arr.shift()).split(" ").map(Number);
var power=hw[2];
var YX=[];
var start=[];
for(var i=0;i<hw[0];i++){
var arr=(Arr.shift()).split("");
if(arr.indexOf("S")!=-1)start=[arr.indexOf("S"),i]
YX.push(arr);
}
var ans=BFS(start[0],start[1]);
console.log(ans);