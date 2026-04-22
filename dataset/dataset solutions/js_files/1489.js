function Main(input) {
  input = input.split("\n").map(v => v.split(" "));
  
  const n = toInt(input[0][0]);
  const q = toInt(input[0][1]);
  
  let str = "";
  for (let i = 0; i < n; i++) {
    str += "1";
  }
  
  str = str.split("");
  
  for (let i = 1; i < input.length; i++) {
    const l = toInt(input[i][0]) - 1;
    const r = toInt(input[i][1]) - 1;
    const d = input[i][2];
    
    let target = str.map((value, index) => {
      if (l <= index && index <= r) {
        return d;
      }
      return value;
    });
    
    target = toInt(target.join(''));
    console.log(target % 998244353);
  }
}

function toInt(v) {
    //return BigInt(v);
    return parseInt(v, 10);
}
// 魔法
Main(require("fs").readFileSync("/dev/stdin", "utf8"));