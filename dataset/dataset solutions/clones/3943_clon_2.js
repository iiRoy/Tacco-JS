function readAll(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}

//0:そのまま  1:整数化  2:空白分割  3:改行分割  4:空白分割して数値化
//5:改行分割して数値化  6:文字分割  7:文字分割して数値化
function convert(v, kind){
  switch(kind){
    case 0: return v;
    case 1: return parseInt(v);
    case 2: return v.split(" ");
    case 3: return v.split("\n");
    case 4: return v.split(" ").map((x)=>Number(x));
    case 5: return v.split("\n").map((x)=>Number(x));
    case 6: return v.split("");
    case 7: return v.split("").map((x)=>Number(x));
  }}
function Solve(src) {
  src = convert(src, 3);
  var n = convert(src[0], 1);
  var d = convert(src[1], 4)[0];
  var x = convert(src[1], 4)[1];
  let total = 0;
  src.shift();
  src.shift();
  src = src.map((x)=>Number(x));
  for(let p = 0; p < n; p++){
    let day = 1;
    while (day <= d){
      total++;
      day += src[p];
    }
  }
  console.log(total + x);
}
Solve(readAll());
