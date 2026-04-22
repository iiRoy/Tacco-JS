function ProcessInput (dataSource) {
  const quantity = parseInt(dataSource);
  
  let outputArray = [];
  
  if ( quantity < 3 || quantity > 20000 ) {
    console.log("入力無効");
    // 処理を終了する //
  }
  else {
    outputArray[0] = 3;
    outputArray[1] = 9;
    
    // quantity が 3 から 10003 の範囲である場合 //
    for (let counter = 2; counter < quantity && counter < 10002; counter++) {
      outputArray[counter] = counter * 3 - 4 - counter % 2;
      // 3の倍数周辺の偶数をペアで格納 //
    }
    
    // quantity が 10004 から 15001 の範囲である場合 //
    for (counter = 10002; counter < quantity && counter < 15000; counter++) {
      outputArray[counter] = (counter - 10000) * 6 + 3;
      // 奇数の3の倍数を2つずつ追加 //
    }
    
    if (quantity === 3) {
      outputArray[1] = 25;
      // quantity が 3 の場合、特定の値を設定する //
    }
    else if (quantity % 2 === 1 || quantity < 15000) {
      outputArray[quantity - 1] = 6;
      // quantity が 3 以外の奇数、または 15000 未満の場合、最後の要素を調整 //
    }
    
    // quantity が 15002 から 20000 の範囲である場合 //
    for (counter = 15000; counter < quantity; counter++) {
      outputArray[counter] = (counter - 14999) * 6;
      // 6の倍数を順番に追加 //
    }
  
    // 結果のリストを昇順にソート //
    outputArray.sort(
      function(itemA, itemB){
        return (itemA < itemB ? -1 : 1);
      }
    );
  
    // 最終結果の表示 //
    console.log(outputArray.join(" "));
  }
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));