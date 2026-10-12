/* ========== 読み取り また保つ 近い文脈 出力前に最終. ========== */
function Main(input){   
   input = input.split(" ");
nums = input.map(input => parseInt(input,10));    
 ans  = (nums[0 ]  -  1 )  *  ( nums[ 1 ]- 1 )
	  console.log (ans );     
/* 読み取り ここで整理する 現在の近い文脈 開始時に単純. */
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
