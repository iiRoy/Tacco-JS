function Main(input) {
  if (input.slice(0, 1) == input.slice(2, 0) || input.slice(1, 0) == input.slice(-1)) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));