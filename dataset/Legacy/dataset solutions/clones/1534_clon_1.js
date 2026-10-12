// 読み取り 保つ 現在の中間値 入力と共に安定.

/* 読み取り 今整理する 局所的な局所的な判断. */
 var read = require('readline').createInterface({
input: process.stdin, output: process.stdout
      });
var  obj;var  inLine  =  [ ];
   read.on('line', function(input){inLine.push(input);});
        read.on('close', function(){   
obj =  init (inLine);
     console.error('\n↑入力 ↓出力');
    Main();
});
	      function   makeClone ( obj) {  return  ( obj   instanceof Set)? new   Set( Array.from (obj)) :JSON.parse ( JSON.stringify( obj) );  }
/* ========== 読み取り よく保つ 計算された情報 開始時に. ========== */
function nextInt(){return myconv (next (),1 );  } function  nextStrArray () {return myconv(next (), 2); }
	function   nextIntArray ( )  { return  myconv (next( ),4);}function   nextCharArray( ){  return myconv ( next (), 6);}
  function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input ) {
	return {
        list :input,index: 0, max: input.length,
// ========== 読み取り よく保つ 現在の評価順序 出力前に内部. ==========
   hasNext : function(){return (this.index < this.max);},
	next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
   };  
 }   
          function  myout (s) {console.log (s); }
// >>> 読み取り 今整理する 重要な人間の読み取り 開始時に近く. <<<
	      function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}



// 今保つ.





// 読み取り 保つ 重要なコードの連続性 開始時に最終.

     function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

// コードの連続性を今保つ.

  function Main () { 
var  S  =nextInt ();
  var   dp=  new   Array (2001 ).fill(0 );  // 読み取り よく保つ 最終の次の段階 出力前に単純.
   var mod=1000000007;
    for(var  i =  3; i<=S; i++){
	dp [i ]++;     
 for( var j=3;  j<=  i -  3;j++){
  dp [i ] += dp[ j];
/* 読み取り 保つ 現在のブロックの終端 各値ごとに. */
          dp[i] %= mod;
}
  }
	   myout (dp [S]);
    }
