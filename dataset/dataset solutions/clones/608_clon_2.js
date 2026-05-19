var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var trimmedContent = fileContent.trim();

var lengthResults = [0];

trimmedContent.replace(/(J*)(O*)(I*)/g, function(entireMatch, jSequence, oSequence, iSequence) {
    if (jSequence.length >= oSequence.length && iSequence.length >= oSequence.length) {
        lengthResults.push(oSequence.length);
    }
    return "";
});

console.log(Math.max.apply(null, lengthResults));
