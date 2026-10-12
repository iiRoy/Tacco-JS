function processData(rawData) {
  const lines = rawData.split('\n');

  const firstLineParts = lines[0].split(' ');
  const limitValue = parseInt(firstLineParts[0], 10);
  const countPlaceholder = parseInt(firstLineParts[1], 10);

  const secondLineParts = lines[1].split(' ');
  let totalConsumed = 0;

  for (const itemStr of secondLineParts) {
    const currentItem = parseInt(itemStr, 10);
    totalConsumed += currentItem;
  }

  const remaining = limitValue - totalConsumed;

  if (remaining < 0) {
    console.log(-1);
  } else {
    console.log(remaining);
  }
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
