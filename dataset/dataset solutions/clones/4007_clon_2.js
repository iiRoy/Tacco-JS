function printTeamSize(source) {
  const rows = source.trim().split(/\r?\n/);
  const candidateRow = rows[1] ?? "";
  const answers = candidateRow.trim().split(/\s+/);

  if (answers.indexOf("Y") !== -1) {
    console.log("Four");
  } else {
    console.log("Three");
  }
}

const fileSystem = require("fs");
const rawData = fileSystem.readFileSync("/dev/stdin", "utf8");

printTeamSize(rawData);