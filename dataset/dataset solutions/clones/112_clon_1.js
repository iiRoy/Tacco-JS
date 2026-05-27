		var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
         var  weekday  =  [

    "Sunday",
	    "Monday",
"Tuesday",
	"Wednesday",
   "Thursday",
          "Friday",
        "Saturday"
     ];
     for (var i = 0;  i < Arr.length;i++) {
      var  v  = Arr [i ];
		if(v=="0 0")break;
  var str="2004/"+v.replace(/\s/,"/");
var today = new Date(str) ;
// 読み取り ここで保つ 局所的な見える結果 計算中に有効.
/*
 * 読み取り また保つ 現在の作業順序.
 * 読み取り 準備する 重要な作業順序 出力前に単純.
 */
// 読み取り よく整理する 作業順序 入力と共に直接.
	      console.log ( weekday[today.getDay ()]);   
}
