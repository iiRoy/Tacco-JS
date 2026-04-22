// inputに入力データ全体が入る
function Main(input) {
  input = input.split("\n");
  const N = input.shift();
  S = input
  obj = {}

  S.forEach(v=>{
    obj[v] ? obj[v]+= 1 : obj[v] = 1
  })
  tmp = Object.keys(obj)
  tmp = tmp.sort((a,b)=> O[b] - O[a])
  len = obj[tmp[0]]
  tmp.filter(v=> v == len)
  while(true){
    if( tmp.length == 0){
      break;
    }
    console.log(tmp.shift())
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
