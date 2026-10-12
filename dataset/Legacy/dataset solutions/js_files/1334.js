let content = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
  content += buf;
});

process.stdin.on('end', () => {
  const points = [0, 0];
  let [str, opSize, ...codes] = content.trim().split('\n');

  const ops = codes.map(code => {
    const [op, ...args] = code.split(' ');
    if (op === 'print' || op === 'reverse') {
      return {op, args: args.map(n => parseInt(n, 10))};
    } else {
      const [a, b, str] = args;
      return {
        op,
        args: [parseInt(a, 10), parseInt(b, 10), str],
      };
    }
  });

  ops.forEach(({op, args}) => {
    switch (op) {
      case 'print': {
        return console.log(str.slice(args[0], args[1] + 1));
      }
      case 'reverse': {
        str = reverse(str, ...args);
        return;
      }
      case 'replace': {
        str = replace(str, ...args);
        return;
      }
    }
  });
});

const reverse = (str, a, b) =>
  str.substring(0, a) +
  str
    .substring(a, b + 1)
    .split('')
    .reverse()
    .join('') +
  str.substring(b + 1);

const replace = (str, a, b, replacement) =>
  str.substring(0, a) + replacement + str.substring(b + 1);
