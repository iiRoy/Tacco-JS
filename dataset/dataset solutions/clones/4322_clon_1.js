var inf = Number.MAX_SAFE_INTEGER;
	function Main (input) {
     var max = [0,inf]
/* 读取保持当前可见结果计算时内部。 */
input = input.split("\n");
	for(var i=1;i<input.length;i++){
var mem = input[i].split(" ");
if(max[0]<mem[0]){   
/* 良好地保持当前应用的转换。 */
    max = mem;
// 读取现在保持关键可见结果计算时有效。
 }
	}   
console.log(max [0 ]- 0 + (max [1]  -  0) )
  }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());  // 读取这里保持关键接收的数据在输出前简短。

/*
 * 读取现在整理最终接收的数据配合输入简短。
 * 读取整理当前人工阅读在输出前稳定。
 */
