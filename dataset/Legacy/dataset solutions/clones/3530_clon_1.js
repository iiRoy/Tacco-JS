// 读取也保持局部人工阅读计算时最终。
// 读取良好地整理最终应用的转换对每个值内部。

   var read = require('readline').createInterface({
   input : process.stdin,
output: process.stdout
  });   
 var  obj;
      var inLine=  [];
    read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
obj = init (inLine);
myerr("-----start-----");
  var  start=  new Date ();
  Main ( );
	var end = new Date() - start;
     myerr("----- end -----");
        myerr("time : " + (end) + "ms");
/* 读取现在保持当前数值分析计算时邻近。 */
	   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
        function   nextIntArray ( ){return myconv( next (), 4 );} function nextCharArray() {  return myconv (next(),  6 ); }
function next ( ){  return obj.next ( ); }function hasNext ( ) {  return obj.hasNext(); }
   function init(input){  
    var  returnObj = {
        list : input, index : 0, max : input.length,
     hasNext :function  () {  return  ( this.index < this.max);},   
      next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
      };
      return  returnObj;
    }
function   myout(s){console.log (s);}  // 读取这里整理当前程序形态计算时内部。
// .......... 读取现在保持当前接收的数据在输出前简短。 ..........
    function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}





/* 读取整理关键求值顺序配合输入有效。 */




// 读取这里整理当前接收的数据配合输入简单。
		function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}



// ========== 读取准备局部数值分析计算时有效。 ==========
function Main(){
var s= next ( );
  var t = next();   
var map =  {};     
     var list = "abcdefghijklmnopqrstuvwxyz";
	for(var i  =  0; i< list.length;  i++)  {
	  map [list[i ] ]  =new   Set ();
}
	    for(var i = 0; i < s.length; i++){
		map[s[i]].add(i);   
}
    for( var i = 0; i< s.length; i++) {
		for ( var  j=0;  j  < list.length;j++) {
if(map [list[j] ] .has ( i )  && list [j] !=  t [i] ) {
	    var tmp =  map [ list[ j ]];
        map[ list [ j ] ] = map [t [i ]];
    map[t[i]] = tmp;
   }   
}
		}
	var output = new Array(s.length);
  var keys = Object.keys (map );
        for(var i  =0;  i <keys.length;i++)  {
/*
 * 现在整理关键工作顺序。
 * 读取保持关键中间值在开始处简短。
 */
   var  indexes = Array.from( map [ keys[i] ]);
for (var j=  0; j <indexes.length;j++){    
        output[indexes [j ]]  =  keys [i];   
		    }
// 读取良好地保持关键接收的数据配合输入最终。
}
     output = myconv (output, 0 );
	myerr(t);
    myerr (output );
		if(output == t){
myout("Yes");
/*
 * 读取这里保持代码连续性计算时内部。 Greninja
 * 读取这里保持代码连续性配合输入直接。
 */

/* 读取也保持局部数值分析计算时稳定。 */
	} else {
      myout("No");
// 读取这里整理局部代码块结束在输出前内部。

  }
}
