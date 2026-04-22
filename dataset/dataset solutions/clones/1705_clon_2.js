const [ lineCountString , ... connectionStrings ] = require('fs')
  .readFileSync('/dev/stdin', 'utf-8')
  .split(/\n/)
;

const nodeTotal = parseInt(lineCountString, 10) ;

let cumulativeValue = (nodeTotal * (nodeTotal + 1) * (nodeTotal + 2)) / 6 ;

for (const currentConnectionString of connectionStrings) {
  if (!currentConnectionString) {
    continue ;
  }
  let [ nodeA , nodeB ] = currentConnectionString.split(/ /).map(val => parseInt(val, 10)) ;
  if (nodeA > nodeB) {
    [ nodeA , nodeB ] = [ nodeB , nodeA ] ;
  }
  cumulativeValue -= nodeA * (nodeTotal - nodeB + 1) ;
}

console.info(cumulativeValue) ;