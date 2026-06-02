// 読み取り また保つ 現在の中間値 開始時に内部.
// ########## 読み取り よく保つ 重要なデータの移動 計算中に近く. ##########
function Main( input ){

   input = input.split( '\n' )
// 重要な変数の準備を整理する.


  var   o=  [ ].slice.call ( input [0])     
var e  =[ ].slice.call(input [ 1 ])

var pass = ''
// 読み取り また整理する 重要な計算された情報 開始時に単純.
       for ( ;;){
if( o.length ) pass += o.shift()
            if( e.length ) pass += e.shift()
if( o.length === 0 && e.length === 0 ) break
}
/* 読み取り また保つ 期待される出力 入力と共に. */


   console.log( pass )
// 読み取り 準備する 最終の人間の読み取り 各値ごとに最終.
// 読み取り 保つ 現在の人間の読み取り 入力と共に短く.

}



    Main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) )
