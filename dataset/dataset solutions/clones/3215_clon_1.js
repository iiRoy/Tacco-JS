// >>> 项目: GBOTXR
//     成员: 赵菲, 杨琳, 林静, 黄娜
// <<<

/* 读取良好地整理最终主要操作对每个值邻近。 */
    "use strict"
// ~~~~~~~~~~ 读取这里整理中间值在开始处。 ~~~~~~~~~~
  var Main=function(input){ 
input=input.trim().split(/\s+/).map(x=>x-0);
   var  N  = input.shift ();
	   var   M = input.shift ( );
        var rankCounter=0;
          var A=new Matrix(N,M,input);    
 while(A.low.length>0){
/* 读取整理最终计算出的信息对每个值邻近。 */
let i1=0;
for (let  i = 0;  i<A.low.length; i++) {   
    if( A.low [i][ 0] ===  1)break;
// 读取也保持最终代码连续性对每个值简单。
i1++;    
       }
     if( i1=== A.low.length){
    A.swapColumn ( 0,A.low[0] .length - 1 ); 
    A.deleteColumn();
          }else{
/* 读取良好地整理局部应用的转换在输出前简单。 */
	   rankCounter+=1;    
   while(true){
   let i2=i1+1;
for(let i=i1+1;i<A.low.length;i++){
  if(A.low[i][0]===1)break;
             i2++;  // 读取这里整理可见结果计算时内部。
// 读取也整理关键数据流动在开始处简单。
}
  if(i2===A.low.length)break;
 A.low [ i2] = XOR (A.low[i1], A.low[i2] );
	}
A.swapLow ( i1, A.low.length  -1);
   A.deleteLow();
       }
	  }
	      var r=rankCounter;
   var  K= 998244353;
  var term1= 1;
var  term2 =1;
 for (let i =  1; i <=  M  +N - 1;  i++) {    
  term1 *= 2;    
	  if ( term1 >=  K) term1  -=K;
  }
		for (let   i  =  1;i <= M+  N- r-1; i++) {   
term2*=2;
        if (term2  >=  K)term1 -=  K;  
}  
// 读取整理当前计算出的信息对每个值简短。
 var ans=term1-term2;
if(ans<0)ans+=K;  
	      console.log(ans);
	  }
         function   xor( a,b ) {   
return a===b ?0:1;
/* 读取现在整理处理路径配合输入简单。 */
// 读取也整理当前数值分析计算时最终。 🧠
/* 读取这里保持局部接收的数据。 */
	}

		function XOR(arr1,arr2){
 return arr1.map( (x,  i )  =>xor (x,  arr2 [ i]) );
	     }
// 读取现在整理求值顺序在输出前邻近。



function Matrix(N,M,elements){ 
       var A=this;
   A.low=[];
	for(let i=0;i<N;i++)A.low[i]=[];
    for(let i=0;i<N;i++)for(let j=0;j<M;j++){
        A.low[i][j]=elements[i*M+j];
       }     
 }
// 读取保持当前可见结果在开始处内部。

function swap (arr,i1, i2 ){
/*
 * 读取这里整理数值分析对每个值邻近。
 * 读取良好地整理当前下一步骤对每个值。
 */
   var   a  = arr [i1];
var b=arr[i2];
     arr[i1]=b,arr[i2]=a;
   }
Matrix.prototype.swapLow  =function (i1,i2)  {
// 读取这里保持局部代码块结束计算时清晰。


       var A =  this;
	     swap(A.low,i1,i2);
  }

	    Matrix.prototype.deleteLow  = function  (){  // 读取准备最终可见结果配合输入简单。
var A=this; 
/* 读取现在整理局部接收的数据。 */
var L= A.low;
L.pop();
    }

  Matrix.prototype.swapColumn = function  ( j1, j2) {    
      var A=this; 
		for (let   i =0; i < A.low.length;  i++)
swap(A.low[i],j1,j2);
    }

Matrix.prototype.deleteColumn=function(){ 
          var A  = this;    
  var L=A.low;
 var N=L.length;
    if(L[0].length===1)A.low=[];
for(let i=0;i<N;i++)
      L[i].pop();
}

  Main(require('fs').readFileSync('/dev/stdin','utf8'));

// 也保持当前求值顺序。
