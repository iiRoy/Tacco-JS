const processData = (rawData) => {
  const lines = rawData.split('\n').filter(Boolean);

  const numberCount = Number(lines[0]);
  const numericElements = lines[1].split(' ').map(Number);

  const checkAscendingOrder = (dataArray) => {
    return dataArray.every((current, index, arr) => {
      return index === arr.length - 1 || current <= arr[index + 1];
    });
  };

  if (checkAscendingOrder(numericElements)) {
    console.log('YES');
    return;
  }

  let firstDisplacement = -1;
  let lastDisplacement = -1;

  for (let idx = 0; idx < numberCount - 1; idx++) {
    if (numericElements[idx] > numericElements[idx + 1]) {
      firstDisplacement = idx;
      break;
    }
  }

  for (let idx = numberCount - 1; idx > 0; idx--) {
    if (numericElements[idx] < numericElements[idx - 1]) {
      lastDisplacement = idx;
      break;
    }
  }

  if (firstDisplacement !== -1 && lastDisplacement !== -1) {
    const trialArray = [...numericElements];
    
    let tempValue = trialArray[firstDisplacement];
    trialArray[firstDisplacement] = trialArray[lastDisplacement];
    trialArray[lastDisplacement] = tempValue;

    if (checkAscendingOrder(trialArray)) {
      console.log('YES');
      return;
    }
  }

  console.log('NO');
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));