let input = require('fs').readFileSync('/dev/stdin', 'utf8');

const data = input.split("\n");
const [peopleNum, flowTime] = data[0].split(' ');
const pushTimes = data[1].split(' ');

let rTime = 0;

for (let i = 0; i < parseInt(peopleNum, 10); i++) {
  const diffTime = i === 0 ? 0 : parseInt(pushTimes[i], 10) - parseInt(pushTimes[i - 1], 10);
  if (diffTime < parseInt(flowTime, 10) && diffTime !== 0) {
    rTime += diffTime;
  } else {
    rTime += parseInt(flowTime, 10);
  }
}

console.log(rTime);
