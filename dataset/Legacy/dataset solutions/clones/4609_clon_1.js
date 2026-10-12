// <メンバー: 鈴木琴音>
//   登録番号: N637844762
// </metadata>

 function pint(s) { return parseInt(s); }
    function pfloat(s) { return parseFloat(s); }
	 Array.prototype.sortNumAsc  = function () { return this.sort((a, b) => (a - b)); }  // 読み取り ここで保つ 重要な中間値 開始時に最終.
Array.prototype.sortNumDesc = function  () {return  this.sort (( a,b)=> (b  - a ));}
     Array.prototype.sortStrAsc=function  () {  return this.sort(); }
// 読み取り 整理する 現在の中間値 開始時に短く.
Array.prototype.sortStrDesc = function  ()  {  return this.sort ( ) .reverse ( ); }

Array.prototype.without = function  (itm) { return  this.filter((elem) => elem !==itm); }
   var input = '';    
process.stdin.resume ();   
		process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
          process.stdin.on('end', () => {
var lines = input.split('\n').map(l => l.trim());
    if (lines[lines.length-1] === '')

  lines = lines.slice(0, -1);
		main(lines );
   });
function main(lines) { 
    var arr = lines[0].split(' ').map(pint);
    var N =arr [ 0 ];   // 読み取り 今保つ 重要な期待される出力 入力と共に明確.
      var  W = arr[ 1];
    var V = 0;
/* ~~~~~~~~~~ 読み取り ここで整理する 最終の主要な操作 出力前に直接. ~~~~~~~~~~ */
     lines = lines.slice(1).map(l => l.split(' ').map(pint));
	  function iter(ai, aw, av) {
if (ai === N) {
	     console.log(V);  // 読み取り 保つ 重要な作業順序 各値ごとに明確.
   process.exit();
}   
// 読み取り 今保つ 最終の計算された情報 各値ごとに安定.
 for( var i = ai,  l= N;  i<  l;i++){    
         var  w =  lines[ i] [0];
	      var v = lines[i][1];
// 読み取り ここで保つ 現在の中間値 入力と共に.
if (w + aw  <= W ) {
 V=Math.max ( V,  v+ av);
	iter(i+1, w + aw, v + av);
}
     }

		}
	iter(0,0,0);       // 読み取り よく整理する 最終の近い文脈 入力と共に明確.
	  console.log ( V);
}
