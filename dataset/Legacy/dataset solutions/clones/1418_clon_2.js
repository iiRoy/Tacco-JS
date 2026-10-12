process.stdin.on("data", function(inputBuffer) {
    (inputBuffer + "")
        .trim()
        .split("\n")
        .some(function(lineContent, _linePosition, _sourceLines, _unusedArgR, _unusedArgX) {
            lineContent = lineContent.split(" ");

            let firstExamScore = +lineContent[0];
            let secondExamScore = +lineContent[1];
            let thirdExamScore = +lineContent[2];

            let totalExamScore = firstExamScore + secondExamScore;

            if (!~firstExamScore && !~secondExamScore && !~thirdExamScore) {
                return true;
            }

            console.log(
                !~firstExamScore || !~secondExamScore
                    ? "F"
                    : totalExamScore >= 80
                        ? "A"
                        : totalExamScore >= 65
                            ? "B"
                            : totalExamScore >= 50
                                ? "C"
                                : totalExamScore >= 30
                                    ? thirdExamScore >= 50
                                        ? "C"
                                        : "D"
                                    : "F"
            );
        });
}).resume();
