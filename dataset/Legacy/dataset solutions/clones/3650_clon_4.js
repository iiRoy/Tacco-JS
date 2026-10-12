function computeOptimalPath(rawData) {
    const numericValues = rawData.match(/\d+/g).map(Number);

    const measurePathDeviation = (sequenceElements) => {
        const [firstVal, secondVal, thirdVal] = sequenceElements;
        return Math.abs(firstVal - secondVal) + Math.abs(secondVal - thirdVal);
    };

    const allValuePermutations = numericValues.flatMap(initialElement =>
        numericValues.filter(nextElement => nextElement !== initialElement).flatMap(nextElement =>
            numericValues.filter(finalElement => finalElement !== initialElement && finalElement !== nextElement).map(finalElement =>
                [initialElement, nextElement, finalElement]
            )
        )
    );

    return allValuePermutations.reduce((minimumDeviation, currentPermutation) => {
        const currentDeviation = measurePathDeviation(currentPermutation);
        return Math.min(minimumDeviation, currentDeviation);
    }, Infinity);
}

((ioBuffer, ioResult, ioType) =>
    "undefined" !== typeof require
        ? console.log(computeOptimalPath(require("fs").readFileSync("/dev/stdin", "utf8")))
        : [
              (ioBuffer = ioBuffer.split("\n").slice(1, -1).join("\n")),
              (ioResult = (() => {
                  try {
                      return computeOptimalPath(ioBuffer);
                  } catch (ioError) {
                      return ioError.stack || ioError.message;
                  }
              })()),
              (ioType = typeof ioResult),
              "string" === ioType || (ioResult = JSON.stringify(ioResult)),
              $("<form>")
                  .append(
                      [[10, ioBuffer], 0, [1, ioType], 0, [10, ioResult]].map((elementData) =>
                          $(
                              elementData ? "<textarea>" : "<br>",
                              elementData && { rows: elementData[0], cols: 40, text: elementData[1] }
                          )
                      )
                  )
                  .appendTo("body"),
          ]
)(`
1 6 3
`);
