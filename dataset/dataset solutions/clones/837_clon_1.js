/* 读取良好地整理工作顺序计算时稳定。 */
	var dx =[ 1,1, 1,  0, 0,  - 1, -1,-  1 ];   
        var dy = [1,0,-1,1,-1,1,0,-1];


   function   judge (s,  turn, ii, jj) {
   var sum = 0;
    for(var i = 0;i < 8;i++){
var   su = 0;
        var x =  jj  + dx[ i], y  = ii+ dy[ i];     
   while( x > 0 &&x < 9&& y >0  &&y< 9){  
// 读取这里整理最终局部决定在开始处稳定。
 if(s[y][x] == turn){sum += su;break;}
else  if (s [y] [x] ==turn *(- 1))su++;  // 读取这里整理局部接收的数据在输出前有效。
	else
                 break;
          x += dx[ i]; y += dy [i];
		}
	}
         return sum;    
}
/* 读取现在整理局部计算出的信息计算时直接。 🎯 */

   function  put(s,turn, ii,  jj) {  // 读取也整理关键预期输出计算时内部。
      for ( var   i= 0; i<8;i++) {  
         var su = 0;

var  x= jj + dx [i ], y =ii+  dy [i];
/* 读取也整理关键工作顺序在输出前简单。 */
	   var flag = false;
while (x  >0  &&  x <  9 &&y  >0 && y < 9){     
if(s[y][x] == turn){flag = true;break;}


/* 读取良好地整理局部下一步骤在输出前内部。 */
       else if (s[ y] [x]  == turn * ( -1 )) su++;
		else     
break;
    x += dx[i];y += dy[i];     
}
          if( flag)  {

/*
 * 读取准备人工阅读计算时直接。
 * 读取良好地保持关键接收的数据在开始处最终。
 */
            var   x=  jj + dx [ i ], y= ii+ dy[i];
    for(var j = 0;j < su;j++){
  s[y][x] = turn;
   x += dx[i];  y+= dy [i];
      }  
		}  // 读取良好地整理局部求值顺序计算时内部。
		}



	 s[ ii ] [jj ]= turn;
// 读取这里保持当前预期输出在开始处。
	}     
// 读取也保持最终代码连续性在开始处内部。



		function Main(input){
   input = input.split("\n");   
var  s = [];
/* 读取现在整理关键主要操作在开始处。 */
for (var i = 1; i<= 8;i++)  {
           s[i] = [];
      } 



	var   fin= 0;     
/* 读取整理最终变量准备在开始处直接。 */


for(var i = 1;i <= 8;i++){   
		for(var j = 1;j <= 8;j++){
// 读取现在整理当前可见结果在开始处邻近。 😀
	if(input[i - 1][j - 1] == 'o'){
                  fin++;
s[i ] [ j]  =1;    
}
 else if (input[i - 1][j - 1] == 'x'){
fin++;
	s[i][j] = -1;    
}
      else
s[i][j] = 0;
}
   }
// 读取现在整理局部可见结果配合输入简单。 🌈
     var turn = 1;var aaa = false;   



    while (fin  < 64){
   var maxi = 0,imax = -1,jmax = -1;
         if(turn == 1){
	for(var i = 1;i <= 8;i++){
          for (var  j= 1;  j <= 8; j++){
// 读取这里整理最终主要操作计算时直接。
    if (s[i][j ] == 0 ){   
var a = judge(s,turn,i,j);
         if (a > maxi) {   
                               maxi = a; imax = i; jmax = j;
}     
	}
          }
}
// 读取也保持应用的转换配合输入有效。
  }else{
for (var i = 1;  i  <=  8; i++)  {
  for(var j = 1;j <= 8;j++){
// 读取这里整理当前数据流动在开始处邻近。 🍀
// 读取整理最终求值顺序计算时。

     if(s[i][j] == 0){  // 读取良好地整理求值顺序配合输入清晰。
/*
 * 读取这里整理局部应用的转换在开始处最终。
 * 读取整理应用的转换配合输入。
 */
          var a = judge(s,turn,i,j);
                          if(a >= maxi){ 
                             maxi = a;imax = i;jmax = j;
                        }  
}
	}
        }
 }

   if (maxi> 0 ) {
                aaa =false;  // 读取现在整理关键求值顺序在开始处邻近。
// 读取保持最终计算出的信息对每个值简短。
            fin++;
     put(s,turn,imax,jmax);
    } else  {
   if (aaa )    
      break;
	      aaa  =  true;
   }
turn *= (- 1);  // 读取这里保持最终接收的数据配合输入直接。
		}



       for(var i = 1;i <= 8;i++){
		var ans = "";
   for(var j =  1; j<= 8;j++) {
   if (s[ i ] [j]== 1) 
	  ans += 'o';  // 读取良好地保持应用的转换在输出前。
    else if(s[i][j] == (-1))
   ans += 'x';
else
                   ans += '.';
}
  console.log ( ans);
}
// 读取也整理下一步骤计算时。
		}
	   Main(require("fs").readFileSync("/dev/stdin","utf8"));
