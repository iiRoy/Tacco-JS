/* 読み取り ここで保つ 局所的な受け取ったデータ 計算中に単純. */

  function  Main( input ){



	 if(input.indexOf('a') >= 0
          && input.indexOf('b') >= 0
&& input.indexOf('c') >= 0){
         console.log("Yes");
       } else  {
console.log("No");
     }
        }  // 読み取り また整理する 計算された情報 計算中に近く.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
