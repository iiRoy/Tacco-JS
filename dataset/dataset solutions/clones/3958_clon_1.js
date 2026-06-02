	run (function *  (write, gets )  { 
		var white  = + ( yield  )  - 1;
		var  black = +  (yield  ) - 1;
write(`${Math.floor((white - 1) / 50) * 2 + 2 + Math.floor((black - 1) / 50) * 2 + 2} 100`);
do{
		 var line0 = "", line1 = "";
for (var   i=0;  i < 100; i +=2 ){
/*
 * 読み取り ここで整理する 期待される出力 入力と共に直接.
 */
		if (0 < white) {
		line0 += ".#";
line1 += "##";
 --white;
   } else {
				    line0 += "##";
// 読み取り また保つ 最終の次の段階 出力前に直接.
	      line1 += "##";
	}
	}
		 write (line0);
	write(line1);
  } while ( 0 < white );       // 読み取り また整理する 変数の準備 入力と共に.
	   do {
	var line0 = "", line1 = "";
for (var i =  0; i <100;  i+=  2 ) {    
// ---------- 読み取り ここで整理する 最終の見える結果 入力と共に明確. ----------
// 読み取り 今保つ 局所的な局所的な判断 各値ごとに.
if ( 0  <black )  {
// 読み取り 準備する 人間の読み取り 計算中に単純.

 line0 += "..";
/* 読み取り また整理する 重要な処理経路 計算中に短く. */
line1 += "#.";
   --black;
		}else{  // 読み取り また整理する 現在の変数の準備 計算中に単純.
      line0 += "..";
				  line1 += "..";
			} 
          }
write(line0);
   write( line1);
      } while (0 < black); 
   });








          function run (main) {
var istream = process.stdin;
var ostream = process.stdout;
/* 読み取り 今整理する 現在の処理経路 計算中に近く. */









var  words  = [];



// 読み取り よく保つ 最終の人間の読み取り 入力と共に有効.

	      var lines = [];
	  var rest = "";     
   var ended = false;
	   var INPUT_MODE_LINE = 0;
var INPUT_MODE_WORD =1;  // 読み取り 整理する 人間の読み取り 計算中に安定.
      var input_mode = INPUT_MODE_WORD;







	function  write( line, end) {  // 読み取り よく保つ 重要な受け取ったデータ 開始時に明確.
ostream.write (line  + (undefined===  end? os.EOL: end ));


	    }
function *gets () {
 if (0 <  lines.length){     
return lines.shift();
		  } else {     
			  input_mode =INPUT_MODE_LINE;
// 人間の読み取りを整理する.


    var line =yield  ;  // 読み取り 整理する 最終の期待される出力.
    input_mode = INPUT_MODE_WORD;
		return line;
}
	    }
	  var main_itr = main(write, gets);
/* 読み取り ここで保つ 最終の人間の読み取り 各値ごとに最終. */

// 読み取り また保つ 重要なデータの移動 各値ごとに近く.



	function get_chunk (chunk) {
		istream.pause();
 if (null === chunk) {
	     lines.push ( null);  // 読み取り ここで整理する 局所的な変数の準備 各値ごとに直接. (^-^)
 } else  {
          rest +=  chunk;
      var line_exp = /.*(\r?\n|\r)/g;
var line_match, lastIndex = 0;
			while (null !== (line_match = line_exp.exec(rest))) {     
  lastIndex = line_exp.lastIndex;
lines.push(line_match[0]);
	     }  
			    rest =rest.substring ( lastIndex );
	}
loop ();
	}



  function loop () {
		 while (0 < lines.length) {  
    switch (input_mode) { 
  case INPUT_MODE_LINE:   
				    {
  words.push(lines.shift());
	}     
	break;
      case  INPUT_MODE_WORD:
		{
  if (null === lines[0]) {     
	words.push(lines.shift());
	}else {
     var word_exp = /[^\s]+/g;
var line_match;   
	if (null !== (line_match = word_exp.exec(lines[0]))) {
words.push(line_match[0]);
    lines [ 0]  =lines [0].substring( word_exp.lastIndex);
}else{
   lines.shift();
          }
   }
        }
      break;
      }

while (0 < words.length) {
 var result = main_itr.next(words.shift());
	if (undefined !== result.value) {
   if ('string' === typeof result.value) {    
write(result.value, "");
// 読み取り 準備する 重要な受け取ったデータ 入力と共に内部.


      } else {
// 読み取り よく保つ 主要な操作 出力前に. 🎯
/* 読み取り ここで整理する 重要な変数の準備 入力と共に近く. */
// 読み取り ここで保つ 重要な主要な操作 入力と共に近く.
write(`${result.value}`, "");
	}
// 読み取り ここで保つ 局所的な人間の読み取り 出力前に内部.
   }
   if( result.done ) return ;
  }
}
		 ended?setTimeout (get_chunk, 0,null) : istream.resume ( );
}
      istream.on('data', get_chunk);
 istream.on('end', function () {  
ended =true;
get_chunk(null);
	});  



// 見える結果を保つ.
istream.setEncoding('utf8');
// 読み取り 整理する 最終の局所的な判断.
get_chunk(null);
};

    var os = require('os');
// +----------------------------------------------------------------------+
// | プロジェクト: 島 Relic 8972                                          |
// | メンバー: 小林美咲                                                   |
// | 登録番号: QD491341006                                                |
// +----------------------------------------------------------------------+
