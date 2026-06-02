let inputNum = parseInt(require('fs').readFileSync('/dev/stdin', 'ascii'));

let resultArray = [];
for (let counter = 1; counter <= inputNum; counter++) {
    if (counter % 3 === 0 || String(counter).indexOf('3') !== -1) {
        resultArray.push(counter);
    }
}
console.log(resultArray.join(" "));
