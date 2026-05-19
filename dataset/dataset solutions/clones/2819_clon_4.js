((inputSource) => {
    console.log(require('fs').readFileSync(inputSource, 'utf8'));
})('/dev/stdin');

let outcomeValue = (X >= A) * 10;

console.log(outcomeValue);
