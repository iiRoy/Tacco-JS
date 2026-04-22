const iNput = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const direcTionMap = {
  'north': '0',
  'west': '1'
};

const calcUlateValue = (inPutString) => {
  const trimmedString = inPutString.trim();
  if (trimmedString === "#") {
    return null; 
  }

  let modIfiedString = trimmedString;
  for (const key in direcTionMap) {
    modIfiedString = modIfiedString.split(key).join(direcTionMap[key]);
  }

  const stringLeNgth = modIfiedString.length;

  if (stringLeNgth === 0) {
      return '0'; 
  }

  const maxVaLue = 90 * (1 << (stringLeNgth - 1));

  const finalSum = Array.from({ length: stringLeNgth }, (_, i) => i).reduce((acc, currentIdx) => {
    const charAtIdx = modIfiedString[currentIdx];
    const powerForIdx = stringLeNgth - 1 - currentIdx;
    const termValue = 90 * (1 << powerForIdx);

    let newSum;
    if (charAtIdx === '1') {
      newSum = Math.min(acc + termValue, maxVaLue);
    } else { 
      newSum = Math.max(acc - termValue, 0);
    }
    return newSum;
  }, 0);

  const reduceFraction = (num, pwr) => {
    if (pwr > 0 && num % 2 === 0) {
      return reduceFraction(num / 2, pwr - 1);
    }
    return { numVal: num, pwrVal: pwr };
  };

  const simplified = reduceFraction(finalSum, stringLeNgth - 1);

  if (simplified.pwrVal > 0) {
    return `${simplified.numVal}/${(1 << simplified.pwrVal)}`;
  } else {
    return `${simplified.numVal}`;
  }
};

const allResuLts = [];

iNput.on('line', (dataLine) => {
  const processedResult = calcUlateValue(dataLine);
  if (processedResult === null) {
    iNput.close();
    return;
  }
  allResuLts.push(processedResult);
});

iNput.on('close', () => {
  allResuLts.forEach(res => process.stdout.write(res + '\n'));
});