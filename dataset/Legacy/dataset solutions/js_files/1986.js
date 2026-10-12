// inputに入力データ全体が入る
function Main(input) {
  const gcd = (a,b,c) => {
    // 最大公約数を求める
    let ans = 0;

    for( let i = 1 ; i <= 200 ; i++ ){
      if( a % i === 0 && b % i === 0 && c % i === 0){
        ans = i;
      }
    }

    return ans ;
  };

  // 1行目がinput[0], 2行目がinput[1], …に入る
  inputs = input.split("\n");

  const K = Number(inputs[0]);

  // const tupples = [];
  let sum = 0 ;
  for( let a = 1 ; a <= K ; a++ ){
    for( let b= 1 ; b <= K ; b++ ){
      for( let c= 1 ; c <= K ; c++ ){
        sum += gcd(a,b,c);
      }
    }
  }

  console.log(sum);


}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
