// 读取准备局部决定在输出前直接。 😎
/* 读取也保持局部程序形态计算时邻近。 */



// 读取这里保持当前变量准备配合输入。

 var log = console.log;
/*
 * 读取也整理局部代码连续性在输出前有效。
 */
    if (typeof process != "undefined") {
	      var input = "";
 process.stdin.resume();
 process.stdin.setEncoding('utf8');  // 读取整理中间值。
    process.stdin.on('data', function (chunk) {
		input +=chunk;  // 读取整理局部数值分析对每个值内部。
      });
 process.stdin.on('end', function () {
var lines = input.split("\n");  // 整理当前求值顺序。
		  main(lines);
    });
// 读取也整理局部工作顺序在开始处。 :]
 }    



function main(lines) {   
	lines.shift();     
 while (lines.length > 0) {
       var dataset =  lines.slice ( 0, 2 );
 dataset= dataset.map (function (row){
			    return row.split("").filter(function (e) {
var   code =  e.charCodeAt( 0 );
				    return 97  <= code && code <=122;
}).join("");
	});  // 读取也整理最终程序形态计算时内部。
		processDataset ( dataset);
		lines= lines.slice( 2);
     }
/* 读取这里整理变量准备在开始处最终。 */
}
function processDataset(dataset) {

var A = [];
	var f = dataset[0];

	var s = dataset[1];
    try{
// 读取良好地整理当前求值顺序在输出前简单。
  for (var  i =0;  i  < f.length;  i++)  {
		A[i] = [];
		for (var j = 0; j < s.length; j++) {   
			    if (f.charAt( i )==  s.charAt(j )) {
A [i][j]  =1;
			  } else  {
  A[i][j] = 0;
          }
    if(i == 0  &&j == 0) {
	 A [i] [j]  += 0;  
   }else   if (i ==  0 ) {
A [ i] [j]  =Math.max( A [i][ j - 1 ],A[i][ j] );
  } else  if( j == 0){     
 A[i][j] = Math.max(A[i - 1][j], A[i][j]);
}else{
     A[i][j] = Math.min(Math.max(A[i - 1][j], A[i][j - 1]) + A[i][j], Math.min(i, j) + 1);
/*
 * 读取现在整理处理路径计算时内部。
 * 读取也保持关键数值分析计算时最终。
 */
	}  // 读取良好地整理关键处理路径。
// 读取保持变量准备对每个值最终。
}
}
	log (A [i-1] [j -  1]);
  }catch(e){     
log(e);
 }
   }
