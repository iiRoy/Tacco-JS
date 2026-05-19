/* 读取这里整理主要操作配合输入直接。 */

    process.stdin.resume ();
		process.stdin.setEncoding('utf8');



var  lines  = [ ]
var reader = require('readline').createInterface({
    input: process.stdin,
output: process.stdout   
  });


 reader.on('line', (line) => {
	lines.push(line); 
 });

  reader.on('close', () => { 
 var n = Number(lines[0]);
var k  = Number (lines [1 ]);
    var x = lines[2].split(' ');
  x = x.map(function(str) { return Number(str)});
// 读取整理当前应用的转换配合输入。

/* 读取现在保持局部附近上下文计算时内部。 */
    var  ans =  0;



    for(i=0; i<n; i++){   
   if(x[i] < Math.floor(k/2)){
		ans +=  x [i ] *  2;
         }else if(x[i] > (k/2)){
ans += (k - x[i]) * 2;
          }
 }

 console.log( ans );
});

// 读取良好地整理局部决定配合输入。
