function SequenceMaker()
{
  var validPatterns = {};
  var componentStrings = "123,234,345,456,567,678,789,111,222,333,444,555,666,777,888,999" .split (',');
  var suffixStrings    = "11,22,33,44,55,66,77,88,99".split(',');

  for( var idx1 = 0; idx1 < 16; idx1++ )
  for( var idx2 = 0; idx2 < 16; idx2++ )
  for( var idx3 = 0; idx3 < 16; idx3++ )
  for( var idx4 = 0; idx4 < 16; idx4++ )
  for( var idx5 = 0; idx5 < 9;  idx5++ )
  {
     let rawSequence = componentStrings[idx1] + componentStrings[idx2] + componentStrings[idx3] + componentStrings[idx4] + suffixStrings[idx5];
     rawSequence = rawSequence.split("").map(Number).sort(function(x, y) { return x - y; }).join("");
     validPatterns[rawSequence] = true;
  }
  return validPatterns;
}

const patternMap = SequenceMaker();

let fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let problemStatements = (fileContent.trim()).split("\n");

while (true)
{
    if (problemStatements.length === 0)
    {
        break;
    }

    var currentProblem = problemStatements.shift();
    const possibleDigits = [];

    for (let testDigit = 0; testDigit < 9; testDigit++)
    {
        let testSequence = currentProblem.split("").map(Number);
        testSequence.push(testDigit);
        testSequence.sort( (elementA, elementB) => elementA - elementB );

        const digitCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        testSequence.forEach( (item) => { digitCounts[item]++; } );
        let maxFrequency = Math.max.apply(null, digitCounts);

        if (maxFrequency >= 5)
        {
            continue;
        }

        if (patternMap.hasOwnProperty(testSequence.join("")))
        {
            possibleDigits.push(testDigit);
        }
    }

    console.log( (possibleDigits.length === 0) ? "0" : possibleDigits.join(" ") );
}