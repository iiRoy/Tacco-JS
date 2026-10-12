process.stdin.resume();
process.stdin.setEncoding("utf8");

const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lines = [];

reader.on("line", (line) => {
  lines.push(line);
});

reader.on("close", () => {
  const fields = lines[0];

  const fieldStack = [];
  const pondStack = [];
  const len = fields.length;
  for (let i = 0; i < len; i++) {
    const c = fields[i];
    if (c === "\\") {
      fieldStack.push(i);
    } else if (c === "/") {
      let j = fieldStack.pop();
      if (j != null) {
        let a = i - j;
        let pond = pondStack.pop();
        while (pond) {
          if (pond.first > j) {
            a += pond.area;
            pond = pondStack.pop();
          } else {
            pondStack.push(pond);
            break;
          }
        }
        pondStack.push({ area: a, first: j });
      }
    }
  }
  console.log(pondStack.reduce((prev, e) => prev + e.area, 0));
  let msg = "" + pondStack.length;
  if (pondStack.length > 0) {
    msg += " " + pondStack.map((e) => e.area).join(" ");
  }
  console.log(msg);
});

