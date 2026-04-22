function Main (input) {
  let a = input.split("\n")[0].split(" ")[0];
  let v = input.split("\n")[0].split(" ")[1];
  let b = input.split("\n")[1].split(" ")[0];
  let w = input.split("\n")[1].split(" ")[1];
  let t = input.split("\n")[2];

  let distance = 0;
  if (a > b) {
    distance = a - b;
  } else distance = b - a;
  
  let shortened = v - w;
  
  for (let i = 0; i <= t; i++) {
    if (i != 0) distance -= shortened;
    if (distance == 0) break;
  }
  
  if (distance == 0) {
    console.log("YES")
  } else console.log("NO");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));