function Main(input) {
  input = input.split("\n").map(v => v.split(" "));
  const n = input[0][0];
  
  const roop = (curent, x, y) => {
    // 現在地含むなので1から開始
    let counter = 1;
    for (let i = 1; i <= n; i++) {
      if (curent === i) {
        continue;
      }
      const px = input[i][0], py = input[i][1];
      if ((x < px && y < py) || (px < x && py < y)) {
        //console.log(px, py);
        counter++;
      }
    }
    return counter;
  };
  
  for (let i = 1; i <= n; i++) {
    //console.log("xxxxxxx");
    console.log(roop(i, input[i][0], input[i][1]));
  }
}
// 魔法
Main(require("fs").readFileSync("/dev/stdin", "utf8"));