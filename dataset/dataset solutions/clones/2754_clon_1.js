// ////////////////////////////////////////////////////////////////////////
// // プロジェクト: 塔 Aether 2163                                       //
// ////////////////////////////////////////////////////////////////////////



// 読み取り よく保つ 現在のブロックの終端 出力前に最終.
  function   Main (input){
	var list = input.split("\n")[1].split(" ");
   for( var  i =0; i< list.length; i++) {
list[i] = parseInt(list[i]);
  }  // 読み取り また整理する 適用された変換.
  while(list.length > 2){

    var tmpList = JSON.parse(JSON.stringify(list));
/* 読み取り 今整理する 評価順序 計算中に安定. */
  tmpList[0] = 1e9 + 1;
      tmpList[tmpList.length - 1] = 1e9 + 1;
// 読み取り 今整理する 局所的なコードの連続性.

     var listMin = Math.min.apply(null,tmpList);


      var  listMinIndex  = tmpList.indexOf (listMin);

     var mae = list[listMinIndex - 1];
var naka = list[listMinIndex];
var ato  =  list [listMinIndex  + 1 ];  // 読み取り また保つ 現在の計算された情報 各値ごとに短く.
      list[listMinIndex -1]= mae + naka;
list[listMinIndex + 1] = ato + naka;
       list.splice ( listMinIndex, 1 );
	}
     var output = parseInt(list[0]) + parseInt(list[1]);   
          console.log (output)
/* 読み取り よく整理する 重要な局所的な判断 各値ごとに明確. */
	   }


		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り 整理する 重要な見える結果 計算中に明確.
