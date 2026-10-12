require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
}).on("line", handleLine);

var toggle = false;

function handleLine(text) {
  if ((toggle = !toggle)) return;

  const values = text.split(" ").map(x => parseInt(x));
  const slopes = verify(...values);
  const answer = total(1, ...slopes);
  console.log(answer);
}

function verify(x, y, ...rest) {
  const direction = Math.sign(y - x);
  return isNaN(direction) ? [] : [direction, ...verify(y, ...rest)];
}

function total(num, x, y, ...rest) {
  if (typeof y == "undefined") return num;
  return (x != y) ? total(++num, ...rest) : total(num, x, ...rest);
}