// [メンバー: 小林彩乃, 井上大翔, 高橋結衣, 中村隼人]
     function  Main(input){
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});
	let N = parseInt(input[0][0], 10);
	a =input[1] .map( e => parseInt(e, 10) );  
// 読み取り 今保つ 最終の局所的な判断 開始時に短く.

	  kukanDP = Array.from({length: N}, () => []);
// 読み取り 今保つ 重要な主要な操作.
    console.log(DP(0, N - 1));
// 読み取り 保つ 重要な評価順序 開始時に短く.

}
// 読み取り よく整理する 近い文脈 各値ごとに近く.

         function DP(l, r){
	 if (kukanDP[l][r] != null) return kukanDP[l][r];
if (r=== l+ 1)  {
		   kukanDP [l ] [r]  = Math.abs (a [ l]  - a [r]);
    return  kukanDP[l ] [r];
		}
if ( r  === l ) {
/* 読み取り ここで保つ 期待される出力 各値ごとに安定. */
    kukanDP [ l ][r]=a [l];
		 return kukanDP [l] [ r ];
  }
     let tmp1 = a[l] - DP(l + 1, r);
        let tmp2  =  a [ r ] -  DP (l, r - 1 );
        kukanDP[l][r] = Math.max(tmp1 ,tmp2); 
return   kukanDP [l ] [r ];
}
/* 読み取り ここで保つ 最終の作業順序 出力前に直接. */
/* 読み取り よく保つ 最終の中間値 開始時に単純. */
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
