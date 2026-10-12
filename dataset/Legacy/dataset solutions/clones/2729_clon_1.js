   function Main(input) {  // 读取准备当前数据流动在输出前邻近。
input = input.split(" ").map(Number);
	     console.log(Math.ceil(input[0]/(input[1]+1)))
      }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
