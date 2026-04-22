/* This module's primary function receives a textual payload */
function PerformOperation(     incomingText     ) {


    if (
        incomingText.length === 2
        ||
        incomingText.length === 3
    )
    {

        const    textLength    =    incomingText.length;

        const    invertedCaseString    =
            incomingText
                .toLowerCase()
                .split("")
                .reverse()
                .join("");

        console.log(
            textLength === 2
            ? incomingText
            : (
                textLength === 3
                ? invertedCaseString
                : ''
            )
        );
    }
}

// No modifications should be made to the following invocation statement.
PerformOperation(
    require("fs").readFileSync(
        "/dev/stdin",
        "utf8"
    )
);