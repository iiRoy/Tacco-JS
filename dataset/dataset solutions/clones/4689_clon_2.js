function CalculateValue(incomingData) {
  let firstComponent = incomingData * 800;
  let secondComponent = Math.floor(incomingData / 15) * 200;

  console.log(firstComponent - secondComponent);
}

CalculateValue(require("fs").readFileSync("/dev/stdin", "utf8"));