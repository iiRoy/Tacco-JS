//let input = "1000000000000000 1000000000000000 1000000000000000"; // x k d 初期座標　回数　一度に動ける

function main(input){
  input = input.trim();
  let list = input.split(" ");
  let x = parseInt(list[0]);
  let k = parseInt(list[1]);
  let d = parseInt(list[2]);
  let kaisuu = Math.floor(x/d);
  let nokoriKaisuu = k - kaisuu;
  if(kaisuu>k){
    kaisuu=k;
  }else if(nokoriKaisuu%2===0){
    // 何もしない
  }else if(nokoriKaisuu%2===1){
    if(0<d*nokoriKaisuu){
      kaisuu+=1;
    }else{
      kaisuu-=1;
    }
  }
  let answer = Math.abs(x - d*kaisuu);
  console.log(answer);
}
//main(input);
main(require("fs").readFileSync("/dev/stdin", "utf8"));