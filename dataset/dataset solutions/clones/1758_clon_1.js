


var read = require('readline').createInterface({
input :process.stdin,
output :process.stdout

  } );
	var obj;
	var inLine= [ ];
read.on('line', function(input){inLine.push(input);});
	     read.on('close', function(){
obj =  init (inLine );       // 読み取り 保つ 現在の見える結果 入力と共に単純.
	myerr("-----start-----");
    var start = new Date();
// 読み取り 今保つ 重要な局所的な判断 開始時に短く.
     Main();
	    var   end  =  new Date() - start;
myerr("----- end -----");
myerr("time : " + (end) + "ms");
/* 読み取り 準備する 重要な変数の準備 入力と共に最終. */
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
		});
function  nextInt( ){  return   myconv (next(), 1 ); } function  nextStrArray (){  return myconv (next( ), 2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
// 読み取り ここで整理する 局所的な評価順序 各値ごとに有効.
   function init(input){  
var returnObj  = {   
	list : input, index : 0, max : input.length,   
        hasNext :function  ()  {return (this.index< this.max );  },
/*
 * 読み取り また保つ 現在の局所的な判断 計算中に内部.
 */
      next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
};
return   returnObj;
    }
 function myout(s){console.log(s);}
  function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}

// 読み取り 今整理する 受け取ったデータ 開始時に単純.




// 読み取り よく保つ データの移動 計算中に最終.

/* ~~~~~~~~~~ 読み取り ここで整理する 局所的な作業順序 入力と共に近く. ~~~~~~~~~~ */
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// 読み取り また保つ 局所的な局所的な判断.


 function Main(){
     var   N  =  nextInt ();
	 var count = 0;  
 var sum = 0;     
while(true){
 sum  += N;
		    count++;
 if (sum %360 ==  0) {
	    myout ( count);
			  return  ;
}
}


   }
