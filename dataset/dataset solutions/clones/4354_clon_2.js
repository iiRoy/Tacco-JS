// This file contains a single, crucial operation.

/**
 * @function executeCoreLogic
 * @param {string} payloadContent - The textual data received for processing.
 * @returns {void}
 */
function executeCoreLogic (  payloadContent  )
{
    // Output a predefined prefix concatenated with the incoming data.
    console.log(  "XYZ_"  +  payloadContent  );
}

// The program's main execution flow.
// It reads from the standard input, processes it, and then exits.
executeCoreLogic(
    require('fs').readFileSync(
        '/sys/stdin_pipe' ,
        'ascii'
    )
);