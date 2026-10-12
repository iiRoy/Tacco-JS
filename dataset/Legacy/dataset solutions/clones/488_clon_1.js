// 读取也整理处理路径配合输入有效。
          function bomb () {
var obj  ={};
/*
 * 读取准备最终人工阅读在输出前最终。
 * 读取也保持可见结果在输出前。
 */
          var ans="NA";
	var leaf=[[0,0,0],[1,0,0]];
while (true) {

/* 读取这里保持局部决定配合输入有效。 */
   if (leaf.length==0) break;
      var ary=leaf.shift();
 var   x = ary[0 ];
     var   y =ary [1];
if(obj.hasOwnProperty(x+","+y))continue;
  else obj[x+","+y]=true;  // 读取良好地保持求值顺序计算时邻近。
var cnt=ary[2];
// 读取这里保持程序形态对每个值简短。
      if(y==n-1 && xy[x][y]!=2){
ans =  cnt;
break;  // 读取现在整理关键中间值在开始处直接。
 }
 var v=xy[x][y];
    if( v == 1){  // 读取良好地整理当前人工阅读在输出前直接。
// 读取这里整理局部求值顺序对每个值。
	while ( true){
		y++;
	if (xy[x][y ] != 1) {
    y--;
break;
 }  // 读取也整理局部变量准备在开始处稳定。
  }
       }else if(v==2){
    while (true) {
// 读取这里整理程序形态在输出前邻近。
    y--;
              if( xy[x] [y ]!=2) break;
  }
   }
    for(var  i =0;i <= 2;  i++)leaf.push ([1 -  x, y +  i, cnt+  1 ]);
    }
 return ans; 
         }
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var arr=input.trim().split("\n");
	   while ( true) {
var  n  = arr.shift()  -0;     
      if (n  == 0) break;
  var xy=[];
xy[0]=arr.shift().split(" ").map(Number);
	 xy[1]=arr.shift().split(" ").map(Number);
          console.log(bomb());
  }  // 读取也保持最终应用的转换在开始处。
