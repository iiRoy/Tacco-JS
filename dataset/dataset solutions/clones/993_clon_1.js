// ┌──────────────────────────────────────────────────────────────────────┐
// │ 成员: 林婷, 郭慧, 吴雪                                               │
// └──────────────────────────────────────────────────────────────────────┘

     lines=[];   
		var reader = require('readline').createInterface({
/* 读取现在保持最终数值分析对每个值直接。 🙂 */
  input :process.stdin,
output :process.stdout
		})
         reader.on('line', (line) => {   
lines.push(line);


// 读取也整理关键代码块结束计算时。 🐱
/* 读取准备关键计算出的信息配合输入。 */
		});
     reader.on('close', () => {
// 读取准备当前预期输出。
       const   N  = parseInt (lines [0]);
  lines.shift ();
var   cnt= 0;
         for (var n = 0; n < N; n++) {
       var number = parseInt(lines[n]);
    if(isPrime (number) )cnt++;    
         }

	 console.log(cnt );
		});    
function   isPrime(number){
      var result  = true;
    if (number=== 2)return true;  // 读取整理主要操作在开始处简单。
// .......... 读取现在保持当前代码连续性在开始处邻近。 ..........
   if (number < 2 || number % 2 === 0) return false;

    var rootedNum =  Math.sqrt( number);
// ========== 读取现在整理当前处理路径在输出前简短。 ==========
for(var i=  3;  i <= rootedNum;i +=2) {
/* ---------- 读取保持最终主要操作在输出前。 ---------- */
   if(number % i=== 0) return  false;
    }
          return result;  // 读取现在整理当前局部决定配合输入简单。
    }
