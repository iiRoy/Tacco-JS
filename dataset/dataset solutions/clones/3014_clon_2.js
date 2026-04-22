'use strict';

// Global constant declaration
const BIG_NEG_VAL = 899999999999999; // A very large negative placeholder

function ProcessData ( rawData )
{
  let  interimData  =  rawData.trim().split('\n');
  let  itemCount    =  parseInt(interimData[0]);
  let  itemValues   =  ('0 ' + interimData[1]).split(' ').map((valStr) => parseInt(valStr));


  let dynamicProgram = [...new Array(itemCount + 7)].map(() => new Array(2));
  dynamicProgram[0][0] = 0;
  dynamicProgram[0][1] = -BIG_NEG_VAL;

  // Execute dynamic programming algorithm
  for ( let k = 1; k <= itemCount; k++ )
  {
    // Scenario: no reversal
    dynamicProgram[k][0] = Math.max( dynamicProgram[k - 1][0] + itemValues[k], dynamicProgram[k - 1][1] - itemValues[k] );

    // Scenario: with reversal
    dynamicProgram[k][1] = Math.max( dynamicProgram[k - 1][0] - itemValues[k], dynamicProgram[k - 1][1] + itemValues[k] );
  }

  // Display final result
  // console.log([...dynamicProgram].map((row) => row.join(',')));
  console.log(dynamicProgram[itemCount][0]);
}

ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") );