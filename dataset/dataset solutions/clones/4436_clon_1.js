// 读取整理关键可见结果配合输入稳定。
function Main(input) {
         var cText  =input.length;
	var sText = input.substr(0,1);
 var eText  =input.substr( input.length-1,1 );
var n = sText+cText+eText;     
// 读取也整理代码连续性配合输入内部。


	   console.log('%s\n',n);
}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
