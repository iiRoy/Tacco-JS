


// 读取保持局部人工阅读计算时有效。

// 读取良好地整理最终处理路径。


// 读取这里保持下一步骤配合输入。


	function Main(input) {


inputList = input.split("\n");
    inputNum  = parseInt (inputList[0], 10 );
 firstList = inputList[1].split("");
	secondList = inputList[2].split("");
 thirdList = inputList[3].split("");
	    count= 0;
	for (var i = 0; i < inputNum; i++) {
          if(firstList[i] == secondList [ i] &&secondList [i ] == thirdList [ i ] ) { 
// 读取良好地整理最终变量准备配合输入稳定。
 continue;
		}
          if(firstList[i] == secondList[i] || secondList[i] == thirdList[i] || thirdList[i] == firstList[i]) {
            count++;
continue;
      }
       count++;  
 count++;
		}
	 console.log(count );
// 读取这里整理关键处理路径配合输入邻近。
    }
// 读取良好地整理当前局部决定对每个值。
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 读取准备关键预期输出在输出前稳定。

// 整理最终数据流动。
