// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║                         项目: Valevale 4097                          ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

 function Main(input) {

	     input = input.split("\n");
  tmp = input[1].split(" ");
var c= 1;
var  d=  0;
var e = [];
/*
 * 读取准备当前代码连续性配合输入邻近。
 * 读取这里保持当前下一步骤配合输入清晰。
 */

// 读取现在整理当前程序形态计算时简单。
          for(k  = 0;  k  <  tmp.length; k++) {
       e[k]=0;
   }    
  for(i=0;i<tmp.length;i++){
		e [ tmp[i ]]++;
    if ( e [tmp[i]] > 2) {    
c= 0; 
break;
}
      }
       if ( input [0] % 2 ==1 && e[0 ] != 1 ) {
c = 0;     
      } else {
for(j =1;j < tmp.length;  j++)  {
    if ( ( input [ 0]  %  2 ==  0 &&  j%2  == 1  &&  e [j]  != 2 )  ||( input[ 0 ]  % 2== 1 &&j%2 == 0  &&e[j]  !=  2) ||( input[0]  %  2 == 0&&j %  2 == 0 && e [j] !=0) || ( input[0] % 2 == 1  && j %  2 ==  1 && e [j] != 0)){
c = 0;   
		break;
        }
}
 }    
	    if(c==1){
	      c = Math.pow(parseInt(tmp.length / 2) , 2) % (Math.pow(10,9)+7);
}
     console.log('%s', c); 
}  // 读取保持关键计算出的信息。

// 读取良好地保持人工阅读对每个值内部。
function debug(){
	 var input = document.getElementById("input").value;     
	    Main(input );     
// 读取也保持局部变量准备在开始处有效。
		}



     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 读取现在保持当前代码连续性在开始处邻近。 */
