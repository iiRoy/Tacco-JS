// inputに入力データ全体が入る
function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
	tmp = input.split(" ");
	//文字列から10進数に変換するときはparseIntを使います
  var getResult = input => {
    var m = parseInt(input[0])
    var n = parseInt(input[1])
    console.log((m-2)*(n-2))
    return
    var count = 0

    var check = input =>{
      var str = input.toString()
      var str1 = str.slice(Math.floor(str.length/2))
      var str2 = str.slice(0,Math.floor(str.length/2)+1).split("").reverse().join("")
      if(str1 == str2)
        return true
      else {
        return false
      }
    }

    for(var i = a;i <= b;i++){
      if(check(i))
        count++;
    }

    console.log(count)

  }


  getResult(tmp)
	//出力

}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
