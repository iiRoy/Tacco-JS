'use strict'

const read = () => {
  function* iterInput() {
    const input = require('fs').readFileSync('/dev/stdin', 'utf8');
    for (const token of input.trim().split(/\s+/)) {
      yield token;
    }
  }
  const it = iterInput()
  return () => {
    return it.next().value
  }
}

const main = (next) => {
  const abc = Array.from({length: 3}).map(() => +next())
  abc.sort();
  console.log(abc[2] * 10 + abc[0] + abc[1]);
}


main(read());
