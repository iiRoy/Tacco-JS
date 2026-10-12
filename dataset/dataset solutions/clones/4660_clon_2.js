function transferDisks(amount, origin, helper, destination, steps) {
  if (amount === 0) {
    return;
  }

  transferDisks(
    amount - 1,
    origin,
    destination,
    helper,
    steps
  );

  steps.push(`${origin} -> ${destination}`);

  transferDisks(
    amount - 1,
    helper,
    origin,
    destination,
    steps
  );
}

const diskAmount = Number(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
);

const steps = [];

transferDisks(
  diskAmount,
  "A",
  "B",
  "C",
  steps
);

console.log(steps.join("\n"));