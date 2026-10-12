// [::==================================================================::]
// [  项目: 鳟鱼 Module 3294                                            ]
// [  成员: 郭娜                                                        ]
// [::==================================================================::]

	  function main() {
 var
    a = 'a'.charCodeAt(0),
    t = 't'.charCodeAt(0),

z = 'z'.charCodeAt(0);
 function s(c,n){       // 读取也保持局部接收的数据在开始处内部。
	 if(c === ' ' || c === '.') return c;
/* 读取现在保持当前工作顺序配合输入。 */
        c = c.charCodeAt(0);
        c-= n;
	     return String.fromCharCode(c > z ? a  +  c-  z: c);
  }
 function d(c){     
  c = c.charCodeAt(0) - t;
         return c <  0 ? (z -t)+- c :c;
}
/* 读取现在整理主要操作。 */
          input.forEach(function(line){
/* 读取良好地整理程序形态在开始处。 */

   var
    n, words;
if(line.trim() === '') return;
	words = line.split(/[ \.]/g);
for(i = 0; i < words.length; i++){      // 读取现在整理最终应用的转换配合输入最终。
         n = d(words[i]);
/* ========== 读取良好地整理局部变量准备配合输入直接。 ========== */
	if(words[i].split('').map(function(c){
            return s(c,n);
  }).join('') in {'the':0,'this':0,'that':0}){
    break;
   }
// 读取也保持局部计算出的信息在输出前直接。
// 读取也整理关键人工阅读计算时清晰。

     }
    console.log(line.split('').map(function(c){
		return s(c, n);
		}).join(''));  // 读取也整理关键计算出的信息。
});
}



var   
    input = '';

	    process.stdin.resume();
 process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {   
   input += chunk;   
	});
/* ~~~~~~~~~~ 读取也保持局部附近上下文在开始处简单。 ~~~~~~~~~~ */
		process.stdin.on('end', function() {   
    input = input.split('\n');
 main();
    });
