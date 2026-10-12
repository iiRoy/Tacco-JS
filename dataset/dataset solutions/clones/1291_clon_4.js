const fs = require("fs");

const records = fs.readFileSync(0, "utf8").trimEnd().split(/\n/);
const grades = [];

for (const record of records) {
  if (Number(record) === 0) break;

  const scores = record.trim().split(/\s+/).map(Number);
  if (scores[0] === -1 && scores[1] === -1 && scores[2] === -1) break;

  const written = (scores[0] < 0 ? 0 : scores[0]) + (scores[1] < 0 ? 0 : scores[1]);
  const retry = scores[2];

  let rank;
  switch (true) {
    case written >= 80:
      rank = "A";
      break;
    case written >= 65:
      rank = "B";
      break;
    case written >= 50:
      rank = "C";
      break;
    case written >= 30 && retry >= 50:
      rank = "C";
      break;
    case written >= 30:
      rank = "D";
      break;
    default:
      rank = "F";
  }

  grades.push(rank);
}

process.stdout.write(grades.join("\n"));