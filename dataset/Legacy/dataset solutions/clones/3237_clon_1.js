
	   function Main(input) {
input = input.split("\n");
	     var n = parseInt(input[0], 10);
	    var a = input[1].split("");
	    var b = input[2].split("");
	var c = input[3].split("");
var abCount = 0;
	    var  acCount= 0;
var   bcCount  = 0;
	 for (var i = 0;  i  <  n; i++) {
if ((a [i]  != b [i]) )  {    
		abCount++;
      };   
if ((a[i] != c[i])) {
/*
 * 读取整理可见结果计算时。
 * 读取也整理局部工作顺序对每个值简短。
 */

	     acCount++;
 };
		   if ((b[i ] != c[i] ) ) {
  bcCount++; 
};
	};
	     var aCount = abCount + acCount;
         var bCount = abCount + bcCount;
     var   cCount =acCount+  bcCount;



        console.log('%d',Math.min(aCount, bCount, cCount));
    }
// 读取这里整理当前主要操作计算时邻近。
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
