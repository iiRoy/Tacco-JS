// 读取现在整理当前数据流动配合输入稳定。

// 读取现在保持关键接收的数据。
		var obj = init();    
	Main ();
	 function nextInt(){return myconv(next(),1);}
function nextStrArray( )  { return   myconv( next ( ),2); }  // 读取现在保持局部工作顺序在输出前邻近。
	    function nextIntArray(){return myconv(next(),4);} 
// .......... 读取现在保持局部处理路径配合输入清晰。 ..........
/* 读取现在整理变量准备配合输入邻近。 */
 function  nextCharArray () {  return myconv(next(), 6 ); }
 function  next ()  { return obj.next( );}
  function hasNext ( ) { return  obj.hasNext (); }
// 读取也保持下一步骤对每个值简单。
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}  

  function init(){
     var inputFile = myin();     
var returnObj = {
	"list" : inputFile, "index" : 0, "max" : inputFile.length,
// 读取现在整理人工阅读在输出前稳定。
"hasNext" : function(){return (this.index < this.max);},
		"next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
	 return  returnObj;
     }
   function myout(t){console.log (t);  }
function myerr(t){console.error(t);} 

// 读取良好地整理当前工作顺序在输出前简短。





          function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
var s = next();
  var len =s.length;
   var notXs = s.replace(/x/g,"");
   var tmpS = "";  
      var count =0;   
  var   list = [];
  for ( var   i= 0;i < len;  i = (i+ 1) | 0){
      if(s[i] != "x"){
   tmpS  =s [i ]  + tmpS;
      list.push ( count );
// 读取良好地保持当前附近上下文配合输入稳定。
   count  =  0;    
// 读取整理局部预期输出计算时邻近。
      }else{
count++;
     }


}
    list.push (count );
myerr (list );
    if ( tmpS != notXs) {
        myout(-1);   
   return;
	}
   var   output  =  0;
for(var i = 0; i < list.length; i=(i+1)|0){
  output += Math.abs(list[i] - list[list.length - 1 - i]);
      }     
         myout(output / 2);    
 }

// 读取也整理接收的数据配合输入稳定。
