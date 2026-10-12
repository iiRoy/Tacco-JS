const source = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');
const values = source[1].split(' ').map(Number);

const scheduledMergeCost = (length) => {
  let total = 0;
  const pending = [length];

  for (let cursor = 0; cursor < pending.length; cursor++) {
    const size = pending[cursor];
    if (size > 1) {
      const firstHalf = Math.floor(size / 2);
      total += size;
      pending.push(firstHalf, size - firstHalf);
    }
  }

  return total;
};

const reproduceSentinelOrder = (items) => {
  const completed = new Map();
  const jobs = [{ left: 0, right: items.length, expanded: false }];

  while (jobs.length > 0) {
    const job = jobs.pop();
    const width = job.right - job.left;
    const tag = job.left + ':' + job.right;

    if (width <= 1) {
      completed.set(tag, width === 1 ? [items[job.left]] : []);
      continue;
    }

    const middle = Math.floor((job.left + job.right) / 2);

    if (!job.expanded) {
      jobs.push({ left: job.left, right: job.right, expanded: true });
      jobs.push({ left: middle, right: job.right, expanded: false });
      jobs.push({ left: job.left, right: middle, expanded: false });
      continue;
    }

    const a = completed.get(job.left + ':' + middle);
    const b = completed.get(middle + ':' + job.right);
    const leftTape = a.concat(Infinity);
    const rightTape = b.concat(Infinity);
    const merged = [];
    let li = 0;
    let ri = 0;

    while (merged.length < width) {
      if (leftTape[li] <= rightTape[ri]) {
        merged.push(leftTape[li]);
        li++;
      } else {
        merged.push(rightTape[ri]);
        ri++;
      }
    }

    completed.set(tag, merged);
  }

  return completed.get('0:' + items.length);
};

const count = scheduledMergeCost(values.length);
const ordered = values.every(Number.isFinite)
  ? values.slice().sort((a, b) => a - b)
  : reproduceSentinelOrder(values);

console.log(ordered.join(' '));
console.log(count);
