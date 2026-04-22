function main(input) {
  const S = input;
  if (S === 'A') {
    console.log('T');
  } else if (S === 'T') {
    console.log('A');
  } else if (S === 'C') {
    console.log('G');
  } else {
    console.log('C');
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));