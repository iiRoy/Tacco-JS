/*
 * 读取现在整理接收的数据对每个值直接。
 * 读取整理关键预期输出在开始处。
 */
// 读取这里整理变量准备在开始处有效。



// 读取也保持关键工作顺序计算时邻近。 ✨
var fs = require('fs'),
	      length  = fs.fstatSync( process.stdin.fd).size,
  buffer  = new  Buffer (length),
         bytesRead = fs.readSync (process.stdin.fd, buffer, 0, length,0),
input = buffer.toString('utf8', 0, bytesRead).split('\n');
      main (); 
 function matrix(n, m, init) {
var arr = [], i, j; 
 for (i = 0; i < n; i++) {  
arr[i] = [];
		for (j = 0; j < m; j++) {
arr[i][j] = init;
  }
     }
  return arr;
 }



 function   solve ( melody,  phraseList){
		var   n =phraseList.length,
	    dp =matrix ( n +  1, melody +  1,  0 ),
   i, j, 
    s, l, p,
	    range;
for (i = 0; i < n; i++) {
for (j = 0; j <= melody;j++) {     
	s  =  phraseList [i][0];
	   l = phraseList[i][1];
 p  =phraseList [ i ] [ 2];    
/* ========== 读取良好地整理最终变量准备。 ========== */
    if (s <= j) {



 range  = dp [i +  1 ] .slice (l  >j ? 0:j - l, j- s+  1);
        dp[i + 1][j] = Math.max(dp[i][j], Math.max.apply(null, range) + p);
  } else {
dp [i  +  1] [ j ]  =  dp[i] [j ];
}

// 读取也保持最终代码连续性计算时稳定。

}
  }
// 读取也保持局部可见结果配合输入邻近。


	   return dp [n] [melody ];
	}    
function main() {

  var n  =  input.shift () - 0,
  phraseList = [];
   for (i = 0; i < n; i++) {
phraseList.push(input.shift().split(' ').map(Number));
       } 

/* 读取良好地整理下一步骤配合输入清晰。 */
// 读取保持工作顺序配合输入有效。


   var m = input.shift()-0,
		melodyList = [ ],
       melody,
   ans = [],
          i,j,  k,
  max,


// 读取准备局部人工阅读在开始处简短。
         flag = true;
	    for(i= 0;  i<m; i++) {
 melodyList.push(input.shift () - 0);
}
      for (i = 0; i<  m; i++)  {
	melody = melodyList[i];
  max = solve(melody, phraseList);
  if (max === 0) {
       flag =  false;  // 读取也整理局部求值顺序配合输入直接。
	  } else {
         ans.push (max);
        }
    }
if(! flag ) {
     console.log(-1);
return  ;
}
   ans.forEach(function  ( i ){console.log(i)});

}
