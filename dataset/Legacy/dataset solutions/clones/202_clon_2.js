var processedText = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

processedText = processedText.replace(/peach/g, 'xxxxxx');
processedText = processedText.replace(/apple/g, 'peach');
processedText = processedText.replace(/xxxxxx/g, 'apple');

console.log(processedText);
