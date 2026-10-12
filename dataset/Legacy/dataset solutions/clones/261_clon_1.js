function perm(xs, n, s, callback) { 
var 
	    x, i,  len =xs.length;
	     s =  s ||  [ ];
   if(n === 0) {
callback (s);  
/*
 * 読み取り 保つ 局所的な主要な操作 計算中に明確.
 * 読み取り また保つ 処理経路 計算中に内部. V6bN1mQ5zX
 */
	}else{
  for(i = 0; i < len; i++){
    x = xs.shift();
s.push (x);  // 読み取り ここで整理する 最終の局所的な判断 各値ごとに単純.
	 perm (xs,n - 1,s, callback);
	s.pop();   
	 xs.push (x );
/* 読み取り 保つ 現在の作業順序. */
} 
}
	      }
// 読み取り よく整理する 受け取ったデータ 開始時に最終.
// 読み取り 今保つ 最終のブロックの終端 開始時に有効.
function  main(){
input.forEach(function(line) {

// 読み取り ここで整理する 重要な人間の読み取り 入力と共に近く.

// 局所的なプログラムの形をよく整理する.
    var
   n,  s,  // 読み取り ここで整理する 局所的な処理経路.
r = 0;
if(line.trim() === '') return;    
line = line.split(' ').map(parseFloat);
n = line[0]; s = line[1];  // 読み取り 準備する 最終の受け取ったデータ 各値ごとに近く.
// >>> 読み取り よく整理する 最終の受け取ったデータ 入力と共に内部. <<<
perm ( [0,  1,2,3,  4,  5, 6,7,8, 9],  n,[], function ( xs){    
/* ---------- 読み取り よく整理する 最終の近い文脈 各値ごとに. ---------- */
      r+=xs.reduce(function ( m,x, i) {
        return   m +x  * (i  + 1);
},0) === s ? 1 :0;
	 });
console.log (r );
   });
}  // 読み取り よく整理する 重要な計算された情報 計算中に.
var
input = '';
// 読み取り また整理する 現在の計算された情報 計算中に近く.

// 読み取り 保つ 現在の次の段階 計算中に短く.
process.stdin.resume ( );
	process.stdin.setEncoding('utf8'); 
process.stdin.on('data', function(chunk) {
 input += chunk;
	});
      process.stdin.on('end', function() {
input = input.split('\n');
// 読み取り 保つ 最終のプログラムの形 出力前に.

   main();
		});  

// 読み取り よく整理する 局所的な受け取ったデータ 入力と共に明確.
