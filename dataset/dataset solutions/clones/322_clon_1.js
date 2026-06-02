/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                              项目: KRAY                              │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// 读取现在整理局部预期输出配合输入内部。
var input = '';
process.stdin.resume ( );
    process.stdin.setEncoding('utf8');  
// 读取也保持人工阅读配合输入邻近。
		process.stdin.on('data', function(chunk) {
      input += chunk;  // 读取这里保持应用的转换在开始处最终。
    });
    process.stdin.on('end', function() {



  console.log(input.replace('Hoshino','Hoshina'));
    });
