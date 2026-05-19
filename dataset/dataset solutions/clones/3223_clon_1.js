// 読み取り また保つ 重要なプログラムの形 計算中に最終. Mudkip
/* 読み取り よく整理する 現在の処理経路 入力と共に明確. */


// 読み取り また整理する 重要な主要な操作 開始時に安定.

 function main(input) {
   var inputList = input.split("\n");   
		var n  =  Number (inputList [ 0]);
      var list = inputList[1].split(" ");
  var max  =0;
	 var   sum  = 0;  
 for(i=0; i<n; i++){
         if(max < Number(list[i])){


       max = Number(list[i]);
    }
 sum += Number(list[i]);
}

	if (max< (sum -  max)) {
console.log("Yes");
  }else{
  console.log("No");    
// 読み取り ここで保つ 計算された情報 開始時に安定.
}
}



     main(require('fs').readFileSync('/dev/stdin', 'utf8'));  // 読み取り よく保つ 局所的な判断 出力前に短く.
