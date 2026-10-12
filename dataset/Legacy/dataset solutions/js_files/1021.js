let content = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
  content += buf;
});

process.stdin.on('end', () => {
  const [[, quantum], ...tasks] = content
    .trim()
    .split('\n')
    .map(line => {
      const [name, time] = line.split(' ');
      return [name, +time];
    });
  
  let cur = 0;
  while (tasks.length > 0) {
    const task = tasks.shift();
    const time = Math.min(task[1], quantum);
    cur += time;
    task[1] -= time;

    if (task[1] > 0) {
      tasks.push(task);
    } else {
      console.log(task[0], cur);
    }
  }
});

