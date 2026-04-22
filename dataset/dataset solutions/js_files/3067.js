function main(i) {
  i = i.split('\n');
  const a = [];
  f = i.map(n => {
    if (Number(n) % 10 === 0) {
      return [Number(n), 10];
    }
    return [Number(n), Number(n) % 10];
  });
  f.sort((a, b) => a[1] - b[1]);
  var answer = 0;
  f.forEach((item, index) => {
    if (index === 0) {
      answer += item[0];
    } else {
      answer += Math.ceil(item[0] / 10) * 10;
    }
  });
  console.log(answer);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));