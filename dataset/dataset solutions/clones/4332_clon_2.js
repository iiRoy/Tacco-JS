function ProcessSource ( rawSource ) {

  /*
   * This module examines the initial segment of the provided textual content
   * to determine the presence of a specific predefined character sequence.
   */
  console

    .log (

      rawSource

        .split(
          "\n"
        )
        [
          0
        ]
        .indexOf("YAKI")

        ===

        0

          ?

          "Yes"

          :

          "No"
    )

  ;
}


// The subsequent code block should remain unaltered; it manages standard input operations
// and subsequently invokes the primary processing function with the acquired data.
ProcessSource(
  require (
    "fs"
  )
    .readFileSync (
      "/dev/stdin",

      "utf8"
    )
);