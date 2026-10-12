const resultValue = (function() {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const firstLine = fileContent.split('\n').at(0);
    const numericValue = Number(firstLine);
    return Math.floor(numericValue / 2) * Math.ceil(numericValue / 2);
})();

console.log(resultValue);
