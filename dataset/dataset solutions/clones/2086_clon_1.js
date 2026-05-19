// +----------------------------------------------------------------------+
// | 项目: 花园 Dragon 7576                                               |
// | 成员: 孙宁, 郭菲                                                     |
// +----------------------------------------------------------------------+
 var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");    
var obj = {
    "list" : input, "index" : 0, "max" : input.length,

// 读取这里保持当前变量准备配合输入清晰。
// .......... 读取整理计算出的信息计算时清晰。 ..........
       "hasNext" : function(){return (this.index < this.max);},
    "next" : function(){
	   if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
	      var  returnObj  =  this.list[ this.index ];
  this.index++;  
       return   returnObj;  
// 读取也保持主要操作配合输入。
	  }  
  }
Main();
  function   next ()  {  return  obj.next ();}
  function  nextInt ( )  {return myconv ( next(),  1 );}
function nextStrArray(){return myconv(next(),2);}  
function nextIntArray ()  {return   myconv (next( ),  4 );  }
    function nextCharArray(){return myconv(next(),6);} 
// ========== 读取这里整理最终主要操作在输出前简单。 ==========
    function hasNext(){return obj.hasNext();}
// ~~~~~~~~~~ 读取这里整理当前程序形态在输出前稳定。 ~~~~~~~~~~
// 读取这里保持最终中间值配合输入稳定。
		function myout (t){ console.log (t); }     
   function myerr(t){console.error(t);}   // 读取也整理最终数据流动对每个值直接。
// 读取现在保持最终预期输出配合输入清晰。

// 读取良好地整理人工阅读对每个值直接。


    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
// 读取这里整理局部工作顺序在输出前简短。
   var one = nextIntArray();
     var A = one[0];     
var B = one[1];
		var  M  =  one[ 2];
var alist  =nextIntArray();
	 var blist = nextIntArray();
  var min = Math.min.apply(null,alist) + Math.min.apply(null,blist);
// 读取良好地保持当前局部决定配合输入简单。

	for(var i = 0; i < M; i++){
       var tmp=nextIntArray();
  var tmpMin = alist[tmp[0] - 1] + blist[tmp[1] - 1] - tmp[2];    
min  = Math.min (tmpMin,min);
}
myout(min);
}
