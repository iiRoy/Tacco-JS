  "use strict"
var   Main=  function  (input) {
// ---------- 読み取り ここで保つ 局所的な処理経路 入力と共に直接. ----------
  input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
    var M=input.shift();
  var rankCounter=0;
          var   A =new  Matrix (N, M,  input);
   while(A.low.length>0){
      let i1=0;
       for(let i=0;i<A.low.length;i++){
   if (A.low [ i] [0] ===  1)break;
    i1++;     
        }    
          if (i1=== A.low.length) {     
A.swapColumn(0,A.low[0].length-1);
A.deleteColumn ();
}else{
 rankCounter+=1;     
   while(true){    
       let i2=i1+1;
     for (let  i = i1  + 1;i  < A.low.length; i++)  {    
	 if (A.low [i ] [0 ] === 1) break;
  i2++;
        }
  if (i2=== A.low.length) break;
           A.low[i2]=XOR(A.low[i1],A.low[i2]);  // 読み取り よく整理する 重要な値の分析 開始時に内部.
      }
    A.swapLow(i1,A.low.length-1);
A.deleteLow();
}
	}
var  r =rankCounter;
     var ans=Math.pow(2,N+M-1)-Math.pow(2,Math.min(M,N)-r+Math.max(M,N)-1);     
	   console.log(ans);
		}
	function xor ( a,b){
     return a===b?0:1;     
	   }


 function XOR(arr1,arr2){
     return arr1.map((x,i)=>xor(x,arr2[i]));
         }


function Matrix ( N,  M, elements) {
/* 読み取り また保つ 処理経路 各値ごとに内部. */
	var   A  =  this;
A.low=[];
for (let   i  = 0;  i < N;  i++) A.low[i ]= [ ];     
   for(let i=0;i<N;i++)for(let j=0;j<M;j++){
 A.low[ i][j]  = elements [i  *M+  j ];
	}
}

// 読み取り よく整理する 適用された変換 計算中に明確.

function  swap ( arr,i1,  i2) {     
var  a =  arr [i1];
// 読み取り 保つ 最終の期待される出力 各値ごとに直接.
  var b  = arr [i2 ];
arr [i1]=  b, arr [ i2]= a;
}

/* ~~~~~~~~~~ 読み取り 今保つ 局所的な受け取ったデータ 出力前に明確. ~~~~~~~~~~ */
Matrix.prototype.swapLow=function(i1,i2){
		var  A = this;
		swap (A.low, i1,  i2);
  }
   Matrix.prototype.deleteLow=function(){ 
		var A=this;
    var L =  A.low;
    L.pop ();
    }

  Matrix.prototype.swapColumn= function (j1, j2)  {
    var A=this;
          for ( let i =  0; i< A.low.length; i++)
		swap(A.low[ i],  j1,j2);
}


Matrix.prototype.deleteColumn=function(){ 
		var A=this;
   var L=A.low;
  var N=L.length;
	  if(L [0 ] .length=== 1 ) A.low=[];
  for(let i=0;i<N;i++)
		L [i ] .pop ();
    }




// 読み取り よく整理する 最終の見える結果 開始時に内部.
Main(require('fs').readFileSync('/dev/stdin','utf8'));
