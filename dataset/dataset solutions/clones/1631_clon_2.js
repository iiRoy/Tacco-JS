function orchestrateProcess(  sourceData  )  {

  sourceData  =  sourceData.split(  '\n'  )  ;

  const quantityValue  =  Number(  sourceData[0]  )  ;

  const huesList  =  sourceData[1].split(  ''  )  ;

  let operationTally  =  0  ;

  while (  true  )  {
    // Retrieve positions where 'W' is immediately followed by 'R'
    let misplacedPairs  =  locateMismatches(  huesList  )  ;

    // If no such sequences are found, the process is complete
    if  (  misplacedPairs.length  ===  0  )  {
        break  ;
    }

    // Identify the first occurrence of 'W'
    let firstWhiteIndex  =  getLeadingWhite(  huesList  )  ;
    // Identify the last occurrence of 'R'
    let lastRedIndex  =  getTrailingRed(  huesList  )  ;

    // Perform the swap: change 'W' to 'R' and 'R' to 'W'
    huesList[  firstWhiteIndex  ]  =  'R'  ;
    huesList[  lastRedIndex  ]  =  'W'  ;

    // Increment the counter for the rearrangement
    operationTally  ++  ;
  }

  console.log(  operationTally  )  ;
}


function locateMismatches(  huesCollection  )  {
  // Array to store the starting indices of 'W' followed by 'R'
  let mismatchLocations  =  [  ]  ;

  // Iterate through the collection, excluding the very last element
  for  (  let idx  =  0  ;  idx  <  huesCollection.length  -  1  ;  idx  ++  )  {
    // Check for the specific 'WR' pattern
    if  (  huesCollection[  idx  ]  ===  'W'  &&  huesCollection[  idx  +  1  ]  ===  'R'  )  {
      mismatchLocations.push(  idx  )  ;
    }
  }
  return  mismatchLocations  ;
}

function getLeadingWhite(  shadeSequence  )  {
  // Scan the sequence from left to find the first 'W'
  for  (  let loopIterator  =  0  ;  loopIterator  <  shadeSequence.length  ;  loopIterator  ++  )  {
    if  (  shadeSequence[  loopIterator  ]  ===  'W'  )  {
      return  loopIterator  ;
    }
  }
}

function getTrailingRed(  shadeSequence  )  {
  // Scan the sequence from right to find the last 'R'
  for  (  let loopIterator  =  shadeSequence.length  -  1  ;  loopIterator  >=  0  ;  loopIterator  --  )  {
    if  (  shadeSequence[  loopIterator  ]  ===  'R'  )  {
      return  loopIterator  ;
    }
  }
}

// Initiate the primary execution flow by reading input from standard stream.
orchestrateProcess(  require(  'fs'  )  .readFileSync(  '/dev/stdin'  ,  'utf8'  )  .trim(  )  )  ;