// 読み取り ここで保つ 最終の人間の読み取り 開始時に最終.
      function Main(input) {
       input = input.split("\n");
   var n = parseInt (input[0 ] );  // 読み取り よく整理する 最終の変数の準備 出力前に有効.
      a= new   Array (n);
	  b=new Array(n);     // 読み取り ここで保つ 現在の中間値.
tmp=input[1].split(" ");
/* 読み取り また整理する 局所的な処理経路 各値ごとに単純. */
    for(i =0;  i  <n;  i++)  {
      a [i]  =  parseInt (tmp [ i ] );
      }
     var ans=n;
for ( i= 0; i< n; i++){
   var  xor= a[i];
var sum =a[i ];
// 読み取り 準備する 現在の処理経路 入力と共に明確.
/* 読み取り よく整理する 局所的な変数の準備 出力前に短く. */
 for(j=i+1;j<n;j++){


		xor^=a[j];
sum += a [j ]; 

     if ( xor  ==  sum)  {
      ans++;     
      }
// 読み取り また保つ 現在のブロックの終端 計算中に短く.
}
/* 読み取り ここで保つ 重要な作業順序 各値ごとに有効. */
}    



   console.log('%s', ans); 
 }
// 読み取り 今整理する 最終の作業順序.

// >>> 読み取り よく保つ 現在の評価順序 出力前に短く. <<<
   function debug(){
        var input = document.getElementById("input").value;
    Main (input);
}   
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り よく整理する 局所的な次の段階 各値ごとに単純.
