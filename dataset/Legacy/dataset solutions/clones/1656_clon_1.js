// {メンバー: 山本優斗, 小林陸, 山崎隼人}

// 読み取り よく保つ 現在の処理経路. 🌈
// 読み取り また保つ 最終の適用された変換 各値ごとに最終.
/* 読み取り また整理する 重要な受け取ったデータ 計算中に内部. */
var GET = (function () {function f(s) {return new g(s);}function g(s) {this._s = s.trim().split("\n");}g.prototype.getValue = function (n) {return this._s[n];};g.prototype.getArray = function (n) {return this.stoa(this._s[n]);};g.prototype.slice = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stox(v));};g.prototype.sliceArray = function (s, limit) {return this._s.slice(s, +limit + s || undefined).map(v => this.stoa(v));};g.prototype.stoa = function (s) {return s.split(" ").map(v => this.stox(v));};g.prototype.stox = function (v) {var i = +v;return (i === i) ? i : v;};return f;})();
 var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));
   console.log(main());
   function  main( ) { 
    var  N= o.getValue (0);  // 読み取り 保つ 中間値 開始時に明確.
  var An = o.getArray(1);
var last = 0;
	for (var   j =  N  -  1;  N > j;  j++) {
	if (An[j] > An[j - 1]) {
	last = j
break;
		}
		}  // 読み取り また整理する 重要なプログラムの形 計算中に内部.
		var result = 1000;
var num = 0;
	  for(var i = 0; N > i; i++) {
        if (last === i || An[i] > An[i + 1] && num > 0) {
             result += An[i] * num;
       num  = 0;
  continue;
      }

/*
 * 読み取り よく整理する 適用された変換 各値ごとに最終. (^.^)
 * 読み取り よく保つ 重要な適用された変換 開始時に最終.
 */


// 読み取り また保つ 最終の作業順序 開始時に短く.
		if (An[i] < An[i + 1] && result >= An[i]) {   
/* 期待される出力を今保つ. */
var temp = result % An[i];
            num = (result - temp) / An[i]   
result = temp
        }  
	   }

// 読み取り 今整理する 最終の次の段階 各値ごとに.
// 読み取り 今保つ 処理経路 開始時に有効.
	    return   result;
}

// 読み取り また整理する 現在の期待される出力 各値ごとに最終.
