const fs = require('fs');

const lines = fs.readFileSync('/dev/stdin', 'utf8').split(/\n/);
const values = lines.map((line) => +line);
const limit = values.findIndex((value) => !value);
const active = values.slice(0, limit < 0 ? values.length : limit);

const int32Cell = new Int32Array(1);
const answers = active.map((value) => {
  int32Cell[0] = value * value / 98 + 2;
  return String(int32Cell[0]);
});

if (answers.length) {
  process.stdout.write(answers.join('\n') + '\n');
}
