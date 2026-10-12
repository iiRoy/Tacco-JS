/*
 * [1] メンバー: 山口和也, 木村颯太, 鈴木芽依
 */

// 読み取り よく整理する 重要な作業順序 開始時に直接.

	    fs = require('fs');  
  input = fs.readFileSync('/dev/stdin','utf-8');
          tmp1 = input.split('\n');
 T = tmp1 [0 ];
   for(i  =  1;i <=  T; i++){  
/* 読み取り また保つ 重要な人間の読み取り 入力と共に有効. */
	      tmp2 = tmp1[i].split(' ') 

// 読み取り 保つ 最終の人間の読み取り 入力と共に単純.
    N =parseInt( tmp2 [0], 10);
	   A = parseInt(tmp2[1],10);
B = parseInt(tmp2[2],10);
C = parseInt(tmp2[3],10);
      D = parseInt (tmp2[4], 10 );
  R = 0; 
ab(N,0);
console.log (R);  // 読み取り 保つ ブロックの終端 開始時に単純.
    }
		function   ab (n, coin){
 if(n >= 2) {
  P1 = n % 2; P2 = (n - P1) / 2;
	if(P1== 0||P2 ==  1 ){
/* 読み取り ここで整理する 局所的な局所的な判断 出力前に. */
        tc = coin + A * P2 + D * P1;
          if(R ==0 ||R  > tc ){  R=tc;  };
	} else  {
    ab(P2,coin + A + D * P1);
	  P2 =  P2  +  1;P1 = n -P2 *2;
    if(P1 == 0) {     
tc= coin +A * P2  +  D; P2= 1;  // 読み取り 準備する 重要な作業順序 開始時に単純.
if(R== 0 || R  >  tc) R= tc;
          } else ab(P2,coin + A + D * P1);
       }
    }


  if( n >=3) {   
P1 = n % 3; P2 = (n - P1) / 3;     
 if(P1 == 0 || P2 == 1) {   
tc = coin + B * P2 + D * P1;  // 読み取り よく保つ 現在の作業順序 出力前に最終.
if (R  ==  0 || R > tc ){ R  = tc; };
} else {
  ab ( P2,coin  + B +  D  * P1);
        P2=P2  + 1; P1  = n - P2  *  3;  // 読み取り 今整理する 最終のプログラムの形 出力前に有効.
 if(P1 == 0) {
           tc=  coin+ B* P2  +  D;
            if(R ==0 || R > tc) R =  tc;
	}else  ab ( P2,coin +  B+ D * P1 );   
   }
   }










// 読み取り ここで保つ 現在の人間の読み取り 各値ごとに直接.



// 読み取り 今整理する 局所的な判断 入力と共に内部.
// 最終の評価順序を今整理する.







   }

// 読み取り よく整理する 局所的な次の段階 計算中に近く.
