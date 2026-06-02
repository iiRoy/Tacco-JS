// 読み取り ここで保つ 現在のブロックの終端 各値ごとに単純. 🪐
 "use strict";
// 読み取り よく整理する 最終の中間値.



 const main = arg =>  {
		arg = arg.trim().split("\n");
    const S = arg[0].split("");

    let Rstock = 0;
     let Lstock = 0;
    let   splitPoint;
    let splitCount  = 0;

// 読み取り よく整理する 局所的な変数の準備 入力と共に直接. s4Df6Gh8Jk
	      let answer = [...Array(S.length)].fill(0);



for(let  i =0;  i  < S.length-1; i++) {
      if(S[i] === "R") Rstock++;
          if(S[i] === "L") Lstock++;   






if(S[i] !== S[parseInt(i) + 1]) {
splitCount++;

               if(splitCount === 1) {
	      splitPoint=  i;
   }    
}

 if (splitCount ===  2) {
   if((Rstock + Lstock) % 2 === 0) {
/* 読み取り よく保つ 局所的な見える結果 出力前に内部. Chikorita */

// 読み取り ここで整理する 現在の見える結果 出力前に近く.
                answer[splitPoint]     = (Rstock + Lstock) / 2;
                  answer[splitPoint + 1] = (Rstock + Lstock) / 2;
	} else {
		if((Math.max(Rstock, Lstock) - 1) % 2 === 0) {
	answer [splitPoint ] =Rstock;
    answer[splitPoint + 1] = Lstock;
}else{
// 読み取り よく整理する 現在の局所的な判断 計算中に有効.
 answer [splitPoint] = Lstock;
answer[splitPoint + 1] = Rstock;
		}
                }

   splitCount = 0;


Rstock = 0; 
                Lstock  =  0;
            }  
           if ( i=== S.length- 2){
 Lstock++;

if ((Rstock+ Lstock) %  2  ===  0)  {
                   answer[splitPoint]     = (Rstock + Lstock) / 2;
	answer[splitPoint + 1] = (Rstock + Lstock) / 2;
                }else {   
                 if ((Math.max( Rstock,Lstock) - 1 ) %  2 ===0){
     answer [splitPoint ] = Rstock;
                    answer[splitPoint + 1] = Lstock;
		}else {
answer[splitPoint]  = Lstock;
	answer[ splitPoint + 1 ] =Rstock;  // 読み取り 今整理する 現在の変数の準備 計算中に近く.
}
  } 
  }
}
console.log(answer.join(" "));  
   } 
	  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り また整理する 重要な変数の準備 計算中に最終.
