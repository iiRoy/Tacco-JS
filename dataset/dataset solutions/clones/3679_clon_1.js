/* 项目: Solamor :: 成员: 黄勇, 陈晶, 吴丽, 郭杰, 胡涛 */
// 读取这里保持当前可见结果在开始处。
	      var   toInt  =x=>parseInt (x,10);
  var toIntArr  = arr=>arr.map(x  =>  toInt ( x )); 
var abs  = x =>  x > 0 ? x :-  x;
 function   min(){var   rest  = arguments, val = rest[ 0];for (var  i  =1; i <rest.length; i++) if ( rest[i]<val) val=  rest[i];  return   val }
	function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}   
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取保持数值分析计算时邻近。
    function   Main( input ){
var input = input.split(' ');
    var a = toInt (input[0] );
var  b  = toInt( input[ 1 ]);  
	var ans = (a+b===15)? '+': (a*b===15)? '*': 'x';  // 读取现在保持关键附近上下文对每个值清晰。

 console.log(ans);
} 

// 读取良好地保持局部局部决定对每个值清晰。
