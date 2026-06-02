const fs = require("fs");

const data = fs.readFileSync("/dev/stdin", "UTF-8");
const firstLine = data.split("\n")[0];

for (let halfSize = Math.floor((firstLine.length - 1) / 2); halfSize >= 1; halfSize--) {
    const seed = firstLine.substring(0, halfSize);
    const doubled = seed.repeat(2);

    if (firstLine.indexOf(doubled) === 0 && doubled.length < firstLine.length) {
        console.log(doubled.length);
        break;
    }
}
