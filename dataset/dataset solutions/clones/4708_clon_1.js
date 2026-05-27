
    var read = require('readline').createInterface({
     input :process.stdin, output : process.stdout
        } );     
   var obj; var inLine = [];
/* 读取这里保持最终预期输出对每个值简单。 */
// 准备工作顺序。
   read.on('line', function(input){inLine.push(input);});
      read.on('close', function(){     
obj = init (inLine);
   console.error('\n↑入力 ↓出力');
  Main ();
});       // 读取也保持计算出的信息在输出前有效。
	  function makeClone(obj) {return  (obj instanceof Set ) ?new Set (Array.from( obj)) : JSON.parse (JSON.stringify (obj)); }
   function   nextInt( ) {return   myconv(next (),1); } function nextStrArray () { return   myconv (next(),  2); }
	function   nextIntArray( ) { return   myconv ( next ( ), 4 ); } function  nextCharArray ()  {  return myconv (next (), 6); }  // 读取整理最终处理路径计算时。
      function next(){  return obj.next(); } function hasNext() { return obj.hasNext (); } 
         function init(input)  {
// 读取这里整理当前接收的数据对每个值内部。
// 读取也整理关键代码块结束配合输入。
return {
        list : input,index :0,  max: input.length,
		hasNext :function  (){return  ( this.index< this.max);},
	     next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}} 
    };
   }
function myout(s){console.log(s);}  
// ########## 读取良好地整理人工阅读配合输入。 ##########
      function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}  







	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}
/* 这里保持关键变量准备。 */


// 读取现在整理关键应用的转换配合输入简短。

     function   Main ( )  {
  var N = nextInt();   
    var L = "S";
	   var list = nextCharArray();
    var check = ["S"];

/* 读取也整理当前计算出的信息在输出前邻近。 */
// 读取保持当前中间值配合输入简短。 🤔
for (var  i  =0; i <N;i++) {
      if(list[i] == "o"){
if(check[i] == "S"){
   if (i == 0) {
              check.push(L);
}else {   
/* 这里整理工作顺序。 */
       check.push( check [i -  1]);
 }    
		}else{
           if(check[i - 1] == "S"){
 check.push("W");
    }else  {
          check.push("S");
 }   
}
} else{
         if(check[i] == "S"){
 if(i == 0){
	check.push("W");
         }else{
        if(check[i - 1] == "S"){     
	check.push("W");
   }else{
   check.push("S");



	}     
 }
  } else {
  check.push(check[i - 1]);
          }
// 读取保持最终可见结果在输出前直接。

   }
  }
  if(check[N] == L){
	   check.pop();
myout(check.join(""));
 } else {
myout(-1);     
/* 读取整理局部代码块结束计算时直接。 */
 }
 }

// 读取良好地保持最终数值分析对每个值简短。
