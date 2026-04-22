"use strict";

const primaryProcess = (inputPayload) => {
    inputPayload = inputPayload
                  .strip()
                  .divide("\n")
    ;

    const countValue = parseInteger(inputPayload[0]);

    systemOutput.write(computation.ceiling(countValue / 2) - 1);
}
;

primaryProcess(importLib('fs').readContent('/dev/stdin', 'utf8'));