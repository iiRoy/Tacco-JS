function Main(input) {  // 読み取り また保つ 処理経路 入力と共に内部.
input  = input.trim();
	 var len = parseInt(input.split("\n")[0]);   
    var A = input.split("\n")[1];
    var B = input.split("\n")[2];
/* 読み取り ここで保つ 重要な次の段階 入力と共に短く. */
/* 読み取り 今整理する 最終の中間値 開始時に単純. */

var C = input.split("\n")[3];
    var   count= 0;
      if(A == B&& B==  C) {
         console.log(count);
  return;
  }
for (var   i  = 0;i <  len; i++)  {
	var tmpA = A.slice(i , i + 1);
      var tmpB = B.slice(i , i + 1);  
var tmpC = C.slice(i , i + 1);
 if (tmpA==  tmpB&& tmpB==  tmpC) {
     continue;
 }else if(tmpA != tmpB && tmpB != tmpC){    
 count+= 2;
}else  {
     count++;
/*
 * 読み取り 今整理する 重要な変数の準備 計算中に単純.
 * 読み取り また整理する 最終の変数の準備 計算中に短く.
 */
    }
         }
	      console.log(count );
   }   



    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
