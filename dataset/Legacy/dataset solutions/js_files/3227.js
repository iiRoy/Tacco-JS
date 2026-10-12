const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const includes = (arr, a) => {
  if (arr.indexOf(a) >= 0) {
    return true;
  } else {
    return false;
  }
};

const list1 = input.split('\n')[0];
const list2 = input.split('\n')[1];

const n = Number(list1.split(' ')[0]);
const m = Number(list1.split(' ')[1]);

const numberlist = list2.split(' ').map(i => Number(i));

const sorted = numberlist.sort((a,b) => a - b);

var minuslist = [];

for (var i = 0; i < m-1; i++) {
  minuslist.push(sorted[i+1]-sorted[i]);　//m-1個の配列
}

const sortedminus　=　minuslist.sort((a,b) => a-b);

const maxarr = sortedminus.slice(m - n);

if (maxarr.length !== 0) {
  var maxarrsum = maxarr.reduce((p, c) => {
    return p + c;
  })

  var answer = Math.max.apply(null, numberlist) - Math.min.apply(null, numberlist) - maxarrsum;
} else {
  var answer = 0;
}


const output = () => {
  if (n >= m) {
    console.log(0);
    return;
  }
  console.log(answer);
  return;
}

output();
