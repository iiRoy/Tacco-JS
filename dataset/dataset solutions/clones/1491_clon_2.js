// Entry point: an immediately-invoked asynchronous function expression.
( async  () => {

    // A string variable to accumulate all raw input data from the standard input stream.
    let    rawData    = '';

    // Asynchronously read data in chunks from the system's standard input.
    for  await  ( const  dataPiece  of  process.stdin )  {
        rawData += dataPiece; // Concatenate each received data piece to the raw data string.
    }


    // Split the entire collected raw data string into an array of individual text rows,
    // using the newline character as the primary delimiter.
    const  textRows  =  rawData.split(/\n/);

    // Extract the primary parameters from the very first row of input.
    // This row is expected to contain two space-separated integers:
    //  - The total number of elements to process.
    //  - The total count of operations to perform.
    const  [  countElements,  numOperations  ]  =  textRows[0].split(/\s/).map(  valueStr  =>  +valueStr  );

    // Parse the subsequent input rows to construct a list of all operations.
    // Each operation row is expected to contain multiple space-separated numerical values.
    // We slice the array from the second row up to (and including) the `numOperations`-th row.
    const  operationsList  =  textRows.slice(1, numOperations + 1).map(  currentRow  =>
        currentRow.split(/\s/).map(  valueStr  =>  +valueStr  )
    );


    // Initialize a numerical sequence array. Its size is determined by `countElements`.
    // All elements are initially set to the integer 1.
    let  digitsArray  =  new  Array(countElements).fill(1);


    // Define a constant for the modulo operation, used to keep results within a specific range.
    const  moduloVal  =  998244353;

    // This variable will store the continuously updated numerical result of the sequence.
    let  currentResult  =  0;

    // Calculate the initial value of `currentResult`.
    // It represents a number formed by `countElements` repetitions of the digit '1',
    // all computed modulo `moduloVal`.
    for  (  let  idx  =  0;  idx  <  countElements;  idx++  )  {
        currentResult = (currentResult * 10 + 1) % moduloVal;
    }


    // Iterate through each operation defined in the `operationsList`.
    for  (  const  currentOp  of  operationsList  )  {
        // Destructure the components of the current operation.
        // Adjust the first two values (`startIdx`, `endIdx`) to be zero-based indices.
        const  [  startIdx,  endIdx,  digitVal  ]  =  [  currentOp[0] - 1,  currentOp[1] - 1,  currentOp[2]  ];

        // Initialize a temporary variable to track the numerical effect of the current operation.
        let  opEffect  =  0;

        // Apply the digit modification over the specified range [startIdx, endIdx].
        for  (  let  idx  =  startIdx;  idx  <=  endIdx;  idx++  )  {
            // Update `opEffect` by incorporating the change from the old digit to the new digit.
            // The formula simulates replacing a digit in a number and taking modulo.
            opEffect  =  (  opEffect  *  10  +  digitVal  -  digitsArray[idx]  )  %  moduloVal;
            // Update the digit in the `digitsArray` to the new value.
            digitsArray[idx]  =  digitVal;
        }

        // After updating the specific range, "pad" the `opEffect` with zeros
        // for the remaining part of the sequence, from `endIdx + 1` to `countElements - 1`.
        for  (  let  idx  =  endIdx  +  1;  idx  <  countElements;  idx++  )  {
            opEffect  =  opEffect  *  10  %  moduloVal;
        }

        // Add the calculated `opEffect` to the `currentResult`.
        currentResult  +=  opEffect;
        // Ensure the `currentResult` always remains within the modulo range.
        currentResult  %=  moduloVal;

        // Display the updated `currentResult` to standard output.
        console.log(currentResult);
    }
}) ();