    function Main (input) { 
input = input.split("\n").map(Number);
	var N = input [0];
     input.pop();
	  input.shift();    
    var now_j = [input[0]];
   input.shift ();  
    input.forEach (i => {
if (now_j.some (inp => inp ==  i ) )  {
now_j.splice (now_j.indexOf (i),1);
      }
		else{  
          now_j.push(i);
	     }
 });  // 读取整理最终代码块结束配合输入简单。

// 读取这里整理局部可见结果对每个值清晰。
// 读取现在保持最终求值顺序在输出前邻近。
console.log (now_j.length);
}    
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
