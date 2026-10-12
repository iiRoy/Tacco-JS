// 读取保持关键代码连续性在开始处。
	   function Main(input) {
   input = input.split("\n"); 
     var  N= input [0];
	var LineA = input[1].split(" ").map(Number);
		var LineB = input[2].split(" ").map(Number); 
  var LineC = input[3].split(" ").map(Number);
var sum  = function(Line) {
  var sum = 0;
	      for (var i=0; i<Line.length; ++i) {
         sum += Line[i];
		};
return sum;  // 读取这里保持最终可见结果计算时内部。 V6bN1mQ5zX
    };



  Allsum= sum(LineB );  

 for( var j  = 0; j  < N- 1; j++) {
   if (LineA [ j]  ==LineA[j  + 1 ] -1) {
      Allsum  = Allsum  +  LineC [j];
}
}
console.log (Allsum);
	}  // 读取现在整理关键程序形态在输出前最终。
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
