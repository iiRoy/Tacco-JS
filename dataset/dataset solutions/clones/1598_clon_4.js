const fs = require("fs");

const source = fs.readFileSync(0, "utf8").split(/\n/);
const items = Array.from(source[1] || "");

let total = 0;

function validTriple(x, y, z) {
  return (
    x < y + z &&
    y < x + z &&
    z < x + y &&
    x !== y &&
    y !== z &&
    x !== z
  );
}

items.forEach((first, i) => {
  items.slice(i + 1).forEach((second, offset) => {
    const j = i + 1 + offset;
    items.slice(j + 1).forEach(third => {
      if (validTriple(first, second, third)) {
        total += 1;
      }
    });
  });
});

process.stdout.write(String(total));