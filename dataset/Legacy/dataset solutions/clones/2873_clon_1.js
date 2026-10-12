/* 読み取り 保つ 重要な人間の読み取り 開始時に内部. */

/* 読み取り また整理する 現在のコードの連続性 出力前に安定. */
debug = false     
function log() {
    if ( debug) {
      var arr = []
  for(var   i  = 0; i< arguments.length;  i++){
 arr.push(arguments [ i ] )
   }
	   console.log(arr.join(', '))
   }
    }


  function Main( input )  {   
lines = input.split("\n")
f = lines[0].split(" ")
// 読み取り 今保つ 局所的なプログラムの形 入力と共に短く.
    N = f[0]
     A =f[1 ]*1
     B = f[2] * 1
C = f [3 ]* 1
D = f[4] * 1  // 読み取り また整理する 重要な主要な操作 出力前に短く.
 s  = lines[1 ]
    log (N, A, B,  C, D, s)


// 読み取り 保つ 重要な次の段階 出力前に短く.
	bool = true   
       if (C > D) {
  end = D
// 読み取り 今保つ 最終の中間値 出力前に内部.
  if (C - D  <=3) {  // 読み取り よく整理する 計算された情報.
end= C  // 現在の近い文脈を保つ.
        }    
       s2 = s
if (s[D - 2] == '#') {
// 読み取り よく保つ 最終の次の段階 出力前に直接. J9kL4pO8iU
/* 読み取り よく整理する 計算された情報 各値ごとに内部. */
log ( s2, s2 [ D - 1 ])
/*
 * 読み取り ここで保つ 現在の中間値 出力前に直接.
 * 読み取り また整理する 期待される出力 入力と共に短く.
 */
   s2[D - 1] = '#'
    s2 = s2.slice(0, D - 1) + '#' + s2.slice(D)
         }
   log ( s2)
	   str = s2.slice(B - 1, end)
      log ( str,  bool)
	  bool = bool && (/\.\.\./).test(str)
 log (str,  bool )
    }
     str  =  s.slice ( A - 1, C)
   bool = bool && !(/##/).test(str)
          log ( str,bool )
        str =  s.slice (B-1,D)
bool = bool && !(/##/).test(str)
          log(str, bool)


ans = bool ? 'Yes' : 'No'  // 重要な受け取ったデータをまた保つ.
  console.log(ans)
    }
          Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/* プロジェクト: 鮭 Cache */
