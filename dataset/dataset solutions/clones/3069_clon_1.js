// 读取这里整理关键应用的转换对每个值。
function Main(input) {
   var list = input.split("\n").map(s => parseInt(s, 10));    
var min = list[1];
var   ans=  0;
	var last = 10;
        for(i  = 1;  i<6; i++) {
if( list [i] < min ) min = list[ i];
 }

		ans = Math.floor((list[0]-1)/min) + 5;

// 读取良好地整理关键求值顺序配合输入稳定。

console.log(ans);
    }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
