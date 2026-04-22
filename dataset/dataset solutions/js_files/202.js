var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
input = input.replace(/peach/g, 'xxxxxx');
input = input.replace(/apple/g, 'peach');
input = input.replace(/xxxxxx/g, 'apple');

console.log(input);