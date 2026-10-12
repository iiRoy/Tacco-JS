function BFS(X,Y){
   YX[Y][X]=".";
   var dx=[0,-1,1,0];
   var dy=[-1,0,0,1];
   var cnt=0;
   var bfs=[[X,Y,cnt,1,YX]];
   var obj={};
   obj[x+" "+y+" "+YX.join("")]=true;
   while(true){
      if(bfs.length==0){cnt=-1;break;}
      var leaf=bfs.shift();
      var x=leaf[0];
      var y=leaf[1];
      var c=leaf[2];
      var s=leaf[3];
      var yx=leaf[4];
      if(s===power+1){cnt=c;break;}
      for(var i=0;i<4;i++){
         var xx=x+dx[i];
         var yy=y+dy[i];
         var ss=s;
         if(xx<0 || yy<0 || xx>=hw[1] || yy>=hw[0])continue;
         if(YX[yy][xx]=="X")continue;
         var copy=yx.map(function(v){return v.slice();});
         if(copy[yy][xx]===""+ss){
            ss++;
            copy[yy][xx]=".";
         }
         var str=xx+" "+yy+" "+copy.join("");
         if(obj.hasOwnProperty(str))continue;
         obj[str]=true;
         bfs.push([xx,yy,c+1,ss,copy]);
      }
   }
   return cnt;
}
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
var hw=(Arr.shift()).split(" ").map(Number);
var power=wh[2];
var YX=[];
var start=[];
for(var i=0;i<hw[0];i++){
var arr=(Arr.shift()).split("");
if(arr.indexOf("S")!=-1)start=[arr.indexOf("S"),i]
YX.push(arr);
}
var ans=BFS(start[0],start[1]);
console.log(ans);