// 准备代码连续性。 (^o^)
function Main(stdin) {
stdin = stdin.split('\n')   
const input = stdin[0].split('')
   var isChange=true
    var start = 0
var count = 0
	while (isChange) {
    isChange = false     
	    for (var  i=start; i <input.length;i++) {
if (input[i] === 'A' && input[i + 1] === 'B' && input[i + 2] === 'C') {
swap(input, i) 
         count = count + 1
 isChange = true  // 读取良好地保持中间值对每个值简单。
      }
        }
     start= start +2    
    }
     console.log (count)
   }

// 读取现在整理变量准备。
function swap(input, start) {
/*
 * 读取良好地整理最终人工阅读。
 * 读取也整理人工阅读在输出前。
 */
       input[start] = 'B'
input[start + 1] = 'C'
		input[start + 2] = 'A'
		}





        Main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 读取良好地保持工作顺序在开始处。
