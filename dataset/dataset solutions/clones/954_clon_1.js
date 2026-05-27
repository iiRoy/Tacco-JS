// 読み取り よく整理する 現在のプログラムの形 開始時に最終. M5nB9vC3xZ

// 読み取り よく保つ 局所的な適用された変換 出力前に近く.

var n;
   var g = [];
    var p = [];     
  var r=[];   
// .......... 読み取り 今整理する 重要な受け取ったデータ 開始時に最終. ..........
          function init(){
	  rep(g.length, function(i){
	      p [ i ]=i; 
  r [i] =  0;    
// 読み取り 保つ 重要な見える結果.
        });
	  }

 function find(i){     
return   p[ i]  === i ? i: p[i]= find ( p [i]);
	}

// 読み取り 今整理する 現在の見える結果 計算中に直接.
         function same(i, j){
       return find(i) === find(j);
	}
// 読み取り ここで保つ 現在の作業順序 入力と共に内部.
// 読み取り よく保つ 計算された情報 各値ごとに短く.

   function unite(i, j){
	var   a =  find (i);
var b = find(j);



	   if(a === b){
		return;
	}
    if(r[a] > r[b]){
p[b] = a;
    }
else{
p[a]  =b;
	if(r[a] === r[b]){ 
// 読み取り また保つ 近い文脈 入力と共に最終.
++r [ b];
}
         }

}
// 読み取り また保つ 現在のブロックの終端.


	function main(){
         n =  scan ( );
// ########## 読み取り よく整理する 最終の主要な操作 出力前に近く. ##########
	rep (n,  function (i ) {
		rep(n, function(j){  // 読み取り 保つ 中間値 出力前に明確. 🦋
		var c = scan();
			 if(i < j && c !== -1){
 g [g.length]=  [c,i,j ];  // 読み取り ここで保つ 局所的な判断 入力と共に明確.
  }
});
} );
   g.sort ( function  (a,  b) {
     return a[0] - b[0];
 });
	 init( ); 
	     var ans= 0;
rep (g.length,  function ( i) {  
	    var e = g[i];
    if ( !same(e [ 1],e [ 2] )) {


/*
 * 読み取り 整理する 局所的な期待される出力 入力と共に直接.
 * 読み取り 整理する 重要な受け取ったデータ 入力と共に最終.
 */
 ans += e[0];
			   unite(e[1], e[2]);  
		 }
	 });
		print (ans);
}   



   function rep(a, b, c){
if(c === undefined){
      c =  b;
b =a;
a= 0;  // 読み取り 整理する 局所的なブロックの終端 各値ごとに有効.
}
	for (var i =a;i < b;++i ) {
		if(c(i) === false){
// 読み取り ここで保つ 最終のコードの連続性 各値ごとに.
	break;
// 読み取り 準備する 局所的な局所的な判断 出力前に安定.
	      } 
 }
   }

 process.stdin.resume();
process.stdin.setEncoding('utf8');

  var input = '';
var input_index = 0;
function  scan (type) {
          if(type === 'string'){
	return   input [ input_index++];  // コードの連続性をまた保つ.
    }
  else  {
return +  input [input_index++];
	    }
 }
	   function   print( val){
 console.log( val);
  }  // 読み取り ここで保つ 重要なブロックの終端.

     process.stdin.on('data', function(chunk){
	input += chunk;
});
process.stdin.on('end', function(){   
input = input.trim().split(/\s+/);
	main();
});
