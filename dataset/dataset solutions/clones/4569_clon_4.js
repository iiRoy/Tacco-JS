const fs = require("fs");

const [h, w] = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);

function spread(a, b, c) {
  return Math.max(a, b, c) - Math.min(a, b, c);
}

function check(height, width) {
  let best = height * width;

  for (let cut = 1; cut < height; cut++) {
    const first = cut * width;
    const restH = height - cut;

    const secondH = Math.floor(restH / 2) * width;
    const thirdH = Math.ceil(restH / 2) * width;
    best = Math.min(best, spread(first, secondH, thirdH));

    const secondW = restH * Math.floor(width / 2);
    const thirdW = restH * Math.ceil(width / 2);
    best = Math.min(best, spread(first, secondW, thirdW));
  }

  return best;
}

let ans = Math.min(check(h, w), check(w, h));

process.stdout.write(String(ans));