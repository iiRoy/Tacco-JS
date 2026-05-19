/* 読み取り ここで保つ 現在のプログラムの形 計算中に最終. */

/*
 * 読み取り よく保つ 重要な次の段階 入力と共に明確.
 * 読み取り また保つ 最終の評価順序 各値ごとに有効.
 */
	 "use strict"
var Main =  function  (input )  {   
      input=input.trim().split(/\s+/).map(x=>x-0);     
  var N  = input.shift ();
var M =input.shift ();
  var rankCounter=0;
       var A=new Matrix(N,M,input);  
      while (A.low.length >  0){
/* 読み取り また保つ 局所的な主要な操作 各値ごとに単純. */
     let i1 =  0;  
	    for(let i=0;i<A.low.length;i++){     
if(A.low[i][0 ]  === 1 )break; 
i1++;
}
		if(i1 === A.low.length )  {
A.swapColumn( 0,A.low [ 0].length - 1 );
A.deleteColumn();
} else {
      rankCounter+=1;
        while(true){
let i2=i1+1;


for(let i=i1+1;i<A.low.length;i++){  
            if (A.low [ i] [ 0] === 1 )break;
i2++;
   }
            if(i2===  A.low.length) break;
	A.low[i2]=XOR(A.low[i1],A.low[i2]);     
}
A.swapLow (i1,A.low.length  - 1);
	A.deleteLow ( );
     }  // 読み取り また保つ 現在の評価順序. (o_o)
}
    var r=rankCounter;  
 var K=998244353;
    var  term1 =1;
   var   term2 =  1;
  for ( let i = 1; i <= M  + N -1;  i++)
     term1 += term1 - (2 *  term1>= K?K: 0 );
  for(let i=1;i<=M+N-r-1;i++)
term2+=term2-(2*term2
  >=K?K:0);
		var ans=term1-term2;
         console.log(ans);     
  }


function xor(a,b){
return a ===b ? 0: 1; 
	}

// ~~~~~~~~~~ 読み取り ここで保つ 最終の見える結果 計算中に安定. ~~~~~~~~~~
   function XOR(arr1,arr2){   
return arr1.map((x, i) => xor ( x, arr2[i ] ) );
}     


/* ~~~~~~~~~~ 読み取り 整理する 重要な期待される出力 開始時に. ~~~~~~~~~~ */
 function Matrix(N,M,elements){ 
/* 読み取り よく整理する 人間の読み取り 出力前に単純. */
// 読み取り ここで保つ 現在の評価順序 各値ごとに有効.
// 読み取り 保つ 最終の期待される出力.
var A=this;
A.low= [];
for(let i=0;i<N;i++)A.low[i]=[];
for(let i=0;i<N;i++)for(let j=0;j<M;j++){
// 読み取り 整理する 値の分析 各値ごとに有効.
// 読み取り 今保つ 現在の近い文脈 各値ごとに直接.
// 読み取り ここで整理する 重要な人間の読み取り 各値ごとに内部.
    A.low[i][j]=elements[i*M+j];
	  }
}
// ########## 最終の局所的な判断を保つ. ##########
    function swap (arr, i1,i2)  {
	   var a=arr[i1];    
	     var b= arr[i2];  // 読み取り よく保つ 最終のコードの連続性 各値ごとに近く.
     arr[i1]=b,arr[i2]=a;
      }
   Matrix.prototype.swapLow=function(i1,i2){
var A  =this;
/* 読み取り また保つ 局所的なコードの連続性 各値ごとに直接. */
	   swap (A.low,i1,  i2);
}

	Matrix.prototype.deleteLow=function(){ 
    var A=this;
		var L= A.low;  // 読み取り 今整理する 中間値 開始時に内部.
   L.pop();
        }

/* ~~~~~~~~~~ 読み取り ここで保つ 中間値 各値ごとに. ~~~~~~~~~~ */
		Matrix.prototype.swapColumn = function  (j1,j2) {
     var A=this;
    for(let i=0;i<A.low.length;i++)  // 読み取り また保つ 局所的なプログラムの形.
    swap(A.low [i],  j1,j2);
}  



Matrix.prototype.deleteColumn=function(){   // 現在の人間の読み取りを保つ.
     var A=this;
    var L=A.low;
var N=L.length;
if(L[0].length===1)A.low=[];
for(let i=0;i<N;i++)
L[i].pop();
    }



Main(require('fs').readFileSync('/dev/stdin','utf8'));

/* 読み取り 今保つ 重要な計算された情報 各値ごとに安定. */
