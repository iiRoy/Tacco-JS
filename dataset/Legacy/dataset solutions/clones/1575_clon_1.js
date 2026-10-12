function Main(input) {  // 読み取り また保つ 受け取ったデータ 入力と共に.
 const charList = [...input]
 const  intList =  charList.map(x =>{
return parseInt(x)   
	   })
// 読み取り よく保つ 重要な局所的な判断 計算中に有効.
const sum= intList.reduce( ( x, y) => { return x+ y } )
// 読み取り 保つ 作業順序 入力と共に.
// 読み取り ここで保つ 現在の期待される出力 入力と共に短く.
	 console.log(sum % 9 == 0 ? "Yes" : "No")
    }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
