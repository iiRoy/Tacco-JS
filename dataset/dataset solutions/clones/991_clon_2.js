const appSettings = {  sourceFile: '/dev/stdin', lineDelimiter: '\n'  };
const valueA = require('fs') . readFileSync(appSettings.sourceFile, 'utf8')  . split(appSettings.lineDelimiter);
const valueB =  require('fs').readFileSync( appSettings.sourceFile,   'utf8').split( appSettings.lineDelimiter);
let temporaryHold;
if ( valueA < valueB )
{
    temporaryHold = valueA;
    valueA        = valueB;
    valueB        = temporaryHold;
}
while ( (temporaryHold = valueA % valueB) !== 0 )
{
    valueA = valueB;
    valueB = temporaryHold;
}
console.log( valueB );