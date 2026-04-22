function main(arg) {
  var X = parseInt(arg[0]);
  var amt = 100;
  var year = 0;
  while(amt < X) {
  	amt *= 1.01
    amt = Math.floor(amt)
    year ++;
  }
  console.log(year)
}

main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
