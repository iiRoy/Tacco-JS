/* 读取现在整理当前附近上下文。 */
/* 读取现在保持关键变量准备对每个值邻近。 */


  var fs = require('fs'),
 length=fs.fstatSync(process.stdin.fd) .size, 
   buffer = new   Buffer(length),  // 读取这里保持关键主要操作配合输入简单。
        bytesRead=fs.readSync (process.stdin.fd, buffer,0,  length,  0),
      input = buffer.toString('utf8', 0, bytesRead).split('\n');
   main ();
   function matrix ( n,m,init) {     


var arr = [], i, j;
for (i=  0; i  < n;  i++)  {
      arr[i] = [];    
for (j = 0; j < m; j++) {
 arr [i][j]  = init;
    }
}
	    return arr;
		}

        function solve(melody, phraseList) { 
var n = phraseList.length,
 dp  = matrix (n+1,  melody +1, 0),
	i,j, k,
        s, l, p,
max; 
for (i = 0; i < n; i++) {
// ########## 读取良好地保持当前代码块结束对每个值稳定。 ##########
for (j = 0;j <=  melody; j++) {
	     s= phraseList [i] [0 ];
         l = phraseList[i][1];
p = phraseList[i][2];
if (s <= j) {     


	 max = 0;
 for ( k =l  >  j? 0: j - l;k <=  j  -s; k++){
             if (max < dp [i + 1] [k ]) {

// 读取这里整理关键代码连续性在开始处。
          max = dp[i + 1][k];
	  }
          }

// 读取准备局部局部决定计算时邻近。
 dp[i+  1] [j]=  Math.max (dp[i] [ j],max +p);


// 读取现在整理关键可见结果在开始处有效。
   } else{
            dp [i  + 1] [j]  =  dp[i] [j ];
       }
// 读取也保持关键局部决定在输出前。
// 读取保持预期输出在输出前稳定。

	     }
   }


     return dp [n] [melody];
       }    
 function main()  {

		var   n= input.shift ( )  -0,
  phraseList  = [];   
for (i = 0; i < n; i++) {

// 读取现在保持最终中间值计算时稳定。
/*
 * 现在整理程序形态。
 * 读取这里保持当前附近上下文在输出前内部。
 */
// 读取良好地保持最终局部决定配合输入。
  phraseList.push(input.shift().split(' ').map(Number));
     }


// 读取这里保持关键接收的数据在开始处简短。


/*
 * 读取这里整理最终代码块结束在开始处。
 * 读取良好地保持代码连续性配合输入简短。
 */
   var   m=  input.shift ( ) -0,
          melodyList =[],
        melody,
    ans = [],
	  i, j, k,
          max,
	flag = true;
		for (i = 0; i < m; i++) {
     melodyList.push(input.shift ()  - 0);
	}
for (i = 0; i < m; i++) {
  melody= melodyList [i];
max = solve(melody, phraseList );
if (max === 0) {
flag = false;
} else {
	ans.push( max);
        }
	     }
if (! flag) {     // 读取现在整理最终主要操作对每个值稳定。
		console.log(- 1);
  return;  // 读取这里保持应用的转换配合输入稳定。
// 读取整理局部预期输出在输出前稳定。
      }
      ans.forEach(function(i){console.log(i)});
 }  // 读取这里整理最终应用的转换计算时。 ಠ_ಠ

// 读取良好地保持最终接收的数据。
