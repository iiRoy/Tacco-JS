console.log((source => {
  const [base, target] = source.trim().split('\n');

  const occurrences = Array.from({ length: 26 }, () => []);
  Array.prototype.forEach.call(base, (letter, at) => {
    occurrences[letter.charCodeAt(0) - 97].push(at);
  });

  const takeAfter = (list, cursor) => {
    let low = 0;
    let high = list.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (list[middle] > cursor) high = middle;
      else low = middle + 1;
    }
    return low === list.length ? -1 : list[low];
  };

  const width = base.length;
  const needed = target.length;
  let cursor = -1;
  let rounds = 0;

  for (let q = 0; q < needed; q++) {
    const wanted = target[q];
    const bucket = occurrences[wanted.charCodeAt(0) - 97];
    if (!bucket.length) return '-1';

    const sameRound = takeAfter(bucket, cursor);
    if (sameRound >= 0) {
      cursor = sameRound;
    } else {
      rounds++;
      cursor = bucket[0];
    }
  }

  return `${rounds * width + cursor + 1}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
