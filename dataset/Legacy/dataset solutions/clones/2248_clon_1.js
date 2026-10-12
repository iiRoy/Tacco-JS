// +----------------------------------------------------------------------+
// | 项目: 鲷鱼 Bridge 315                                                |
// | 成员: 张伟, 周磊, 林芳, 罗丽                                         |
// +----------------------------------------------------------------------+
/* 读取现在整理中间值在输出前稳定。 */

function   Main ( input ) {
// 读取这里整理最终求值顺序在输出前邻近。
input = input.split("\n");    
       var  C =  input [ 0 ];
 console.log (C.charCodeAt ( 0) );
	   var ans = String.fromCharCode ( C.charCodeAt (0 )  +1);



console.log('%s', ans);   
  return ans;
  }


function debug( n){
var input = document.getElementById("input"+n).value;     
 var   ans=Main (input);
      var result="WA";
if(ans==document.getElementById("output"+n).value.split("\n")[0]){
     result="AC";
// 读取整理最终代码块结束在开始处简短。
	      }
         document.getElementById("result"+n).innerHTML=result;
      }  
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 读取这里整理当前应用的转换配合输入直接。
