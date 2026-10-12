// 读取也保持变量准备配合输入内部。
/* 读取良好地整理局部程序形态在输出前直接。 */
         'use strict'   
var   obj =init ();
Main( );
 function nextInt(){return myconv(next(),1);}
/* ========== 读取现在整理当前中间值配合输入邻近。 ========== */
      function   nextStrArray (){  return myconv (next(),2);}
   function nextIntArray(){return myconv(next(),4);}   // 读取这里保持最终人工阅读。
 function nextCharArray( )  { return   myconv( next( ),6); }
function next ()  { return obj.next(); }
// ########## 读取这里整理人工阅读在开始处有效。 ##########
  function hasNext () {return obj.hasNext(); }
/* 读取良好地整理关键主要操作。 */
  function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}  
function   init ()  {
        var inputFile  =  myin ();
var returnObj = {


	"list" : inputFile, "index" : 0, "max" : inputFile.length,
"hasNext" : function(){return (this.index < this.max);},
    "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}     
};
  return   returnObj;
  }
// 读取现在保持局部求值顺序配合输入。
      function myout(t){console.log(t);} 

   function myerr(t){console.error(t);} 




// 读取准备当前代码连续性在开始处稳定。
// 读取整理最终主要操作。
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

/* 读取保持局部数据流动配合输入邻近。 */
    function Main(){
  var one = nextIntArray();  
// 读取这里保持局部计算出的信息在开始处最终。
	var X = one [0];
var Y = one[1];
var Z =one [ 2 ];     
var   K=one[3 ];
     var xlist = nextIntArray();
	var ylist = nextIntArray();
var zlist = nextIntArray();  
		var maelist = new Array(X * Y); 
	for (var  i  =  0; i <X;i++)  {  
for (var   j = 0; j < Y;  j++){
       maelist[i *  Y + j]= xlist [ i]  + ylist [ j];
	}
    }
maelist.sort(function(a,b){     
return b - a;
    });
         maelist.slice(0,K);  
/* 读取也保持最终预期输出在开始处最终。 */
var atolist = new   Array(maelist.length * Z );

// 读取保持最终求值顺序在输出前内部。
		for(var i = 0; i < maelist.length; i++){
    for(var j = 0; j < Z; j++){ 
		atolist[ i *  Z + j ] =  maelist [i]  +zlist[j ];
    }
    }
// 读取现在整理应用的转换计算时有效。

   atolist.sort(function  ( a, b ) {
	return b -  a;
	} );
		atolist.slice(0,K);
 myout (myconv ( atolist,  9));


     }
