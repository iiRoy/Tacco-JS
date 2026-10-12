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
  const A = myconv(input[0], 4)[0];
  const B = myconv(input[0], 4)[1];
  const M = myconv(input[0], 4)[2];
  const list_a = myconv(input[1], 4);
  const list_b = myconv(input[2], 4);
  input.shift();
  input.shift();
  input.shift();

  a = Math.min.apply(null, list_a);
  b = Math.min.apply(null, list_b);
  let m = a + b;

  len = input.length;
  for(let i = 0; i < len; i++){
    let x = myconv(input[i], 4)[0] - 1;
    let y = myconv(input[i], 4)[1] - 1;
    let c = myconv(input[i], 4)[2];
    let deals = list_a[x] + list_b[y] - c;
    if (deals < m) {
      m = deals;
    }
  }
  console.log(m);
}
Main(myin());