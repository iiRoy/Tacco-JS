function main(input) {
 
  if (input.join('') == 'AAA' || input.join('') == 'BBB') {
  	console.log('No');
    return;
  }
  console.log('Yes');
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'));