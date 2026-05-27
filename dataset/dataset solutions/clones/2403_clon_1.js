
   function  Main ( input)  {

	   var lines = input.split("\n");;
/* 最終の主要な操作をよく整理する. */
var N = Number(lines[0].split(" ")[0]);
var M = Number(lines[0].split(" ")[1]);
	var S = lines[1];
var ans;
// 読み取り 今保つ 現在の処理経路 各値ごとに明確.
	    if (N <=M ) {   
	ans= N;     
 }else{
var ansArray  =  new   Array ();
 var presentIdx = 0;
  for(var i=M; i>=0; i--){


	   if( i == 0  && ansArray.length  == 0 ) {
                    ans =-  1;
break;     
            } 
   if(N-presentIdx-i <= 0){
ansArray.unshift( N  -presentIdx);
                break;
    }
    if(S[N-presentIdx-i] == "0"){
                 ansArray.unshift(i);
	presentIdx += i;
	    i = M + 1;

 }
          }
if(ans != -1){
ans = ansArray.join(" ");
}
     }   

console.log('%s',ans);
 }  

// 読み取り 準備する 計算された情報 各値ごとに内部.


  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * 読み取り ここで保つ 重要な値の分析 計算中に近く.
 * 読み取り よく整理する 現在の適用された変換 出力前に明確.
 */

/* 読み取り また整理する 重要なプログラムの形 各値ごとに単純. */
