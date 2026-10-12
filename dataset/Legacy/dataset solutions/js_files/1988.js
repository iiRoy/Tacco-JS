function gcd(arr) {
  const unit = (a, b) => b ? unit(b, a % b) : a
  let gcd = arr[0]
  for (let i = 1; i < arr.length; i++) {
    gcd = unit(gcd, arr[i]); 
  }
  return gcd;
}

function Main(input) {
  let result = 0;
  for(let a = 1; a < parseInt(input) + 1; a++) {
    for(let b = 1; b < parseInt(input) + 1; b++) {
      for(let c = 1; c < parseInt(input) + 1; c++) {
        result += gcd([a, b, c]);
      }
    }   
  }
  console.log(result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));