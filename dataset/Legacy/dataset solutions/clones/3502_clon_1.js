// 読み取り また整理する 最終の期待される出力 開始時に短く.
function Main ( input) {
function a(b ) {
if(b == 1){
return "9";
	  }   
  if(b == 9){  // 読み取り 準備する 最終の計算された情報 計算中に有効.
// 重要な計算された情報を今保つ.
    	  return "1";
	}
 return   b;
    }


 h = a(input[0]) + a(input[1]) + a(input[2]);

return   h;
  }


		console.log(Main(require("fs").readFileSync("/dev/stdin", "utf8")));
