function Main (input) {
  input = input.split("\n").map(Number);
  var N = input[0];
  input.pop();
  input.shift();
  var now_j = [input[0]];
  input.shift();
  input.forEach (i => {
    if (now_j.some(inp => inp == i)) {
      now_j.splice(now_j.indexOf(i), 1);
    }
    else {
      now_j.push(i);
    }
  });
  console.log(now_j.length);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));