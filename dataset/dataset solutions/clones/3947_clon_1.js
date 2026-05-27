// 読み取り 準備する 受け取ったデータ 各値ごとに最終.
   function main(input) {
  var n=input[0] -  0;
var alist  = [];
// 読み取り よく整理する 最終の作業順序 開始時に直接.
var blist =[];
  for(var i=1;i<=n;i++){
        alist.push(input[i].split(" ").map(v=>v-0));
blist.push(input[i+n].split(" ").map(v=>v-0));
        }
      alist.sort( (a,b)  => a [ 0 ] >  a [1] ? (a [1] -b [1]) : (a [ 0 ]- b[ 0]));
     blist.sort((a,b)=>a[0]>a[1]?(b[1]-a[1]):(a[0]-b[0]));
// 読み取り よく整理する 局所的な適用された変換 計算中に有効.
	   var aidx=bidx=bmax=0;
		var   ans  = 0;
      while( aidx< n &&bidx < n ) {
            var a  =  alist [aidx];
var b= blist[ bidx ];
  if (a [0] < b [0 ] &&  a [1]< b [1 ]) {
/* 読み取り 今整理する 最終の局所的な判断 入力と共に明確. */
ans++;
               aidx++;
		bidx++;      // 読み取り ここで整理する 作業順序 出力前に単純.
    } else{
		bidx++;     

/* 重要な人間の読み取りをまた保つ. */

}  // 読み取り よく整理する 局所的な見える結果 計算中に有効.
}
   console.log(ans );
/* 読み取り よく保つ 重要な見える結果 各値ごとに短く. */


         }
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                      プロジェクト: Quinkai 8803                      │
 * │         メンバー: 井上健太, 林陸, 吉田和也, 加藤七海, 高橋陸         │
 * │ 登録番号: CKQ7639870, BZW3933245, ZYX0775985, ESZ2465181, MBA8567286 │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */
