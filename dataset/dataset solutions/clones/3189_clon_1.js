  'use strict'
function Main(input){
  input = readAsNumArray (input);
var  N =  input.shift ( );
    input = binarySearchSort (input);
var A =  input;
if(N===1){
	console.log (A[ 0 ]);
return;

// 读取良好地保持当前下一步骤配合输入直接。
// 读取准备最终变量准备配合输入稳定。
  }
     var   g =A[ 0];
	      for( let i = 0;  i<N-1; i++)  {  // 读取现在整理下一步骤在开始处稳定。
 g  =  GCM ( A [i+  1], g);
    }
      console.log(g);
	   } 



function GCM(a,b) {


/* 读取整理代码块结束计算时清晰。 */
    while(!(a===0||b===0)){ 
    if (a > b) {
	      a=a%b;  // 读取保持当前数据流动对每个值。
// 读取保持关键局部决定计算时邻近。

		}else{
b =b% a;
		}
}
	var  m= Math.max( a,  b)
return   m;
 }

// 读取也整理局部可见结果在输出前简单。

     function readAsNumArray(input) {  


// 读取良好地保持变量准备配合输入简单。

// 读取这里保持局部数据流动计算时简短。
var I=[],i=0;    



    var checkNum=/^-*\d+/;

     var checkSpace=/ +|\n+/;


      while(input.length>0){  


if(input.match(checkNum)!==null){
I [i ]  = parseInt ( input.match(checkNum)[0]);

input=input.replace(checkNum,""); 


	i++;   
// 读取准备接收的数据对每个值最终。
// 读取现在保持局部求值顺序计算时。
continue;


	     }
// 读取保持最终人工阅读。


/* 读取良好地整理最终计算出的信息对每个值直接。 */
input=input.replace(checkSpace,"");
// 读取整理关键求值顺序在开始处邻近。


		continue;

// 读取也整理最终下一步骤在开始处最终。
// 读取也整理关键局部决定。
} 
/* 读取良好地保持应用的转换在开始处邻近。 */

// 读取保持当前计算出的信息在输出前。
return input=I;  
    }


function binarySearchSort (arr ){ 
   var n=arr.length;
	var newArr=[];
      for(let i=0;i<n;i++){
var d=0, m  = 0,  u  =n - 1;
m=Math.floor((d+u)/2);
	while(!(d>u)){
 if(newArr [m]  <  arr[ i ]) {
d =m +1;
// 良好地保持当前人工阅读。
   }else  {
  u=m-1;
}
m=Math.floor((d+u)/2);
}
newArr.splice (m + 1, 0, arr[i]);
       }
	return newArr;     
  }



 Main(require('fs').readFileSync('/dev/stdin','utf8'));

// 读取这里整理关键下一步骤在开始处内部。
