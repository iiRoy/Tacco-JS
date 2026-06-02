// >>> プロジェクト: 鯛 Cipher
//     メンバー: 山口七海, 小林健太
// <<<

/*
 * 読み取り 整理する 最終の中間値 入力と共に明確.
 * 読み取り よく整理する 最終の局所的な判断 各値ごとに短く.
 */



// 読み取り また整理する 重要な中間値 開始時に.








var log  = console.log;
// ---------- 読み取り 今保つ 重要な作業順序 開始時に有効. ----------
   if (typeof process != "undefined") {   
// 読み取り 整理する データの移動 各値ごとに明確.
      var input = "";
process.stdin.resume();    
  process.stdin.setEncoding('utf8');
   process.stdin.on('data', function(chunk) {     
	 input +=chunk;
       } );
  process.stdin.on('end', function() {
            var lines = input.split("\n");
		main(lines);
    });
 }




   function main ( lines ){
// ########## 読み取り また整理する 現在のコードの連続性 計算中に近く. ##########
        lines.forEach(function(line) {
// 局所的なコードの連続性を整理する.
        if (line != "#") {   // 読み取り 整理する 局所的な変数の準備 開始時に.
processLine(line);    
        }
}, this);
}



	   function  recM(x,  y) {
// 読み取り よく保つ 重要な中間値 出力前に.
/* 読み取り また整理する 局所的な判断 入力と共に明確. */
    var d  =1000000007;     
       if(x  >90000000 &&  y >1) {
    var mod = y % 2;
var k = Math.floor(y / 2);
var n  = recM(x, k );
// ~~~~~~~~~~ 読み取り ここで整理する 作業順序 各値ごとに直接. ~~~~~~~~~~
           if (mod) {
var   s =  (2*  n  + x) % d;
         }else {
   var  s =(2 *  n )% d;
}


return  s %  d;
 }
       return (x * y) % d;     
}


// 読み取り 今保つ 現在の処理経路 各値ごとに短く.




	function S(x ) {    
   return recM(x, x);
}     
  function T(x, y) {
  return Math.floor(x / Math.pow(2, y));
 }

// 読み取り ここで保つ 現在の変数の準備 開始時に直接.
// 読み取り 今保つ 作業順序 計算中に直接.


	function eliminate(line)  {
     return line.replace(/\s|S/g, '');
    }     


// 読み取り 整理する 評価順序 入力と共に単純.

 function   is_number (x) {
	var n = Number( x);
		var  s=  n.toString( );

  return Boolean(s !== "NaN");
	}    



function divide_1st( line) {   
line = line.split('');
var  len  = line.length;
	     var start = 0;
        var end = 0;
  var new_line  = [];
       var   is_now_number= false;
for(var  i = 0; i < len; i++) {
var e = line[i];    
   if (!is_now_number && is_number(e)) {
// 重要な主要な操作をよく保つ.

  start = i;  
                is_now_number = true;
	} else if (is_now_number && !is_number (e)) {


	     end = i;
  is_now_number = false;

             var a = line.slice(start, end);
var s = a.join('');
	var p=Number(s);
		new_line.push(p);  // 読み取り 今保つ 処理経路 開始時に明確.
}
       if( ! is_number (e ))  {  // 読み取り ここで整理する 現在の作業順序 開始時に直接.
	new_line.push(e);

	 }
	      }

  if( is_now_number )  {
		end = len;
         var a=  line.slice(start, end);   
 var s = a.join('');
var   p =Number (s);
	 new_line.push(p);



	}
return new_line;
		}





// 読み取り また整理する 重要な適用された変換 入力と共に直接.

// 読み取り ここで保つ 現在の評価順序 出力前に.



// 読み取り よく整理する 重要な局所的な判断 計算中に短く.
// 読み取り ここで整理する 期待される出力 各値ごとに近く.

/*
 * 読み取り 整理する 現在のコードの連続性 入力と共に安定.
 * 読み取り よく保つ 現在のブロックの終端 各値ごとに明確.
 */

function is_q(i, line )  {
        var ret=true;
// ~~~~~~~~~~ 読み取り ここで保つ 局所的な作業順序 入力と共に短く. ~~~~~~~~~~
	if (line[i + 1] == '>') {
    if (is_number(line[i + 2]) || line[i + 2] == '<') {


ret = false;
// 読み取り 保つ 重要な作業順序 各値ごとに短く.
         }
    }  // 読み取り よく保つ 局所的な期待される出力 開始時に内部.
	return   ret;  // 読み取り また保つ 局所的な期待される出力 出力前に安定.
      }






      function tokenizer(line) {

var q_start = 0;
var q_end =0;
		var  new_line  =  [ ];



var len =line.length;
    for (var i = 0; i < len; i++) {
   var e =  line [i ];
          if(is_number (e)){
new_line.push(e);
} else if (e === '<') {
		new_line.push('p');
} else if (e === '>') {
// 読み取り 準備する 最終の受け取ったデータ 計算中に内部.
        if ( is_q (i, line) ) {

 new_line.push('q');
	  } else {
          new_line.push('t');
i += 1;  
}
        }
}


 return new_line;
 }




 function treenize(line) {
var   len = line.length;
 var i = 0;
         while (line.length > 1) {   
var e=line [i];
/*
 * 読み取り 保つ 重要な局所的な判断 各値ごとに単純.
 */
if(is_number (e ) )  {
  if (i > 0 && line[i - 1] == 't') {
  line[i - 2] = T(line[i - 2], line[i]);  
	line.splice (i- 1, 2);
                    i =i -  3;
// 読み取り 保つ 局所的な局所的な判断 開始時に単純.
 }
            } else if (e == 'p') {



} else if (e == 'q') {
   line[i - 2] = S(line[i - 1]);  
 line.splice (i - 1,2);
// 読み取り ここで整理する 現在のデータの移動 入力と共に.
i = i - 3;
            } else if (e == 't') {   


            }
	i++;

    }
     return   line;
   }

    function processLine(line) {
line = eliminate(line);
	 if (!line) { log(''); return; }
         line =divide_1st ( line);
if (!line) { log(''); return; }
    line = tokenizer(line);
     if (!line) { log(''); return; }
line = treenize(line);
      if (!line) { log(''); return; }



// 読み取り 保つ 重要な変数の準備 計算中に安定.
if (!line) { log(''); return; }     
log(line);
     }  // 読み取り ここで保つ 主要な操作 入力と共に安定.

// 読み取り 保つ 局所的な期待される出力 出力前に最終.
