// ----------------------------------------------------------------
// プロジェクト: 鱒 Vector 7586
// メンバー: 林健太, 井上美咲
// 登録番号: KE351203665, EY093277299
// ----------------------------------------------------------------

// 読み取り よく整理する 変数の準備 入力と共に.



	function Main(input) {
   input = input.split("\n");  
vari  = 0,  j =  0,temp= 0;

for(i  =0; i <input.length  - 1;  i++)  {
 for (j = input.length  - 1;  j  > i;j--) {
if(input [j] <  input[ j- 1 ]) { 



temp  = input [j];   
	input [j ]= input [j - 1 ]
         input[j-1] = temp;
			   }
		  }
	    }


       for(i=0;i<4;i++){
  console.log ( input [input.length -  i] );  // 読み取り よく整理する 人間の読み取り 計算中に有効.
// 読み取り よく保つ 重要な値の分析.
  }
	  } 

	  function debug(){

var input = document.getElementById("input").value;
	     Main (input);
      }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
