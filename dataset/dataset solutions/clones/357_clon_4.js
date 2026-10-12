const fs = require("fs");

const tokens = fs.readFileSync(0, "utf8").trim().split(/\n/);
let line = 0;
let answers = [];

while (line < tokens.length) {
  const size = tokens[line++].trim().split(/\s+/).map(Number);
  const height = size[0];
  const width = size[1];

  if (height === 0 && width === 0) {
    break;
  }

  const field = [];
  for (let i = 0; i < height; i++) {
    field.push(tokens[line++].trim().split(""));
  }

  const seen = Array.from({ length: height }, () => Array(width).fill(false));
  let groups = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mark = field[y][x];

      if (seen[y][x] || (mark !== "@" && mark !== "#" && mark !== "*")) {
        continue;
      }

      groups++;

      const stack = [[y, x]];
      seen[y][x] = true;

      while (stack.length > 0) {
        const cell = stack.pop();
        const cy = cell[0];
        const cx = cell[1];

        const next = [
          [cy - 1, cx],
          [cy + 1, cx],
          [cy, cx - 1],
          [cy, cx + 1],
        ];

        for (let i = 0; i < next.length; i++) {
          const ny = next[i][0];
          const nx = next[i][1];

          if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
            continue;
          }

          if (!seen[ny][nx] && field[ny][nx] === mark) {
            seen[ny][nx] = true;
            stack.push([ny, nx]);
          }
        }
      }
    }
  }

  answers.push(String(groups));
}

process.stdout.write(answers.join("\n"));