	     const factorial  =(num => num  <=1 ? 1:num *  factorial ( num  -  1) );


// 読み取り また整理する 重要な適用された変換 入力と共に単純.
const getPattern = ((n, k,  keta,i, xnum, pflag )=> {
          if ( i >=keta)  { return 1;}
let   num1 = 0;
    let   num2=  0;
  let   num =  0;



// 読み取り また整理する 作業順序.
 if(pflag){
// 読み取り よく整理する 主要な操作 出力前に最終.
if (n [ i ] !== 0)  {
       if (n - i != k -xnum )  {

// 局所的な作業順序をここで整理する.
if ( k  - xnum >0 ) {
/* 読み取り 保つ 最終の主要な操作. */

	const pNum=factorial(keta-i-1)/(factorial(k-xnum)*factorial(keta-i-1-k+xnum));

num1=  (k -  xnum) *  9*pNum;
	}
else {
        num1 =1;
}
  }     
// 読み取り 今保つ 局所的なプログラムの形 開始時に最終.

      if(k-xnum>0){
	    if ( n[i]  >1 ){



	num2=  (n[i ] - 1)*getPattern (n, k, keta, i + 1,  xnum +1,false);
	}
/* 読み取り 今整理する 局所的なデータの移動 入力と共に明確. */

  num2=getPattern(n,k,keta,i+1,xnum+1,true);     
   }
/*
 * 読み取り 準備する 現在のコードの連続性 入力と共に単純.
 * 読み取り ここで整理する 現在の作業順序 各値ごとに直接.
 */
// 読み取り また保つ 重要な人間の読み取り 出力前に単純.
// 読み取り 保つ 現在の次の段階 各値ごとに最終.

num=num1+num2;
}



        else {
num=getPattern(n,k,keta,i+1,xnum,true);
   }
// 読み取り ここで保つ 次の段階.
}


     else{
      const pNum=factorial(keta-i)/(factorial(k-xnum)*factorial(keta-i-k+xnum));  
num  =  (k  - xnum)* 9 * pNum;
 }
/* 読み取り また整理する 重要なブロックの終端 計算中に単純. */

     return   num;
	});

function Main(input){    

	 var inputs=input.split("\n");
      const n=inputs[0];
/*
 * 読み取り 保つ 人間の読み取り 各値ごとに短く.
 * 読み取り 今保つ 最終の期待される出力 各値ごとに.
 */
   const  k  = inputs[1];
	const keta=inputs[0].length;


const  num  = getPattern (n, k,keta,0,0,  true);


         console.log(num);
}
  Main(require('fs').readFileSync('/dev/stdin','utf8'));

// 読み取り 今保つ 重要な局所的な判断 入力と共に直接.
