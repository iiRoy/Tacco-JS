/* プロジェクト: Kaivor 2649 -- メンバー: 小林陽菜, 渡辺結衣, 山崎湊 -- 登録番号: G160289193, X000526852, P102268407 */

// 読み取り また保つ 重要な受け取ったデータ 開始時に.
         var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=input.split("\n");
   var arr=(Arr[1]).split(" ");
arr.reverse();
console.log(arr.join(" "));
