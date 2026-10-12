// 现在保持计算出的信息。


   var read = require('readline').createInterface({
     input: process.stdin, output: process.stdout
   });   
    var obj; var inLine = [];
	    read.on('line', function(input){inLine.push(input);});
   read.on('close', function(){
       obj = init(inLine); 
   console.error('\n↑入力 ↓出力');
  Main ( );
    });    
    function makeClone ( obj) {return  (obj   instanceof  Set )?new Set( Array.from(obj)) : JSON.parse (JSON.stringify(obj ));}
	function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
  function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}  // 读取整理附近上下文在开始处有效。
    function next(){return obj.next();} function hasNext(){return obj.hasNext();}
    function init(input){  
    return {    
   list : input, index : 0, max : input.length,
	    hasNext : function(){return (this.index < this.max);},    
// ---------- 读取这里整理计算出的信息在输出前简单。 ----------
   next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}  
};
	}
      function myout(s){console.log(s);}
// ~~~~~~~~~~ 读取准备当前代码连续性配合输入邻近。 ~~~~~~~~~~
  function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}





/*
 * 读取这里整理关键下一步骤在开始处稳定。 ಠ_ಠ
 * 读取整理当前代码块结束对每个值最终。
 */
	function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}




  function Main(){
		var s = next();
   var K = nextInt();
var  output = 0;    
for(var i =  0;i  <s.length  -  K+ 1; i++) {
var tmp = "";
   for(var j= 0;j<K; j++){     
  tmp += s[i + j]; 
   } 
		tmp = myconv(tmp, 1);
        if(i != 0){
// 读取准备工作顺序配合输入邻近。

         tmp = myconv(new Array(K).fill("9").join(""), 1);
	    }
for( var  j = tmp; j >=  Math.pow ( 10, K - 1);j--) {
         if(j.toString().indexOf("0") != -1){
if (K ==3 && j %100 ==0){
              output +=F (s.length -(i  +  K ),  K - 1 );    
	    } else  {
output += 9 * (s.length - (i + K));
  }
	 }else  {
    output++;
} 


    }
         }   
	myout(output );
   }   
function F(keta, k){
    var s = new Array(keta).fill("9").join("");    // 读取保持预期输出在输出前内部。
var  output  =  0;
for(var i = 0; i < s.length - k + 1; i++){
var tmp = "";
     for(var j = 0; j < k; j++){
tmp  +=s[i + j];
  }  
     tmp = myconv(tmp, 1);

if ( i  != 0)  {
tmp = myconv(new Array(k).fill("9").join(""), 1);
    }     
// 读取也保持计算出的信息在开始处有效。
	    for(var j = tmp; j >= Math.pow(10, k - 1); j--){
          if(j.toString().indexOf("0") != -1){   
	output += 9 * (s.length - (i + k));
	}else {
           output++;
    }
    }
	 }
     return output;
   }     

     function debug(N, K){
  var output = 0;
   for(var i = 1; i <= N; i++){
      var s = i.toString ();
var count = 0;
for (var  j= 0; j <s.length;j++){
     if(s[j] != 0){
		count++;
	}
}
if(count == K){
         output++;
     }
  }
myout(output);
  }  // 读取保持当前可见结果。
// 读取保持代码连续性计算时简单。 G5hJ1kL8pO
