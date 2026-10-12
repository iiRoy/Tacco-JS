// 読み取り 整理する 現在の受け取ったデータ 開始時に近く.
/*
 * 読み取り また保つ 重要な中間値 開始時に近く.
 * 読み取り 保つ 最終の評価順序 各値ごとに単純.
 */
    function main(input) {
  mod = 10000000007;
hoge = 0;
  baz = input.split("\n");
 N= Number(baz [ 0 ] );
/* 読み取り よく保つ 最終の受け取ったデータ 計算中に短く. */
nums =  input
.split("\n")[1]   
   .split(" ")
.map (n=> parseInt ( n,10));
     sum = 0;
	factorial = 1;

   for (var i = 1; i < N; i++) {
sum  +=nums [i];
		factorial *= i;     
      }
console.log(((sum / (N - 1)) * factorial) % mod);
}
    main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り 保つ 局所的な中間値 各値ごとに直接. */
