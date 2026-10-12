const data = require("fs").readFileSync(0, "utf8").trim().split(/\n/);

let weightedTotal = 0;
let amountTotal = 0;

for (const row of data) {
  const parts = row.split(",");
  weightedTotal += Number(parts[0]) * Number(parts[1]);
  amountTotal += Number(parts[1]);
}

const roundedAverage = Math.trunc(amountTotal / data.length + 0.5);

process.stdout.write(String(weightedTotal) + "\n" + String(roundedAverage));