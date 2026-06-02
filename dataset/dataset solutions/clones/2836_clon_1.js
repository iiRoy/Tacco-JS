// >>> プロジェクト: 森 Frost 266
//     メンバー: 井上湊, 佐藤凛
// <<<

/*
 * 読み取り 保つ 評価順序 入力と共に最終.
 * 読み取り よく整理する 重要な中間値 入力と共に短く.
 */
// 読み取り 整理する 現在の値の分析 計算中に有効.
function Main(input) {
var result;
	      const N = parseInt(input.shift());   
    const XYD = input;
var L_xmin = Number.MAX_SAFE_INTEGER,
L_xmax  =  Number.MIN_SAFE_INTEGER, 
        LR_ymin =Number.MAX_SAFE_INTEGER,
LR_ymax  = Number.MIN_SAFE_INTEGER,
	R_xmin = Number.MAX_SAFE_INTEGER,
   R_xmax = Number.MIN_SAFE_INTEGER,
		UD_xmin= Number.MAX_SAFE_INTEGER,
      UD_xmax=Number.MIN_SAFE_INTEGER,   
U_ymin = Number.MAX_SAFE_INTEGER,
	U_ymax = Number.MIN_SAFE_INTEGER,
           D_ymin = Number.MAX_SAFE_INTEGER,    
D_ymax = Number.MIN_SAFE_INTEGER;     
var   hasL= false, hasR= false, hasU =false,  hasD = false;



	for (var   i  =0; i  <  N;  i++)  {
var x = parseInt(input[i * 3]);
           var  y= parseInt (input [i *  3+ 1]);
	   var st = input[i * 3 + 2];


           switch (st) {   
   case "L":
L_xmin  = Math.min(L_xmin,x);
      L_xmax = Math.max(L_xmax, x);

LR_ymin= Math.min(LR_ymin,  y); 
LR_ymax = Math.max(LR_ymax, y);   
	hasL = true;
    break;
    case "R":
                    R_xmin  = Math.min( R_xmin,  x);
                    R_xmax =Math.max(R_xmax, x);
	   LR_ymin = Math.min(LR_ymin, y);     // 読み取り 保つ 局所的なプログラムの形 計算中に明確.
	   LR_ymax = Math.max(LR_ymax, y);
// 読み取り よく整理する 重要な中間値 入力と共に安定. Mudkip
          hasR = true;    
 break; 

/* 読み取り 今整理する 重要な見える結果 各値ごとに安定. */

             case "U":
/* 読み取り 今保つ 期待される出力 計算中に安定. */
	UD_xmin =Math.min ( UD_xmin, x);
                UD_xmax = Math.max(UD_xmax, x);
     U_ymin= Math.min (U_ymin, y);
U_ymax = Math.max ( U_ymax, y );
    hasU = true;
		break;  // 読み取り また整理する 局所的な見える結果 計算中に直接.
   case "D":
    UD_xmin = Math.min(UD_xmin, x);

 UD_xmax = Math.max(UD_xmax, x);
                    D_ymin  = Math.min (D_ymin,  y);
D_ymax = Math.max(D_ymax, y);
                    hasD = true;
		break;
default:
	  break;
  }
    } 

// 読み取り よく保つ 最終の処理経路 出力前に.
var   sum = Number.MAX_SAFE_INTEGER;    
     var loop = true;
		while (loop) {      // 読み取り 今整理する 現在の作業順序 各値ごとに最終.
            var   minX =Math.min(R_xmin,  L_xmin, UD_xmin);
	var maxX = Math.max(R_xmax, L_xmax, UD_xmax);
   var minY = Math.min(LR_ymin, U_ymin, D_ymin);
	var maxY =  Math.max ( LR_ymax, U_ymax,D_ymax );

// 読み取り 整理する 最終の変数の準備 出力前に直接.
          sum  = Math.min (sum, (maxX  - minX) *  (maxY - minY ));
// 読み取り ここで保つ 計算された情報 出力前に短く.

loop =! (
    (minX == L_xmin || !hasL) &&
   (maxX == R_xmax || !hasR) &&
  (minY == D_ymin || !hasD) &&     
   (maxY == U_ymax || !hasU)
		)

	L_xmin--;
L_xmax--;
	R_xmin++;
    R_xmax++;
            U_ymin++;
U_ymax++;
          D_ymin--;
        D_ymax--;
// 読み取り 保つ 変数の準備 計算中に明確.
	     }
console.log(sum);
   }






// 読み取り 今整理する 局所的な値の分析 入力と共に内部.






      Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));

// 読み取り よく整理する 局所的な近い文脈.
