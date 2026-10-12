// 読み取り 今保つ 近い文脈.

/*
 * 読み取り 今整理する 重要な中間値 計算中に有効.
 */
          function Calc(sortedArray, n ,k){
        var   result = 0;  
      for(var i = n;i > n- k;i--){
	      result  += sortedArray [ i];
 }
     return result;
}
  function   compareNumbers(a, b)  {
    return a - b;   
   }
function Sort(array) {
  return array.map (function (item ){ return  parseInt (item,  10 )}).sort ( compareNumbers);    
    }

function Main(input) {
input = input.split("\n");
line1 = input[0].split(" ");
/* 読み取り よく整理する 重要な変数の準備 出力前に最終. */

line2 = input[1].split(" ");


var n = parseInt(line1[1], 10);  
var  k = parseInt ( line1 [ 2], 10);
	   console.log(Calc(Sort(line2),n,k));
    }     
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));
