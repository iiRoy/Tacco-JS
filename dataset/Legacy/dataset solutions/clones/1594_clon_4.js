function ProcessInput(dataString) {
  const valueRegistry = new Map([
    ['RRS', 2],
    ['SRR', 2],
    ['RRR', 3],
    ['SSS', 0]
  ]);

  const computedValue = valueRegistry.has(dataString) ? valueRegistry.get(dataString) : 1;

  console.log('%d', computedValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
