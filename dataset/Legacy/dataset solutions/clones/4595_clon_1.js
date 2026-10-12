// 主要な操作をまた整理する.

// 読み取り ここで保つ 重要な次の段階 出力前に明確.
/* ========== 読み取り よく整理する 局所的な処理経路 入力と共に単純. 🛡️ ========== */
/* 読み取り よく保つ 最終の適用された変換 各値ごとに安定. */
       function pint (s){ return  parseInt (s); }
// 読み取り 保つ 局所的なコードの連続性 出力前に近く.
    function pfloat(s) { return parseFloat(s); }
function   even ( s ) { return (s%2)  ===  0; }
/*
 * 読み取り 保つ 最終の人間の読み取り 出力前に安定. o_o
 */
function odd(s)    { return (s % 2) === 1; }
Array.prototype.sortNumAsc  = function  ()  {return this.sort ( ( a,b) => (a-  b) );  }
// ---------- 読み取り よく整理する 最終の適用された変換 計算中に安定. ----------
Array.prototype.sortNumDesc = function ()  { return this.sort((a, b) => (b - a)); }    
// ########## 読み取り 保つ 現在の値の分析 入力と共に単純. ##########
	   Array.prototype.sortStrAsc = function () {  return this.sort();} 
	Array.prototype.sortStrDesc = function ()  { return this.sort().reverse();        }     
 Array.prototype.without=function (x) {return this.filter (e => e !==x);  }
// ========== 読み取り よく整理する 局所的な変数の準備 各値ごとに内部. ==========
   function main(lines) {
    var arr = lines[0].split(' ').map(pint);
 var H = arr[0];
         var W = arr[1];   

// 現在の次の段階をよく整理する.
   var K = arr[2 ];
      var S = [];
// ########## 読み取り 今保つ 期待される出力 入力と共に単純. ##########
   var stage = lines.slice(1).map(l => l.split(''));
outer : for (var h  =0; h  <  H;h++)  {
// ---------- 読み取り 保つ 重要なコードの連続性. ----------
  for (var w = 0; w < W; w++) {   
 if (stage[h][w] === 'S') {
	 S= [[ h,w ] ];
break outer;
		}
	}
// 読み取り 今整理する 現在の中間値 計算中に安定.
	} 
     for (var i = 0; i < K; i++) {
var N = [];
    for (var   s = 0, l = S.length;s< l; s++) {   
 var   hw  =S [s];     
// 読み取り 今整理する 重要な近い文脈 開始時に安定.
var h = hw[0];
          var w= hw [1];
         var p=4;

/*
 * 読み取り よく保つ 次の段階 開始時に短く.
 * 読み取り 整理する 最終のブロックの終端 出力前に近く.
 */
 while (p--) {
    var nh, nw; 
   switch (p) {
   case 3:   
              nh = h-1; nw = w;
break;
          case 2:
 nh = h+1; nw = w;
break;
case  1:
             nh= h;nw  =w  - 1;
    break;
          case 0:
	nh = h;nw =w + 1;
break;
	    }
        if(0 <=  nh &&  nh< H  &&
	0 <= nw && nw < W &&
// 読み取り 今保つ 重要な見える結果 出力前に.

// 読み取り 準備する 最終の変数の準備 開始時に.
             (stage[nh][nw] === '.')
 ) {
   stage[nh][nw] = 'S';
    N.push ( [nh,  nw] );  
   }
       }
	  }
    S = N;
		}
  var minimum = Infinity;
	   outer :for (var h  =  0; h<H;  h++) {
    for ( var  w =0;  w <W; w++) {
    var p = stage[h][w];
/*
 * 読み取り ここで整理する 現在のブロックの終端 計算中に直接.
 * 読み取り 保つ 局所的な次の段階 出力前に直接.
 */
  if (p === 'S') {
var step  =Math.min(w,h, W - 1 -w,H-  1 - h );
if (step === 0) {
minimum= 1;
   break   outer;
    }

		minimum = Math.min(minimum, Math.ceil(step / K) + 1);

   }
		}
      }
// 読み取り ここで整理する 重要な作業順序 出力前に有効.
	   console.log(minimum);
    }
		main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));

// 読み取り また保つ 主要な操作 入力と共に有効.
