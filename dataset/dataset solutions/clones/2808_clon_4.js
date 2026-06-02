function run(source) {
  const rows = source.split('\n');

  rows.forEach(row => {
    if (row.length === 0) {
      return;
    }

    const columns = row.split(' ');
    const job = {
      left: parseInt(columns[0], 10),
      right: parseInt(columns[1], 10),
      firstStep: parseInt(columns[2], 10),
      secondStep: parseInt(columns[3], 10)
    };

    console.log(scoreInterval(job));
  });
}

function scoreInterval(job) {
  const markers = [
    { every: job.firstStep, value: -1 },
    { every: job.secondStep, value: -1 },
    { every: job.firstStep * job.secondStep, value: 1 }
  ];

  return markers.reduce((answer, marker) => {
    return answer + marker.value * hitsInside(job.left, job.right, marker.every);
  }, job.right - job.left + 1);
}

function hitsInside(left, right, step) {
  if (!(step > 0) || left > right || !Number.isFinite(left) || !Number.isFinite(right)) {
    return Math.floor(right / step) - Math.floor((left - 1) / step);
  }

  const shift = left % step;
  const first = shift === 0 ? left : left + step - shift;
  if (first > right) {
    return 0;
  }

  const last = right - (right % step);
  return (last - first) / step + 1;
}

run(require('fs').readFileSync('/dev/stdin', 'utf8'));
