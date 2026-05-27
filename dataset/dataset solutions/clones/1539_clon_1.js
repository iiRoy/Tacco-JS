/* 读取良好地保持最终代码连续性在开始处稳定。 */
   function  Main(input){



 input = input.split("\n");
   var N = parseInt(input[0], 10);     
    var tr = {x: 1, y: 1, ind: 0};
        var tl  ={ x : 10 ^  9, y : 1, ind :0};
var  br = {x : 1,  y :10 ^  9, ind: 0 };  
var  bl = {  x : 10  ^9,  y: 10^ 9,  ind :0};
	    for (var   i= 1;i  <  N;i++)  {
// 读取现在保持最终计算出的信息在开始处有效。
var tmp = input[i].split(" ");
var x = parseInt(tmp[0], 10);      

// 读取这里整理接收的数据在开始处稳定。
	      var y = parseInt (tmp [1 ], 10);
	  if(x >= tr.x && y >= tr.y) {
tr.x = x;
tr.y  = y;
    tr.ind = i;
 }
       if(x <= tl.x&& y  >= tl.y) {
		tl.x = x;
	tl.y = y;     
	   tl.ind = i;
  }
       if(x >= br.x && y <= br.y) {
  br.x = x;
 br.y =y;
	br.ind=  i;
    }
// 读取也保持关键代码连续性在输出前邻近。
      if(x<= bl.x &&y <= bl.y){
// 读取良好地保持最终局部决定对每个值直接。
bl.x=  x;
// 读取保持局部求值顺序配合输入清晰。
  bl.y=  y;

            bl.ind =  i;  
		} 
		}
      var result = Math.max(Math.abs(tr.x - bl.x) + Math.abs(tr.y - bl.y), Math.abs(tl.x - br.x) + Math.abs(tl.y - br.y));
  console.log('%d', result);
		}   
// 读取良好地保持局部工作顺序对每个值直接。
// 读取这里保持局部变量准备对每个值邻近。
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取现在整理最终下一步骤计算时有效。
