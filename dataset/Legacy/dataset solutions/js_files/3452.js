// inputに入力データ全体が入る
function Main(input) {
    // 1行目がinput[0], 2行目がinput[1], …に入る
    input = input.split("\n");
    tmp0 = input[0].split(" ");
    n = Number(tmp0[0]);
    tmp1 = input[1].split(" ");
    t = Number(tmp1[0]);
    a = Number(tmp1[1]);
    tmp2 = input[2].split(" ");

    h = Number(tmp2[0]);
    h= t-h*0.006;
//  console.log(h);
    min = 　Math.abs(h-a);　
    ans=1;
    for(i=1;i<n;i++){
        h = Number(tmp2[i]);
           h= t-h*0.006;
  //    console.log(h);
           if( min > Math.abs(h-a)){ans=i+1}
         
    }
   console.log(ans);
}
    
  //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));
//   