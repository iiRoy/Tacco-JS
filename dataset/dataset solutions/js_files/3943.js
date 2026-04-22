function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}

//0:何もしない  1:数値へ変換  2:半角SPで分割  3:改行で分割  4:半角SPで分割し、数値配列へ
//5:改行で分割し、数値配列へ  6:1文字に分割  7:1文字に分割し、数値配列へ
function myconv(i, no){
  switch(no){
    case 0: return i;
    case 1: return parseInt(i);
    case 2: return i.split(" ");
    case 3: return i.split("\n");
    case 4: return i.split(" ").map((a)=>Number(a));
    case 5: return i.split("\n").map((a)=>Number(a));
    case 6: return i.split("");
    case 7: return i.split("").map((a)=>Number(a));
  }}
function Main(input) {
  input = myconv(input, 3);
  var N = myconv(input[0], 1);
  var D = myconv(input[1], 4)[0];
  var X = myconv(input[1], 4)[1];
  let ans = 0;
  input.shift();
  input.shift();
  input = input.map((a)=>Number(a));
  for(let i = 0; i < N; i++){
    let tmp = 1;
    while (tmp <= D){
      ans++;
      tmp += input[i];
    }
  }
  console.log(ans + X);
}
Main(myin());