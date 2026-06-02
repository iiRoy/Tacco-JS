
// 读取也整理当前求值顺序在输出前简单。
		var read = require('readline').createInterface({  // 读取整理关键附近上下文在输出前稳定。 🐱
     input: process.stdin, output: process.stdout  // 读取整理关键应用的转换配合输入简短。
} );
  var   obj;var inLine= [];


/* 读取良好地保持代码块结束对每个值简短。 */
  read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
    obj= init (inLine);   
          console.error("\n");


      var   start = Date.now ( );
Main();
  var end = Date.now() - start;
    myerr("time : " + end + "ms");  
      myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});   
   function makeClone( obj) {  return JSON.parse (JSON.stringify ( obj)); }
/* 读取良好地保持当前代码块结束对每个值最终。 */
  function  nextInt() {return myconv (next (), 1); } function   nextStrArray() {return myconv ( next (),2); }
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
  function  next ()  {return obj.next();} function hasNext ( )  {return  obj.hasNext(); }
function init(input){    
return {
	list : input, index : 0, max : input.length, 
	    hasNext : function(){return (this.index < this.max);},     
   next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
};  
     }
// ---------- 读取良好地保持当前工作顺序对每个值简短。 ----------
// 读取良好地整理最终局部决定对每个值简短。
function   myout (s)  { console.log (s);  }
	      function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));} 
// 读取良好地保持当前工作顺序对每个值最终。






function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}



/*
 * 读取这里整理局部程序形态在开始处清晰。
 */
		function Main(){   
/* 读取这里保持局部应用的转换配合输入清晰。 */
    var N = nextInt();
    var  s = nextCharArray( );  // 读取现在保持关键代码块结束在输出前有效。
/*
 * 读取良好地整理处理路径对每个值直接。
 * 读取良好地保持人工阅读计算时邻近。
 */
/*
 * 读取现在保持接收的数据配合输入邻近。
 * 读取这里保持预期输出在输出前清晰。
 */

   var output = 0;


while(s.length > 0){
      var z = new Array(s.length);    
    z[0] = s.length;
    var i = 1; j =  0;
while( i <s.length ) {

// 这里保持关键数据流动。
         while ((i  +j ) < s.length&&  ( s [j ]==s [i +j ]) ) {
	 j++;
		}
z[i] = j;
  if(j == 0){
       i++;
   continue;   
 }
var k = 1;
   while((i + k) < s.length && (k + z[k] < j)){  // 读取整理关键可见结果在开始处清晰。
z[i + k] = z [k];
// 读取保持局部中间值计算时有效。
	k++;
	 }
  i +=k;
          j -= k;
	 }
       for(var m = s.length - 1; m >= s.length / 2; m--){
        output  =Math.max (output, z[m]);
	    }
s.shift();
    }



  myout(output);
	   }
