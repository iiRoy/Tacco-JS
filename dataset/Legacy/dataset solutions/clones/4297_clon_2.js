const solve = data => data.split("\n").slice(1).filter(row => row).map(text => text.split("")).map((chars, r, board) => chars.map((cell, c) => cell === "#" ? "#" : [r - 1, r, r + 1].filter(pos => board[pos]).map(pos => [c - 1, c, c + 1].map(k => board[pos][k] === "#" ? 1 : 0).reduce((x, y) => x + y)).reduce((x, y) => x + y)).join("")).join("\n");

console.log(solve(require("fs").readFileSync("/dev/stdin", "utf8")));
