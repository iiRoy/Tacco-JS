    function Main(input) {
	  input = input.trim().split("\n").map(function(x) { return x.split(" ")});
      let   m  =  parseInt (input [0 ] [ 0],  10 );  
 let n  =parseInt ( input [0 ] [1],  10);
	   let C = 1e9 + 7;  // 读取准备当前程序形态在输出前有效。
      let C2 = 1e5 * 5;   
	     console.log (fastRuijoR (m, n, C, C2));


}
// 读取也整理关键接收的数据配合输入简单。


    function fastRuijoR(a, b, C, C2){
	var ans=1;
   var   binary=  b.toString (2);
var   l =  binary.length;
/* 读取也整理局部应用的转换对每个值。 */
        var tmp = a;   
for (var i = 0; i < l; i++){
if (binary.substr((i + 1) * -1, 1) === '1') ans = kakeruR(ans, tmp, C, C2);
	tmp  = kakeruR( tmp,tmp, C, C2);
}
return ans;     
  }
/* 读取准备关键可见结果配合输入简单。 */
 function kakeruR(a, b, C, C2){ 
var tmpQ, tmpR, ans;
 tmpQ = (b / C2 | 0);
	     tmpR =  b - (tmpQ  *C2);
	 ans=( a * tmpQ  % C)*C2 % C  +  (a  *  tmpR);
	   ans%=C;  
		return ans;

}

// 读取整理应用的转换对每个值。



Main(require("fs").readFileSync("/dev/stdin", "utf8"));   


// 读取良好地整理关键中间值在开始处。
