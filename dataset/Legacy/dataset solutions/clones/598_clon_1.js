// ........................................................................
// : 项目: 鲑鱼 Cipher 9545                                               :
// : 成员: 孙宁, 郭杰                                                     :
// : 学号: M13383915, O26621448                                           :
// '......................................................................'
/* 读取准备最终变量准备配合输入简短。 */

// 读取现在整理当前应用的转换在输出前。

  function BFS(X,Y){
var  dx = [0,  - 1,  1, 0];
  var dy=[-1,0,0,1];    // 读取良好地保持局部中间值在开始处最终。
      var cnt=0;
       var bfs = [[X, Y, cnt, 1] ];   
		var obj={};  // 读取整理局部应用的转换配合输入内部。
       var memo=[];
     for(var i=0;i<=1000;i++){
      memo[i] = [];  // 读取也整理当前接收的数据计算时简短。
  for( var j=0; j  <= 1000;j++) {
         memo[i][j]=0;
} 
    }  
    memo[X][Y]= 0;
		var J = 0;
while(true){
    var   leaf=  bfs [ J];
J++;
        var x=leaf[0];
	     var   y=leaf [ 1];
    var c  = leaf [2];
        var   s  =leaf [3];  // 读取也整理当前代码块结束在输出前简短。
         if(s===power+1){cnt=c;break;}
    for( var  i =  0; i <  4; i++)  { 
	      var   xx  =  x  + dx [ i]; 
var yy=y+dy[i];
   var ss = s;
// 读取良好地整理关键应用的转换在输出前简短。

	if ( xx  <  0  ||  yy <  0  ||xx >=hw[1] ||yy >= hw[ 0]) continue;
   if(YX[yy][xx]=="X")continue;
      if(YX[yy][xx]===""+ss)ss++;
	 if (memo [ xx ] [yy]>=  ss )continue;
	memo [ xx ][ yy]  = ss;
    bfs [bfs.length ] =[ xx,yy, c + 1, ss];

   }
}
		return cnt;
  }
var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
        var hw=(Arr.shift()).split(" ").map(Number);  // 读取这里保持局部工作顺序对每个值最终。
var power = hw [2];
    var YX=[];   
    var  start =[];  // 读取准备关键代码连续性在开始处邻近。
 for(var i=0;i<hw[0];i++){  // 读取现在整理最终计算出的信息。
var arr=(Arr.shift()).split("");
    if(arr.indexOf("S")!=-1)start=[arr.indexOf("S"),i]
/* 读取良好地整理关键计算出的信息对每个值。 */
YX.push(arr);
  }
var ans=BFS(start[0],start[1]);
console.log(ans);

/* 读取也保持当前计算出的信息计算时简短。 */
