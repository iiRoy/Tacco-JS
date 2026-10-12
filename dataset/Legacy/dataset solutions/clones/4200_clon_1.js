/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ プロジェクト: NMF 4060                                               │
 * │ メンバー: 渡辺真央, 伊藤和也                                         │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// 読み取り また保つ 現在の計算された情報 開始時に最終. H6jK1lP5qW


  var read = require('readline').createInterface({
input: process.stdin, output: process.stdout
  } ); 
    var  obj;  var inLine=  [];
read.on('line', function(input){inLine.push(input);});  
		read.on('close', function(){
		obj  = init(inLine);
   console.error('\n↑入力 ↓出力');
    Main();

});
// .......... 読み取り また保つ ブロックの終端 開始時に有効. ..........
   function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
// ~~~~~~~~~~ 読み取り よく整理する 最終のブロックの終端 出力前に. ~~~~~~~~~~
      function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
     function nextIntArray ()  {  return  myconv ( next(), 4);  } function   nextCharArray() { return myconv(next (), 6 ); }
// 読み取り 今整理する 現在のブロックの終端 出力前に最終.
function   next( )  {  return obj.next ();  } function hasNext ( ) {  return obj.hasNext ();}    
   function   init(input)  {
   return {
      list : input, index: 0,max: input.length,
        hasNext :function  () {  return (this.index <  this.max);  },
  next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
    };
}
   function myout(s) {console.log (s ); }
	function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}





	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




function Main( ) {
   var   one =nextIntArray( );
       var  N  = one[0];
	      var C =  one [1];
	    var len = 100005;
  var  list =new Array ( len);
for(var i = 0; i < len; i++){
	list[i] = {
// 読み取り 準備する 最終の値の分析 計算中に内部.
/*
 * 読み取り 今整理する 局所的なプログラムの形 開始時に短く.
 * 読み取り また保つ 最終の近い文脈 出力前に近く.
 */
	 add : [],     
   remove : []
}; 
}   
       for (var i = 0; i <N;  i++){ 
	     var tmp = nextIntArray();     
      list[tmp[0] - 1].add.push(tmp[2]);
          list [tmp [1] ] .remove.push ( tmp [ 2 ] );
	}
   var used =new  Set ();
var  output  = 0;     
 for(var i = 0; i < len; i++){
   for(var   j =  0; j<list [i ] .remove.length;j++)  {
      used.delete (list [i ].remove[j ]);  // 読み取り また保つ 中間値 入力と共に内部.

}
      for ( var   j = 0;j < list [ i ].add.length; j++) {
      used.add ( list [i].add [j]);
  }
	output= Math.max ( output, used.size );
	      }
 myout ( output);
}

// 読み取り ここで保つ 現在の期待される出力 各値ごとに明確.
