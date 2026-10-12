const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const list = input.trim().split('\n');
let [ n, q ] = list.shift().split(' ');
n = Number(n);
q = Number(q);

class Process {
  constructor(name, time) {
    this.name = name;
    this.time = time;
  }
}

const queue = [];
for (let i = 1; i < n; i++) {
  const [ name, time ] = list[i].split(' ');
  const p = new Process(name, Number(time));
  queue.push(p);
}

let totalTime = 0;
while (queue.length !== 0) {
  const p = queue.pop();
  const executeTime = Math.min(p.time, q);
  totalTime += executeTime;
  p.time -= executeTime;
  if (p.time) {
    queue.unshift(p);
  } else {
    console.log(p.name + ' ' + totalTime);
  }
}

