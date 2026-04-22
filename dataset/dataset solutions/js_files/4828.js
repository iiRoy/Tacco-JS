"use strict";
function Main(input) {
  const arr = ["dream", "dreamer", "erase", "eraser"];

  for (let i in arr) {
    arr[i] = reverse(arr[i]);
  }
  input = reverse(input);
  while (true) {
    let i = 0;
    for (let s of arr) {
      var a = input.slice(0, s.length);
      if (a === s) {
        input = input.substr(s.length);
        break;
      }
      i++;
    }
    if (i > 3) {
      break;
    }
  }
  if (input === "") {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

function reverse(str) {
  return str.split("").reverse().join("");
}

Main(require("fs").readFileSync("/dev/stdin", "utf-8"));
