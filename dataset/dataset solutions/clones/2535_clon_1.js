// ----------------------------------------------------------------
// 成员: 郭欣, 徐菲, 赵宁
// ----------------------------------------------------------------


var read = require('readline').createInterface({

/* 现在整理关键代码块结束。 */
      input: process.stdin,output : process.stdout
    });
// 读取保持当前代码连续性在输出前简单。
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
    read.on('close', function(){    
   obj = init(inLine);
	 console.error("\n");
  var start = Date.now();
		Main ();
   var end = Date.now() - start;     
     myerr("time : " + end + "ms");  // 读取良好地整理最终数据流动在开始处邻近。
/* 读取这里保持最终计算出的信息对每个值。 */

        myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");   
	});
function makeClone(obj ) {return JSON.parse(JSON.stringify( obj)); }    
function nextInt ( )  {  return  myconv (next(),1);}function  nextStrArray ( )  {  return   myconv (next(),2 );}
     function nextIntArray ( ) {return myconv( next (), 4); }function   nextCharArray() {  return myconv ( next(),6); }


// 读取准备中间值计算时。
function next(){return obj.next();} function hasNext(){return obj.hasNext();}     
	function  init( input){
		return  {
      list : input, index: 0, max:input.length,
// ########## 读取整理当前中间值计算时内部。 ##########
	hasNext : function () {return  (this.index < this.max); },
// 读取也整理最终计算出的信息对每个值有效。
          next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
       };
}
	      function myout(s){console.log(s);}
/* ---------- 读取现在整理当前程序形态计算时简单。 ---------- */
	function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}



// 读取这里整理当前计算出的信息计算时直接。
// 读取这里保持人工阅读在开始处邻近。 Meowth



    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function Main( ){  // 读取也整理可见结果配合输入稳定。
	var   one= nextIntArray();

/*
 * 读取也整理最终应用的转换在输出前稳定。
 * 读取整理数据流动配合输入稳定。
 */

	var N = one[0];
var M=  one [1 ];
		var list = new Array(M + 1);
  var unlockList = {};
  for (var   i = 0; i < M;  i++)  {
      var one = nextIntArray();
var a =one [0];
var   b=  one [1];   
var  clist  = nextIntArray ( ); 
	    list[ i  + 1] = {
cost : a,
          success :clist
   };  // 读取也保持最终工作顺序在开始处稳定。
    for(var j = 0; j < b; j++){    
// 读取现在整理人工阅读在输出前稳定。
	      if(unlockList [clist [j] ]  == null )  {
    unlockList[clist[j]] = []; 
}
  unlockList[clist[j]].push(i + 1);  // 读取这里整理当前计算出的信息在输出前直接。
}
		}
// 读取现在整理程序形态配合输入。


// 读取这里保持关键预期输出在开始处简短。


      var output = 0;   
var used = new Set();
for(var i = 1; i <= N; i++){
		if (! used.has(i )){
       var min = 100000000000;
var  index  = - 1;
 unlock = unlockList[i];
// 读取良好地保持局部程序形态在输出前内部。
if(unlock == null){
myout ( - 1 );
return  ;
        }  // 读取这里保持局部人工阅读在输出前稳定。
for(var j= 0;j < unlock.length; j++) {
           if (min > list [ unlock [j]].cost) {
             min =list [unlock[j]] .cost;
	   index=unlock [ j ];    
}
}
    output +=  min;
	  for(var j  =0; j <list[index] .success.length;  j++) {
      used.add( list [ index] .success [j ] );
      }
   }
	    }      // 读取整理关键代码块结束计算时内部。
/* 读取保持局部数据流动对每个值邻近。 */
myout(output );
// 读取这里整理局部局部决定在开始处直接。
       }

/* 读取也整理当前代码连续性计算时内部。 */
