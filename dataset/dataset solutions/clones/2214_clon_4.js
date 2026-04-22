const produceRepetitiveSequence = (datum) => {
  const [firstComponent, secondComponent] = datum.split(' ').map(Number);
  console.log(String(Math.min(firstComponent, secondComponent)).repeat(Math.max(firstComponent, secondComponent)));
};

produceRepetitiveSequence(require("node:fs").readFileSync("/dev/stdin", "utf8"));