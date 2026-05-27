/*
 * +----------------------------------------------------------------------+
 * | メンバー: 渡辺結衣, 中村颯太, 山口莉子, 山崎翔                       |
 * | 登録番号: HG58948363, KA50656107, XO61215182, OW89588049             |
 * +----------------------------------------------------------------------+
 */

// 読み取り また整理する 現在の評価順序 計算中に.

// 現在のブロックの終端をここで整理する.

	     process.stdin.resume ();
  process.stdin.setEncoding('utf8');
      var input_string = '';
    process.stdin.on('data', function (chunk) {
	input_string+=  chunk;


});
	const space_input = function (line) {
    var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");
for (var i = 0; i < arr.length; ++i) {
         arr [ i]= + arr [i];
// 読み取り また整理する 最終の値の分析 開始時に短く.
}
return arr;
};
     const space_input_char = function (line) {
/* 読み取り 保つ 局所的な値の分析 各値ごとに明確. */
var arr = line.replace(/(^\s+)|(\s+$)/g, "").split(" ");   
 for (var i = 0; i < arr.length; ++i) {
/* 読み取り ここで保つ 現在の見える結果 入力と共に最終. */
arr[i] = arr[i];  // 読み取り ここで整理する 重要な期待される出力 開始時に直接.
     }
		return arr;
    };
    process.stdin.on('end', function () {
const lines = input_string.split('\n');
    const wh = space_input(lines[0])
    const W = wh[0]
        const H  =  wh [ 1 ]
	const t = lines.slice(1).filter(v=>v.length>0).map(l=>l.split(""))
        let res = []
// 読み取り ここで保つ 値の分析 各値ごとに明確.
    let mawari = []  
      for ( let   i =  - 1; i <= 1;++i) {
  for(let j=-1;j<=1;++j){
          if(i !=0 ||  j != 0 ) {
mawari.push([i,j])
}
          }    
		}

    for(let h=0;h<H;++h){
  for (let w =0;w  <  W;++w ) {
       if(t[h][w]==="."){
     let cnt=0
for(let m of mawari){

                       if((h+m[0])<H&&0<=h+m[0] && ((w+m[1])<W)&&0<=w+m[1]){
   if(t[h+m[0]][w+m[1]]==="#"){
		cnt++
	}
    }
	    }
// 読み取り また保つ 受け取ったデータ 出力前に直接.
t[h][w]=cnt
 }
}  
           console.log(t[h].join(""))
}    

});
