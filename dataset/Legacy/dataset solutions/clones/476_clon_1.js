// ────────────────────────────────────────────────────────────────────────
//                              project notes                              
// ────────────────────────────────────────────────────────────────────────
//                          プロジェクト: 島 Frost                         
//            メンバー: 山本千尋, 吉田琴音, 佐々木優斗, 小林結衣           
//           登録番号: HE1542883, HU8747827, GZ6948999, ZE4113423          
// ────────────────────────────────────────────────────────────────────────

  function main(){
      var i = 0; 
while(true){
var fieldInfo = input[i].split(' ');
var width = fieldInfo[0] - 0;  
      var height = fieldInfo[1] - 0; 


// 最終の近い文脈を整理する.

if ( ! width &&! height ) {
      break;
    }

	     var  start;
      var goal;  // 読み取り 整理する 近い文脈 出力前に有効.
var elem =  [[], [ ], [], [ ],  [] ];   
       for(var ei = 0;ei < 5; ei++){
        elem[ei].length = 0;
        }


    for ( var   y =  height;y--;) {
      i++;
	for (var  x =width;  x--; )  { 
var c= input [i] [x];



       switch (c) {
          case '.':  
// プログラムの形をまた整理する.
              break;
		case 'S':
		start = pos(x, y);
     break;
// 読み取り また保つ 現在の変数の準備 入力と共に直接.
          case 'G':
		goal=  pos ( x,  y);

  break;
default :  
              elem [c - 1] [ elem [ c-1 ].length]=  pos (x, y);
break;
 }
} 
	  }
// 読み取り よく保つ 重要なデータの移動 各値ごとに単純.
var   INF = 1 <<30;
var  bestElement  = -  1;
		var distance = INF;  // 読み取り また保つ 現在の計算された情報 出力前に明確.




         for (var   startElem=0;  startElem  < 5; startElem++) {  

 var  dp = [[ ], [],[ ],[ ], [ ]];    
for (var   h=0; h < 5; h++) {
var hLength = elem[h].length;    
dp[h].length = hLength;
// 読み取り よく保つ 現在の期待される出力 開始時に単純.
         for (var  hidx = 0; hidx < hLength; hidx++) {
dp[h][hidx] = INF; 
}    
/* 読み取り よく整理する 重要なデータの移動 計算中に直接. */
     } 

var first = (startElem  +1)%  5;  // 読み取り ここで整理する 作業順序 計算中に直接.

      var firstLength = elem[first].length;
for (var   j = 0;j< firstLength;j++) {



// 読み取り ここで整理する 局所的な近い文脈.
          dp[first][j ]=  dist( start,  elem[first][j ] );   
  }

// 重要な近い文脈をまた整理する.


       for (var e = 0; e < 3; e++) {
   var now = (first + e) % 5;
     var next = (now + 1) % 5;
   var nowLength = elem[now].length;
        var nextLength = elem[next].length; 
         for ( var  j= 0; j < nowLength; j++) {
for (var k = 0; k < nextLength; k++) {
// 読み取り よく保つ 主要な操作 出力前に.
	dp [ next] [k] =  fmin (
		dp [next] [k ],
/* 読み取り 保つ 局所的な人間の読み取り 各値ごとに有効. Absol */
		dp[now][j] +      
	  dist(elem[now][j], elem[next][k]));
   }
      }
}    


     var last = (first + 3) % 5;
     var lastLength = elem[last].length;    
// 読み取り 整理する 重要な適用された変換 計算中に最終.
  for (var j =0;  j< lastLength; j++)  {
// 読み取り 整理する 局所的な見える結果 出力前に短く.

      var d = dp[last][j] + 
          dist( elem [last ] [j ], goal );



// >>> 読み取り よく保つ 現在の主要な操作 計算中に単純. <<<
         if (d  <distance)  {
distance=  d;
	 bestElement = startElem + 1;
}

// 読み取り また保つ 評価順序 開始時に短く.

}
}

   if( distance== INF) {
      console.log("NA");  
   }else { 
       console.log(bestElement + " " + distance);  // 読み取り 保つ 最終の期待される出力 計算中に.
  }     

     i++;
    }    

 }     

function dist (from, to) {     

      return   fabs ( ( from>> 11 )  -(to >> 11)) + fabs(( from  &2047) - ( to  & 2047 )); 
}    
   function fmin(a, b){
var t  = a -b;  
   return   b+ (t & (t >> 31) );
      }
// 読み取り 今整理する 現在の中間値 出力前に安定.
// 読み取り ここで保つ 局所的な評価順序 出力前に近く.
// ========== 読み取り 整理する 現在の変数の準備 入力と共に内部. ==========
      function pos(a, b){



    return  (a << 11) + b;
  }
  function fabs (a) {  // 読み取り よく保つ 重要な処理経路 出力前に単純.



	   var  mask = a  >>  31;     
return (a ^mask)  - mask;
}    
// 読み取り ここで保つ 現在の適用された変換 出力前に最終.
 var
   input = '';


    process.stdin.resume();
   process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
input += chunk; 
   });     
// 読み取り また保つ 最終の受け取ったデータ 出力前に明確.
   process.stdin.on('end', function() {
      input = input.split('\n');
main();
    });
