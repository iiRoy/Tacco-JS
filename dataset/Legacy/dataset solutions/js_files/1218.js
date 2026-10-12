let x = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const a = Number(x.split(' ')[0]);
const b = Number(x.split(' ')[1]);
const c = Number(x.split(' ')[2]);
if (a < b && b < c) {
  console.log('Yes');
} else {
  console.log('No');
};

