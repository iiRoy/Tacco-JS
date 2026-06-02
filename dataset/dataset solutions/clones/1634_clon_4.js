process.stdin.resume();
process.stdin.setEncoding('utf8');

const received = [];
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.on('line', function(line) {
  received.push(line);
});

readline.on('close', function() {
  const header = received[0].split(" ").map(function(token) { return token - 0; });
  const count = header[0];
  const allowance = header[1];
  const values = received[1].split(" ").map(function(token) { return token - 0; });
  values.sort(function(left, right) { return right - left; });

  const highest = values[0];
  if (!(0 <= highest)) {
    console.log(highest);
    return;
  }

  let result = highest;
  let candidate = highest;

  while (candidate >= 0) {
    let needed = 0;
    let acceptable = true;

    let offset = 0;
    while (offset < count) {
      needed += Math.ceil(values[offset] / candidate) - 1;
      if (needed > allowance) {
        acceptable = false;
        break;
      }
      offset += 1;
    }

    if (!acceptable) {
      break;
    }
    result = candidate;
    candidate -= 1;
  }

  console.log(result);
});
