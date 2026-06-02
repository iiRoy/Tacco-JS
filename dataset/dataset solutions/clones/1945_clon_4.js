function main(source) {
  const records = source.split('\n');
  records.shift();

  const ordered = records.slice().sort();
  let groups = 0;
  let previous;

  for (let i = 0; i < ordered.length; i++) {
    if (i === 0 || ordered[i] !== previous) {
      groups++;
      previous = ordered[i];
    }
  }

  console.log(groups);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
