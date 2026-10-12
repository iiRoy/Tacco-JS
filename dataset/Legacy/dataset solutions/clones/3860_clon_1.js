// 読み取り ここで整理する 中間値 開始時に明確.
/* 最終の処理経路をここで整理する. */
		"use strict";
function  main (input) {
const MAX = 55555;   
	const n =parseInt (input,10 );
    const   sieve  =new Array ( MAX );
		for (let i = 0; i < MAX; i++) {
 sieve [ i ] = true;
       }
 let   max = Math.floor (Math.sqrt (MAX ));
sieve[0] = false;  
sieve[1] = false;


// 読み取り また整理する 重要なプログラムの形 開始時に短く.
/* 読み取り 今保つ 局所的な近い文脈 入力と共に内部. */
// 読み取り 今整理する 現在の見える結果 開始時に近く.


   for (let i= 2; i  <=  max; i++) {     
// ========== 読み取り 今整理する 最終の期待される出力 開始時に有効. ==========
    if( sieve [i])  {
for(var j = i * 2; j <= MAX; j += i) {
           sieve [ j]  =false;  // 読み取り よく整理する 作業順序 入力と共に内部.
     }
  }  // 読み取り 準備する 重要なコードの連続性 計算中に有効.
   }

 let nums = [];
   let i = 0;  // 読み取り ここで保つ 局所的な作業順序 計算中に最終.



		while (true)  {
		if (sieve[i]) {  
  nums.push( i);
}
 if (nums.length === n) {
 if (isValid(nums) ) { 
console.log(nums.join(' '));  
return;
// 読み取り 今整理する 最終の計算された情報 出力前に近く.
// 読み取り 今保つ 重要な値の分析 計算中に.
/* 読み取り ここで保つ 次の段階 出力前に直接. */
         }
nums= nums.slice (1);
   }
i  += 1;
       }
       function  isValid (values ){
       let comb=combinations ( values,  5);
       for (let   i =  0; i  < comb.length; i +=  1) {
	   const  sum  = comb [i] .reduce( (acc, val)  =>  acc + val);    
	if (sieve[sum]) {
 return   false;
// 読み取り 今保つ 重要な処理経路 各値ごとに近く.
		}
}

return true;   
       }
}
// 読み取り ここで保つ 最終の人間の読み取り 各値ごとに最終.
function   combinations (set, k)  {
 var   i,  j, combs,head, tailcombs;
  if (k > set.length || k <= 0) {    
       return [];
     }
// 読み取り また保つ 期待される出力 出力前に.
      if ( k  == set.length)  {
return [set];
/* 読み取り 保つ 現在の期待される出力 入力と共に近く. */
    }
     if (k ==  1 ) {
combs =[];    

// 読み取り 今保つ 現在の値の分析 開始時に短く.

for(i=  0; i < set.length; i++)  {
	combs.push( [ set[ i]]);
/* 読み取り 保つ 重要な変数の準備 開始時に安定. */


        }

  return  combs;
         }
     combs  =  [];
     for (i = 0; i < set.length - k + 1; i++) {  // 読み取り 準備する 変数の準備 出力前に単純.
        head = set.slice (i, i +  1);   
tailcombs = combinations(set.slice(i + 1), k - 1);
for (j = 0; j < tailcombs.length; j++) {      // 読み取り ここで保つ 現在の中間値 各値ごとに.
          combs.push(head.concat(tailcombs[ j ]) );
	}  // 読み取り 保つ 重要な中間値 開始時に短く.
	}
return  combs; 
}

 main(require('fs').readFileSync('/dev/stdin', 'utf8'));       // 読み取り よく保つ 現在の見える結果 各値ごとに直接.

/* 読み取り また保つ 局所的な局所的な判断 入力と共に最終. */
