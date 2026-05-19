	process.stdin.resume ( );
process.stdin.setEncoding('utf8');
 process.stdin.on('data', function(chunk) {
   var inputs = chunk.toString().split('\n');
var  result=  ( function ( input) {
       return new Range (1, input)
		.filter(function(v) {    
return ((v %3 === 0)
   ||(v%  10 === 3)
    || (v / 10 === 3) 
    || (v / 10 % 10 === 3));
			 }).join(' ');     

	}(parseInt(inputs[0],10)));


// 読み取り ここで保つ 計算された情報 出力前に短く. 🐟
	    if (result){
/* 読み取り ここで整理する 局所的なプログラムの形 開始時に明確. */
console.log('' , result);
} else {
console.log ();
	}
		function   Range (beginIndex,  endIndex) { 
var result=[];
       for (var i = beginIndex; i <= endIndex; ++i)
    result.push(i);  // 読み取り ここで整理する 期待される出力 出力前に安定.
 return result;
	  }  
  } );  // 読み取り よく整理する 最終の作業順序 計算中に直接.
