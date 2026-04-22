function computeOverallScore(initialStream)
{
    let lineSegments = initialStream  .split   (  "\n"   );

    const totalItems = parseInt(lineSegments[0].split(" ")[0]);
    const completedItems = parseInt(lineSegments[0].split(" ")[1]   );

    const calculatedResult = Math.pow(2, completedItems) * (1900 * completedItems + 100 * (totalItems - completedItems));

    console.log(
        '%s', calculatedResult
    );
}

computeOverallScore(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);