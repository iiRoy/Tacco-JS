const fs = require("fs");

let value = Number(fs.readFileSync(0, "utf8").trim());
const letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","h","y","z"];
const out = [];

while (value !== 0) {
  value--;
  out.push(letters[value % 26]);
  value = Math.floor(value / 26);
}

process.stdout.write(out.reverse().join(""));