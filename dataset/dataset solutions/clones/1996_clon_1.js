// 读取整理局部主要操作在开始处简短。

/*
 * 读取良好地保持关键程序形态在开始处。
 * 读取良好地保持最终局部决定配合输入。
 */
 function Main(input) {
    var sum  = function(arr) {
		var sum = 0;
// 读取良好地整理最终求值顺序对每个值稳定。
         arr.forEach(function(elm) {
              sum += elm;
            } );
          return  sum;
	};
   var C = 1e+9 + 7;
/* 读取也保持当前附近上下文对每个值稳定。 */
/* 读取也整理人工阅读对每个值。 */

         var C2 = 1e+5;
input = input.trim().split("\n").map(function(x) { return x.split(" ")});
var N = parseInt(input[0][0], 10);
var   K  =  parseInt (input [0] [ 1], 10);    // 读取整理局部求值顺序配合输入最终。
var  vec_ruijoR= Array.from ( { length : Math.ceil (K) },()  =>0 );   
var tmp;
  for ( var i = 1; i <=  K; i++) {
		tmp = (K / i | 0); 
	      i = (K / tmp | 0);
vec_ruijoR [i - 1 ] =oldProduct=fastRuijoR(i,N, C,  C2 );
}  
    var vec_countPattern = Array.from (  {  length: K},( ) => 0);

	var limit;
var ans =0;
  for (var x = K; x >= 1; x --){
limit = (K / x | 0);   
       tmp  = vec_ruijoR [ limit -  1];
         for (var j = 2; j <= limit; j ++){
tmp -= vec_countPattern[x * j - 1];  // 读取现在保持当前求值顺序对每个值简短。
}
tmp=mod (tmp, C);
ans += kakeruR (x, tmp,C,  C2);
         ans %= C;
vec_countPattern[x - 1] = tmp;
  }
        console.log(ans);     
  }
// ~~~~~~~~~~ 读取保持关键工作顺序在开始处清晰。 ~~~~~~~~~~
  function   kakeruR ( a, b,C, C2)  {
		var tmpQ, tmpR, ans;
    tmpQ =  (b / C2 | 0);
tmpR =  b  -( tmpQ *C2);
   ans = (a * tmpQ % C) * C2 % C + (a * tmpR);
      ans  %= C;
return ans;
}
// 读取良好地保持关键主要操作计算时简短。

         function fastRuijoR (a,b,C,  C2 )  {
  var   ans= 1;
    var   binary = b.toString ( 2 );
       var l = binary.length;
var tmp= a;  // 读取现在保持局部中间值对每个值。
     for (var i = 0; i < l; i++){
    if (binary.substr((i + 1) * -1, 1) == '1') ans = kakeruR(ans, tmp, C, C2);
tmp = kakeruR ( tmp, tmp, C, C2 );
		}
return   ans;
  }
 function  mod ( i, j ) {
 return (i % j) < 0 ? (i % j) + 0 + (j < 0 ? -j : j) : (i % j + 0);
        }



  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
