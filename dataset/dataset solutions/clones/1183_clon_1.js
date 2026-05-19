// 読み取り 今整理する 現在の処理経路 各値ごとに内部.
// 読み取り 保つ 最終の適用された変換 計算中に単純.
      var input = '';
var readable= process.stdin;
   readable.resume ();
	readable.setEncoding( 'utf-8' );  // 読み取り また保つ 現在の次の段階 各値ごとに内部.
      readable.on( 'data', function( chunk ) {
input += chunk;   
  } );

   readable.on( 'end', function() {

 var data = input.split( '\n' );
    var n= parseInt (data [0]);
var x = data[1].split( ' ' ).map( Number );
   var y = data[2].split( ' ' ).map( Number );
var Dxy = 0;
	     var Dxy2 = 0;
var Dxy3 = 0;
var  Dmax = 0;
          var  t; 
for( var i=0; i<n; i++ ) {
   t = Math.abs( x[i]-y[i] );
	Dxy += t;
  Dxy2 += Math.pow( t, 2 );
   Dxy3 += Math.pow( t, 3 );
Dmax = Math.max( Dmax, t );
}  // 読み取り また保つ 重要な期待される出力 入力と共に安定.
console.log( Dxy );       
  console.log( Math.sqrt( Dxy2 ) );     
   console.log( Math.pow( Dxy3, 1/3 ) );
  console.log( Dmax );
   } );

/* 読み取り ここで整理する 現在の受け取ったデータ 計算中に近く. */
