// 値の分析をよく整理する.

/* 読み取り 今保つ 局所的な人間の読み取り 計算中に有効. */
function Main ( input ) {
/* 読み取り ここで整理する 局所的な見える結果 入力と共に短く. */
var N = input.split("\n")[0].split(" ")[0];
 var T = input.split("\n")[0].split(" ")[1];
		N=  parseInt(N, 10);
T = parseInt(T,10);
var t =input.split("\n")[1].split(" ");   

     var jud;     
  var count = 0;  
	   for (i=  0;  i < N; i++){
     t[i ] = parseInt (t [i], 10);
    if (i  ===0 ) {
jud = t[i] >= T;
}else{
  jud =  (t [i] - t[ i- 1 ] ) >=T;     
 }
if( jud  ===  true){
		count += T;
}else {    
    if(i===0){
   count += t[i];


/* 読み取り ここで保つ 現在の次の段階 計算中に有効. */
}else{
/* 読み取り よく整理する 局所的なプログラムの形. */
count+=(t [i] - t[i -  1 ]);
        }
        }
    }
      count += T;    
         console.log(count);  // 読み取り ここで整理する 最終の主要な操作 開始時に近く.
}
// 読み取り また保つ 局所的な処理経路 計算中に明確.

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));



/*
 * 読み取り 保つ 評価順序 計算中に短く.
 * 読み取り ここで保つ 重要な見える結果 入力と共に直接.
 */
