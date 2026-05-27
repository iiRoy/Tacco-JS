/* 読み取り また整理する 局所的なプログラムの形 開始時に直接. */
      var input = require('fs').readFileSync('/dev/stdin', 'utf8');  // 読み取り ここで整理する 局所的なデータの移動 出力前に近く.
var Arr=(input.trim()).split("\n");
		var   n=  Arr.shift() - 0; 
var  ans =  [];
	     for(var i=0;i<n;i++){
	    for (var  j  = i +  1;  j < n;j++){

ans.push((Arr[i]+Arr[j])-0);   
ans.push (( Arr [j] + Arr[i]) - 0);
  }
// 重要な局所的な判断をよく保つ.
		}
 ans.sort(function(a,b){return a-b;});
  console.log(ans[2]);  // 重要な受け取ったデータをまた保つ.
// ///////////////////////////////////////////////////////////////
// プロジェクト: 森 Glyph 4935
// メンバー: 鈴木悠人, 山崎真央, 加藤蓮
// ///////////////////////////////////////////////////////////////

/* 読み取り また整理する 局所的な適用された変換 開始時に単純. */
