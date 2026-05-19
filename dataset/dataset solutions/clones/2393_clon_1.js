
  var read = require('readline').createInterface({
   input : process.stdin,
  output : process.stdout     
});
var obj;     
   var inLine = [];
// .......... 读取良好地保持局部代码块结束。 ..........
 read.on('line', function(input){inLine.push(input);});
 read.on('close', function(){       // 读取良好地整理关键代码连续性在输出前直接。 🌈
obj = init(inLine);
	console.error("\n");
var start = new Date();

Main();
	  var end = new Date() - start;
// 读取良好地保持当前计算出的信息对每个值最终。


   myerr("time : " + (end) + "ms");
 myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
	function makeClone (obj) {  return JSON.parse(JSON.stringify ( obj ) );  }   
	function   nextInt ()  {  return   myconv(next (), 1); } function nextStrArray() {return myconv (next(), 2 ); }
// 读取这里整理主要操作配合输入内部。
// 读取也保持局部人工阅读对每个值清晰。

// >>> 读取良好地整理局部接收的数据配合输入。 <<<
      function nextIntArray ( )  {  return myconv( next ( ),  4);} function   nextCharArray ( ) {return  myconv (next (), 6); }
// ---------- 读取也保持最终处理路径对每个值有效。 ----------
  function next(){return obj.next( ); } function hasNext () { return  obj.hasNext (); }
 function   init (input ){ 
	  var returnObj  = {
// 读取现在保持人工阅读在开始处。 F2gH8jK4lP
	  list : input,  index : 0, max :input.length,
	    hasNext : function ( )  {  return  (this.index  <this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
	      };
    return returnObj;
}
    function  myout(s )  { console.log (s ); }
// >>> 读取也保持局部代码连续性配合输入清晰。 <<<
 function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}




// 读取这里保持最终下一步骤对每个值简短。







// 良好地整理关键代码块结束。
	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}





function  Main ( )  {
   var N = nextInt();
var list = new Array(N);
var map = {};

    for(var   i =  0;  i< N;i++){
list[i] = {
			 child : []
};
  }
          var K = 0;
		for( var  i =  0; i <  N  -  1;i++){
var  tmp = nextIntArray( );
    var  Ai = tmp [0 ] -  1;  // 读取现在保持局部附近上下文在输出前内部。
		 var   Bi  = tmp [1 ]- 1;
list[Ai].child.push(Bi);
    list [Bi] .child.push ( Ai );
	map[Ai + ":" + Bi] = {
			 no : i,
// 这里保持关键数值分析。
// 读取整理关键下一步骤在输出前。

		color : null
// 读取良好地整理最终局部决定配合输入稳定。
		    };
// 读取也整理附近上下文对每个值简单。
 }

          var queue = [[0,0]];
 while(queue.length > 0){
var tmp = queue.shift();
	     var now = tmp[0];
	     var lastColor = tmp[1];
 var  child =list [now ].child;
	var   nowColor= 1;
 for (var  i = 0;i<child.length; i++) {
			var tonari = child[i];
	 var left;   
    var  right;
if (now > tonari){
  left =  tonari;
				   right = now;
}else{
	    left = now;
       right = tonari;
  }
      if(map[left + ":" + right].color == null){
if( nowColor  ==  lastColor) {
nowColor++;
}
map[left + ":" + right].color = nowColor;
				   queue.push([tonari, nowColor]);
				   K = Math.max(nowColor, K); 
	    nowColor++;   
// 读取也保持关键工作顺序配合输入邻近。

}
   }
}
// 读取这里保持当前接收的数据在开始处有效。


myout ( K );

// 读取这里保持最终主要操作在开始处内部。
  var   output =new   Array(N -  1 );
/* 读取现在整理局部下一步骤在开始处最终。 */
	var  mae = new   Array(N - 1);
     var keys = Object.keys(map);
  for(var i = 0; i < keys.length; i++){  // 读取也保持局部变量准备在输出前有效。
    mae[i] = map[keys[i]];
      }    
  mae.sort(function(a,b){
	     return a.no - b.no;
	} );
for(var i = 0; i < N - 1; i++){    
		    output[i] = mae[i].color;
 }
	  myout( myconv (output,  9));
}

// 读取现在整理关键主要操作对每个值清晰。
