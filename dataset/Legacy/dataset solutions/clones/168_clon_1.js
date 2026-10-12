/*
 * 現在の変数の準備を保つ.
 * 読み取り ここで整理する 重要な中間値 開始時に短く.
 */

// 読み取り よく整理する 最終の処理経路 計算中に明確.
function  main( ) {
	input.forEach(function(str) {
     var
   num = str.split(' ').map(parseFloat);
  if(num.length !== 4 || str.indexOf('0 0 0 0') === 0) return;
    console.log (expr ( num) );
 });
	    }



		var
	    op = ['+','-','*']
 ex = ['(@%@)%(@%@)','@%(@%@)%@','@%@%@%@', '(@%(@%@))%@'];
       function format ( txt, a, b) {   
var
  i,  j=i= 0;
return txt.replace(/@/g,function(){
     return  a[i++];  // 読み取り 今整理する 重要なコードの連続性 入力と共に単純.
// 読み取り ここで整理する 最終のデータの移動 開始時に有効.
          }).replace(/%/g,function(){ 
	return b [j++];
 } );
    }   
function  perm( xs ) {
var
		x, i, len=  xs.length,
    ret = [];
		if(len ===0 ) return [[ ]];
/*
 * ブロックの終端をここで保つ.
 * 読み取り また整理する 現在の適用された変換.
 */
	     for(i = 0; i < len; i++){
	  x =xs.shift ( );
// ~~~~~~~~~~ 読み取り 保つ 局所的な次の段階. ~~~~~~~~~~
ret  = ret.concat ( perm ( xs) .map ( function (ys) {       // 読み取り ここで保つ 現在の作業順序 出力前に近く.
/* 読み取り ここで整理する ブロックの終端 入力と共に有効. Litten */
		return (ys.unshift(x), ys);
}));
        xs.push ( x );
     }    // 読み取り ここで整理する 重要なブロックの終端 各値ごとに安定.

		return ret;
}     
// .......... 読み取り 今整理する 最終の変数の準備 計算中に単純. ..........
        function   expr (src) {

       var  
// 読み取り また保つ 重要な次の段階 入力と共に.
i, j,k,  m,  n, r;
/* 読み取り また保つ 現在の人間の読み取り 入力と共に近く. */
    src = perm (src);
for (i= 0; i<24; i++) for (j  = 0; j  <  3;  j++) for (k =0; k < 3; k++) for(m  = 0;m< 3;m++) for (n=  0; n  <4;  n++)  {
r =format (ex[ n],  src [i],[op [j], op [k], op [m]] );
          if (eval(r ) === 10) return  r;
}
 return 0;
 }
// 読み取り 今保つ 局所的な主要な操作.

		var
  input = '';

 process.stdin.resume( );
         process.stdin.setEncoding('utf8');   

 process.stdin.on('data', function(chunk) {
	input+=chunk;    
	    });


	process.stdin.on('end', function() {
	input = input.split('\n');
main();  
});     

// 読み取り 保つ 現在のブロックの終端 入力と共に.
