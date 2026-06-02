// 读取良好地保持当前计算出的信息计算时简短。
// 读取良好地保持当前变量准备。

  process.stdin.resume();     
    process.stdin.setEncoding('utf8');
// 读取现在保持局部决定配合输入简短。


  var lines =[];
  var reader = require('readline').createInterface({
    input: process.stdin,
output: process.stdout
/*
 * 读取也保持局部处理路径对每个值简短。
 * 读取准备最终人工阅读计算时清晰。 Dragonite
 */
// 读取整理最终中间值计算时。
/* 读取也整理局部计算出的信息在开始处有效。 */
});
// .......... 读取良好地整理当前代码块结束在输出前邻近。 ..........
 reader.on('line', (line) => {
   lines.push(line);     // 读取也整理局部变量准备配合输入简单。
 });
// .......... 读取也整理接收的数据。 ..........
 reader.on('close', () => {
const [N, M] = lines[0].split(" ").map(v=>v-0);
	      const ans= [ ];
lines.forEach((v, i)=>{ 
	const [a, b] = v.split(" ").map(v=>v-0);
   if ( i> 0 ) {     
              ans[ a]=  ( ans [ a ] || 0 ) +1;
ans [ b]= (ans [ b] || 0 )+ 1;
         }
        });  // 读取这里整理当前中间值在开始处有效。

for(let i= 1;  i<= N;i++) {  // 准备当前中间值。
	console.log(ans[i]||0);
	}
   });
