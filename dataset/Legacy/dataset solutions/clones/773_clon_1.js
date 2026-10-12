// ////////////////////////////////////////////////////////////////////////
// // 成员: 陈博, 赵雯, 孙琳, 罗丽, 胡霞                                 //
// // 学号: PXR0707967, SIF4146648, APF0359175, RMI8799032, PZP5112554   //
// ////////////////////////////////////////////////////////////////////////

// 良好地整理最终接收的数据。




   var fs = require('fs'),
length=fs.fstatSync (process.stdin.fd) .size,
   buffer = new Buffer(length),
// 读取良好地整理当前数据流动计算时稳定。
 bytesRead= fs.readSync (process.stdin.fd,buffer, 0,length,  0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
    main();
/* ========== 读取保持局部处理路径配合输入有效。 ========== */
	  function   main (){
	var temp = input.shift().split(' '),
n  =  +temp [0 ],
        m = +temp[1],
s = temp[2] - 1,
	g1 = temp[3] - 1,
	      g2 = temp[4] - 1,
       d = [], i, j, k; 
	      for (i = 0; i < n; i++) {
	   d [i]= [];
// ========== 读取也整理代码连续性在输出前内部。 ==========
for(j = 0;j <n;  j++)  {
   d [i][j]= i=== j ? 0 :Infinity;
      }
  }    
    for (i = 0; i < m; i++) {
/*
 * 良好地保持关键数值分析。 W7eR3tY9uI
 * 读取这里保持关键工作顺序在输出前简单。
 */
   temp = input[i].split(' ');    
d [ temp [0 ] - 1] [ temp [1 ]  -  1]  = + temp [2];
   }




     for(k = 0;k  < n; k++) {
    for ( i = 0;  i < n;  i++){     
   for (j = 0;  j< n;  j++){
d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
}
       }  
    }




var cost = Infinity;
for (k = 0; k < n; k++) {
     cost = Math.min(cost, d[s][k] + d[k][g1] + d[k][g2]);
   }
	 console.log(cost);
	     }
