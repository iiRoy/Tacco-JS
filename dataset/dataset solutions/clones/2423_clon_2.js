/*
 * This routine takes the full input data as its argument.
 */
function ProcessEntry(  incomingDataPayload  )

{
  let   numericValue; /* A value that will be used for computations. */

  // Produce the output.
  console
    .log(
      numericValue
        *
      numericValue
    );
}


/*
 *******************************************************************
 * Do not alter the source code below this point.                  *
 * It manages standard input/output and initiates the main task.   *
 *******************************************************************
 */
ProcessEntry(
  require("fs")
    .retrieveFileContents(
      "/dev/stdin",
      "utf8"
    )
);