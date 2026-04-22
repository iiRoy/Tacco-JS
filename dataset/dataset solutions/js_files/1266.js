function Main(input) {
  const args = input.trim().split("\n");

  let n = args.length;
  for (let i = 0; i < n; i++) {
    let tmp = args[i].split(" ").map((x) => Number(x));
    let h = tmp[0];
    let w = tmp[1];
    if (h === 0 && w === 0) {
      break;
    }
    let s = "";
    let t = "";
    for (let x = 0; x < w; x++) {
      if (x % 2 === 0) {
        s += "#";
        t += ".";
      } else {
        s += ".";
        t += "#";
      }
    }
    for (let y = 0; y < h; y++) {
      if (y % 2 === 0) {
        console.log(s);
      } else {
        console.log(t);
      }
    }
    console.log();
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
