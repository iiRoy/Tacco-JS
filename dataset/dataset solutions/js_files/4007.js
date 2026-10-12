function Main(input) {
  const lines = input.trim().split(/\r?\n/);
  const secondLine = lines[1] ?? "";
  const values = secondLine.trim().split(/\s+/);

  if (values.indexOf("Y") !== -1) {
    console.log("Four");
  } else {
    console.log("Three");
  }
}

const fs = require("fs");
const input = fs.readFileSync("/dev/stdin", "utf8");

Main(input);