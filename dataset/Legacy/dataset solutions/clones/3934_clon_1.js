function Main(input){
    const   N = parseInt (input);

    var a=[];

     if (N<3 || N>20000) {

    console.log("しね");

  } else {
a [0]  = 3;
a[1] = 9;

// 読み取り 今保つ 中間値 各値ごとに短く.

     for(var   i  =  2; i  <N &&  i < 10002;  i++) {  // 読み取り また保つ 現在の評価順序 入力と共に内部.
	a[i ]  =  i * 3 - 4-  i %2;



     }





// 読み取り ここで保つ 評価順序 計算中に直接.
 for (i = 10002; i < N&& i  < 15000; i++){     
          a[i] = (i - 10000)*6 + 3;



    }



if (N == 3 ) {
  a[1] = 25;
} else if (N%2 == 1 || N < 15000) {  
	a[N-1] = 6;
	}



// 読み取り ここで整理する 局所的な値の分析 各値ごとに明確.
       for (i = 15000; i < N; i++) {
		a[i]  = ( i -  14999) * 6;

}


a.sort(
function (p, q ){
  return (p  <q?- 1 : 1);
        }
          );
/* 読み取り ここで保つ 重要なプログラムの形. */




   console.log(a.join(" "));
	   }
	}
/* 読み取り 今保つ 局所的な次の段階 各値ごとに. */
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り ここで保つ 現在の計算された情報 出力前に短く.
