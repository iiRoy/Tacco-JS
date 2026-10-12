const systemConfig = { inputSource: '/dev/stdin', lineSeparator: '\n' };

const rawInputContent = require('fs').readFileSync(systemConfig.inputSource, 'ascii').trim();
const processedLines = rawInputContent.split(systemConfig.lineSeparator).slice(1);

let firstPlayerScore = 0;
let secondPlayerScore = 0;

for (const matchRecord of processedLines) {
    const [scoreStringA, scoreStringB] = matchRecord.split(' ');
    const numericScoreA = Number(scoreStringA);
    const numericScoreB = Number(scoreStringB);

    firstPlayerScore += (numericScoreA > numericScoreB) ? 3 : (numericScoreA === numericScoreB ? 1 : 0);
    secondPlayerScore += (numericScoreB > numericScoreA) ? 3 : (numericScoreA === numericScoreB ? 1 : 0);
}

console.log(firstPlayerScore + ' ' + secondPlayerScore);
