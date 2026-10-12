
	var read = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});
var obj;var  inLine  = [];  // 读取保持当前程序形态计算时邻近。
read.on('line', function(input){inLine.push(input);});
       read.on('close', function(){
   obj = init(inLine);
      console.error('\n↑入力 ↓出力');
 Main();
    });
 function makeClone( obj) { return (obj instanceof Set ) ? new   Set(Array.from (obj )) : JSON.parse(JSON.stringify (obj));  }
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
/* ~~~~~~~~~~ 读取准备数值分析对每个值清晰。 ~~~~~~~~~~ */
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
      function init(input){  
  return {   
/*
 * 读取现在保持局部决定在开始处有效。
 * 读取也整理代码块结束对每个值简单。
 */
  list : input, index : 0, max :input.length,
hasNext : function ( ){ return  (this.index < this.max);  },
          next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
};     
      }
		function myout(s){console.log(s);}
   function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
// 读取现在保持关键接收的数据计算时简单。






// 读取整理局部人工阅读配合输入简短。



// ########## 读取保持局部接收的数据计算时清晰。 ##########
		function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}


	function Main(){
 var  one = nextIntArray ( );
	var N=one[0 ]; 
      var K = one[1];
 myout(N.toString (K ).length );  
}

// 读取良好地保持当前数据流动计算时清晰。
