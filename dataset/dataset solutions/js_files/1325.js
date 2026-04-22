let content = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', buf => {
  content += buf;
});

process.stdin.on('end', () => {
  let [curAlpha, ...lines] = content.trim().split('\n');
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const h = parseInt(lines[i], 10);
    if (!isNaN(h)) {
      curAlpha = shuffle(curAlpha, h);
    } else {
      results.push(curAlpha);
      curAlpha = lines[i];
      i++;
    }
  }

  console.log(results.join('\n'));
});


const shuffle = (str, h) =>
  str.slice(h) + str.slice(0, h);


