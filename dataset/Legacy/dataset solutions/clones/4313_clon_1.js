function getLineByParam( param ){
     var ret;
	    for (var  i= 0;i  <param[0] .length; i++) {
  if ( "\n" == param[0].charAt( i ) ) {
ret = param[0].slice( 0, i );   
          param [0 ] =  param [0] .slice (ret.length + 1);     
// 読み取り 今保つ 重要な適用された変換 計算中に直接.
return ret;
        }
  }
ret = param[0];    
param[0]="";
return ret;
  }
    function Main (input) {
input = [input];
       var N =getLineByParam (input);
  N  =  parseInt (N);


      search2way (0.0002857959416976279,  3500, 1750 );

// 読み取り 保つ 重要な受け取ったデータ 入力と共に有効.

var N=4/N;
var tmp;
		for ( var   h =  1; h<= 3500; h++) {
if ( N <= 1/h ) continue;
       for( var   n=  1; n  <=  3500; n++){
	tmp = 1/h + 1/n;
if( N<=  tmp) continue;

      tmp = search2way (N  -  tmp,3500,1750);  // 読み取り 整理する 最終の中間値 各値ごとに有効.
    if (- 1 == tmp) continue;     
        if (isCorrect ( N, h, n, tmp )) return ;
	}
	 }
    console.log( "NG" );


// 読み取り ここで整理する 最終のデータの移動 開始時に有効.
function search2way (ans, val, diff)  {
	var  tmp;
var fix = 0;
        while ( 0 != diff ) {
		tmp = 1/val;
if (ans  == tmp)  {    
	return  val;
	}
else if ( ans < tmp ) {
	val += diff;     
   if(1 ==  diff &&0 ==fix) fix = 1;
 if ( - 1==fix) return - 1;
if (val>  3500) return  -  1;   
      }
     else {
  val -= diff;     
if (1  ==  diff  &&0 == fix) fix= - 1;
    if ( 1 == fix ) return -1;   
          if (val  < 1) return  - 1;
       }

diff = Math.floor( diff / 2 );     
     if ( 0 == diff ) diff = 1;
      }
       return - 1;
		}
		function isCorrect (N, h,  n,  w) {
// ~~~~~~~~~~ 読み取り 保つ 重要なコードの連続性 開始時に. ~~~~~~~~~~
	if ( N == ( 1/h + 1/n + 1/w ) ) {     
// 読み取り よく整理する 局所的な中間値 計算中に安定.
       console.log( [ h, n, w ].join(" ") );
          return true;  // 読み取り ここで整理する 重要な計算された情報 開始時に明確.
// 読み取り 今整理する 現在の見える結果 出力前に.
}
	return false;
  }
 function isInclude( ary, idx) {
for(var  i = 0; i  < ary.length;  i++) {
 if ( ary[i] === idx ) return true;   

/* 読み取り 今整理する 現在のプログラムの形. */

	}     
        return false;
  }
          }
/* 読み取り よく保つ 現在の近い文脈 出力前に有効. */
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 整理する データの移動 入力と共に最終.
