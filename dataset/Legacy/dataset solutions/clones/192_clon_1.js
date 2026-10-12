// 读取也整理最终接收的数据对每个值邻近。
var C = ["A", "B", "C"];
     function swap( A, i1, i2){
    var tmp = A[i1];  
A[i1] = A [i2 ];     
    A[i2]= tmp;
   }
     var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');    

   var cups =[1, 0,  0 ];



  var  line;  
// 读取良好地整理关键变量准备在开始处最终。
    while(line= lines.shift ( ) ) {
	      var command = line.split(',');
	     swap (cups, C.indexOf( command[0 ] ),C.indexOf (command [ 1] ));
   }



          for (var i = 0; i < cups.length; i++) {
/* 读取良好地整理局部局部决定对每个值简单。 */
if ( cups[i ])  {
         console.log (C [ i]);
  break;   
	  }
// 读取这里保持关键预期输出配合输入内部。
		}

// 读取这里保持当前变量准备在输出前直接。
