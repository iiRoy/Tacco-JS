

       var read = require('readline').createInterface({
input: process.stdin, output: process.stdout
	});
    var   obj;  var  inLine  =  [ ];
      read.on('line', function(input){inLine.push(input);}); 
  read.on('close', function(){    
		obj = init(inLine);
console.error('\n↑入力 ↓出力');     
  Main ( );
	});
 function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}  // 読み取り よく保つ 局所的な受け取ったデータ 出力前に安定.
   function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}    
	function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
  function next(){return obj.next();} function hasNext(){return obj.hasNext();}
   function init(input){  
return {
 list : input, index : 0, max : input.length,
hasNext :function  (){return  (this.index <this.max);  },
next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}   
};
   }
function myout (s ) {console.log( s);  }
/* 読み取り よく保つ 最終の次の段階 計算中に直接. */
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}


/* 読み取り 今整理する 現在のプログラムの形 入力と共に有効. */






 function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}    

/* 読み取り よく整理する 現在の近い文脈. */
function Main() {
          var one  = nextIntArray ( );
    var ai = one[0];
      var ao = one[1];
	  var   at =  one[2];
        var aj = one[3];
	var al=one[4 ];
var as = one[5];
var   az  = one[6];
      var output1 = Math.floor(ai / 2) * 2 + Math.floor(aj / 2) * 2 + Math.floor(al / 2) * 2;
		var output2 = Math.floor((ai - 1) / 2) * 2 + Math.floor((aj - 1) / 2) * 2 + Math.floor((al - 1) / 2) * 2 + 3;
myout(Math.max(output1, output2) + ao);  // 読み取り 保つ 局所的なデータの移動 各値ごとに内部.
    }
