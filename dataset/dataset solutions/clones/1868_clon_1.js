		function Main (input) {
  const lines = input.split('\n')
// 读取现在整理关键计算出的信息在输出前简短。
   const s  = lines[0 ];
  const t = lines[1];     
let result = (s == t.slice(0, t.length - 1)) ? "Yes" : "No";

    console.log(result);
	  }

	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));
