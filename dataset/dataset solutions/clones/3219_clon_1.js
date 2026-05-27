    function  Main( input)  {
  input =input.trim ()

// 读取保持最终人工阅读在开始处简短。

     input = input.split(" ").map(Number);
	 console.log(input[0]/input[1])
	     }Main(require("fs").readFileSync("/dev/stdin", "utf8"));
