const adjacentNotes = {
  "DO":   ["DO#", "RE", "RE#"],
  "DO#":  ["RE", "RE#", "MI"],
  "RE":   ["RE#", "MI", "FA"],
  "RE#":  ["MI", "FA", "FA#"],
  "MI":   ["FA", "FA#", "SOL"],
  "FA":   ["FA#", "SOL", "SOL#"],
  "FA#":  ["SOL", "SOL#", "LA"],
  "SOL":  ["SOL#", "LA", "LA#"],
  "SOL#": ["LA", "LA#", "SI"],
  "LA":   ["LA#", "SI", "DO"],
  "LA#":  ["SI", "DO", "DO#"],
  "SI":   ["DO", "DO#", "RE"]
};

const fs = require("fs");
const requestedNote = fs
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .toUpperCase();

const result = adjacentNotes[requestedNote];

if (result) {
  console.log(result.join(" "));
} else {
  console.log("NOT_FOUND");
}