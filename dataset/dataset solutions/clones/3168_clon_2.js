let dateComponents = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split('/')
  .map(Number);

console.log(
  dateComponents[0] >= 2019 && dateComponents[1] >= 5
    ? 'TBD'
    : 'Heisei'
);
