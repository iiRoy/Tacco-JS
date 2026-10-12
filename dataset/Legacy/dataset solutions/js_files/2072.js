
// inputに入力データ全体が入る
function Main(input) {
  input = input.split("\n")[0]

  tmp = input.split(' ').map(v=> parseInt(v))
  H = tmp[0]
  W = tmp[1]
  if(H ==1 || W ==1){
    t =1
  }else{
    t =  (H * W + 1) / 2
  }


  console.log(t);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
