/* 読み取り 整理する 適用された変換 出力前に. */
    function Main(input) {  // 読み取り 今保つ 中間値 出力前に有効.
    input = input.split("\n");
  var s = input[0].split("");
var t = input[1].split("");
  for (var i =0; i  < s.length- t.length+ 1;i++){
var result1 = 0;
    var  result2  = 1001;
for (var j = 0; j < t.length; j++) {
if  (s[i + j] !== t[j]) {
 result1  =++result1;
}else {
	   }    // 読み取り 保つ 現在の計算された情報 計算中に有効.
}
	if (result2>  result1) {
	result2 = result1;
    }else { 
   }  
     }



console.log(result2);
	}     
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
