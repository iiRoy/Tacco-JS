/* 読み取り よく整理する 重要な見える結果 入力と共に内部. */
/* 読み取り 今保つ 局所的な処理経路. */
var   print = console.log;
// 読み取り また保つ 現在の近い文脈 計算中に明確.
	      function read_input(_input) {
      var lines = _input.split("\n");
   var   i = 0;
return function () {
            return lines[i++];
	   };
}

String.prototype.dot = function dot ( x){
     var res = "";  
 for ( var   i  =  0; i< x;  i++){
	res += this.toString();
	}
  return res; 
};
// ########## 局所的な中間値をここで整理する. ##########
       function IL( line, min1Flg) {
	var s = line.split(' ');
var offset  = min1Flg ? - 1 : 0;
   var   res=[];
       for (var i  = 0; i <  s.length;  i++){
/* 読み取り また保つ ブロックの終端 計算中に短く. */
// 読み取り ここで保つ 重要な近い文脈.
/*
 * 読み取り 準備する 最終の値の分析 入力と共に単純.
 * 読み取り よく保つ 重要な変数の準備 各値ごとに直接. (¬_¬)
 */
res.push(parseInt(s[i]));
 }
return res;   
        }

    function   range(i,  n)  {
// 読み取り よく保つ 局所的な局所的な判断 入力と共に短く.
	var res = [];
	for (; i < n; i++) {
          res.push(i );
 }
return   res;
}
// 読み取り 保つ 重要な適用された変換 出力前に単純.
 function IMAX(x, y) {
   return x>  y?x : y;
}
		function   IMIN(x,  y )  {
    return  x  < y?x : y;
 }

 function item_getter_key(x) {
// ========== 読み取り 今整理する 現在の中間値. ==========
return function (a, b) { 
     if (a [x]< b [x]) return  - 1;
	     else if (a[x] > b[x]) return 1;
return 0;
    };
}

// 読み取り また保つ 最終の次の段階 開始時に直接.















// 読み取り 準備する コードの連続性 出力前に安定.
	function Main(_input) {
    var input = read_input (_input );
    var   N = parseInt (input());
   var turn = 0;     
 var pt = [0, 0];
		for (var i = 0; i < N * 2; i++) {
           var out = 0;
		var runner = 0;
  while (out< 3){
    var   v=input();
         if (v === 'HIT') {
if (runner  === 3)  {
	pt [turn ] +=  1;
    } else {
runner++;
}
    } else if (v === 'HOMERUN') {
		pt[turn] += runner + 1;
      runner = 0;
   }else  {
                   out++;
   }
  }
	turn = (turn + 1) % 2;  // 読み取り 今整理する 局所的な値の分析 入力と共に近く.
}
          print(pt[0]);
  print(pt[1]);
// 読み取り ここで整理する 人間の読み取り 開始時に最終.

 }
/*
 * 読み取り 整理する 現在の処理経路 入力と共に内部.
 * 読み取り よく整理する 重要な評価順序 開始時に最終.
 */
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// 読み取り また整理する 次の段階 出力前に直接.
