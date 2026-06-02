const inputData = require('fs')
  .readFileSync('/dev/stdin', 'utf8');

if (inputData === '3' || inputData === '5' || inputData === '7') {
  console.log('YES');
} else {
  console.log('NO');
}
