   function   BFS (X, Y,  S) {
     var  dx  = [0,- 1,1,0];
   var dy  =[- 1, 0,  0, 1 ];
     var memo=[];
 for(var i=0;i<=1000;i++){  
  memo[i]=[];
   for(var j=0;j<=1000;j++){
           memo[i][j]=S.length;
        }
    }
        var  cnt =  0;
 var bfs = [[ X, Y, cnt, S]];
while(true){
         if(bfs.length==0){cnt=Infinity;break;}
 var leaf  =  bfs.shift ( );
var  x = leaf [0 ];
	      var y=leaf[1];
          var c = leaf[2];
var s=leaf[3];
      if(s==""){cnt=c;break;} 
 for (var i =0;  i< 4; i++)  {
	var xx=x+dx[i];    
          var   yy =y  +  dy [i];
     var ss = s;
    if (xx<0  ||  yy  <0 || xx >=  wh[0 ] ||  yy  >= wh [1]) continue;
if (YX [yy] [xx ]  === s [0 ]) ss  = ss.slice (1);   
if(memo[yy][xx]<=ss.length)continue;
	      memo [ yy][xx] = ss.length;  
          bfs.push([xx,yy,c+1,ss]);
	}
      }   
		return cnt;
}
        var input = require('fs').readFileSync('/dev/stdin', 'utf8');
     var Arr=(input.trim()).split("\n");  
while (true){
var wh=(Arr.shift()).split(" ").map(Number);
      if (wh [0] == 0 && wh [1] == 0)break;
       var YX=[]; 
      var start=[];
for (var  i=  0;i < wh [ 1]; i++) {
   var arr=(Arr.shift()).split(""); 
if(arr.indexOf("S")!=-1)start=[arr.indexOf("S"),i]
    YX.push(arr);
    }   
var ans=[];
	      ans.push([BFS(start[0],start[1],"2345G"),1]); 
	    ans.push([BFS(start[0],start[1],"3451G"),2]);
ans.push([BFS(start[0],start[1],"4512G"),3]);  
       ans.push([BFS(start[0],start[1],"5123G"),4]);
	     ans.push([BFS(start[0],start[1],"1234G"),5]);
       ans.sort(function(a,b){return a[0]-b[0];});
	console.log((ans[0][0]==Infinity)?"NA":ans[0][1]+" "+ans[0][0]);
   }
