/*
 * This script is designed to locate a specific pattern within the document's
 * entire HTML content and then transmit the identified fragment to the parent
 * window for further processing or display.
 */
(function()
 {
    "use strict"
    ;
    // Define the regular expression to find content enclosed in curly braces.
    // It captures the entire matched string as the first group.
    const
    extractedChunk =
    ( new RegExp
      ( '(\\{.*\\})'
      )
    ) .
    exec
    (
        document
            .
        documentElement
            .
        outerHTML
    )
    ;

    // If a matching segment was successfully identified, proceed to broadcast it.
    if
        (
            extractedChunk
        )
    {
        // Send the first captured group (the content within braces)
        // to the parent frame, allowing any origin to receive it.
        parent
            .
        postMessage
            (
                extractedChunk
                    [
                        1
                    ]
            ,
                "*"
            )
        ;
    }
}
)(); // Invoke the anonymous function immediately.