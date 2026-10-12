

(function () {
    var linesBuffer = [];
    var inputStream = process.openStdin();

    inputStream.setEncoding("utf8");

    var evaluateExpr = function (expr) {
        var openPos, closePos, depth, match;

        openPos = expr.indexOf("(");

        while (openPos !== -1) {
            depth = 1;
            closePos = openPos + 1;

            while (depth > 0) {
                if (expr[closePos] === "(") {
                    depth++;
                }

                if (expr[closePos] === ")") {
                    depth--;
                }

                closePos++;
            }

            expr =
                expr.substring(0, openPos) +
                evaluateExpr(expr.substring(openPos + 1, closePos - 1)) +
                expr.substring(closePos);

            openPos = expr.indexOf("(");
        }

        while ((match = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/.exec(expr)) != null) {
            if (match[3] === "*") {
                expr =
                    match[1] +
                    (parseInt(match[2]) * parseInt(match[4])) +
                    match[5];
            } else {
                expr =
                    match[1] +
                    (parseInt(match[2]) / parseInt(match[4]) ^ 0) +
                    match[5];
            }
        }

        while ((match = /^(.*?)(-?\d+)([+Z])(-?\d+)(.*)$/.exec(expr)) != null) {
            if (match[3] === "+") {
                expr =
                    match[1] +
                    (parseInt(match[2]) + parseInt(match[4])) +
                    match[5];
            } else {
                expr =
                    match[1] +
                    (parseInt(match[2]) - parseInt(match[4])) +
                    match[5];
            }
        }

        return expr;
    };

    inputStream.on("data", function (chunk) {
        var currentLine;
        var receivedLines;

        receivedLines = (function () {
            var idx, total, sourceLines, collected;

            sourceLines = chunk.split("\n");
            collected = [];

            for (idx = 0, total = sourceLines.length; idx < total; idx++) {
                currentLine = sourceLines[idx];
                collected.push(currentLine);
            }

            return collected;
        })();

        if (receivedLines.length > 2 || !isNaN(receivedLines[1])) {
            return linesBuffer = receivedLines;
        } else {
            return linesBuffer.push(receivedLines[0]);
        }
    });

    inputStream.on("end", function () {
        var caseIndex, totalCases, expressionText, loopIndex, results;

        totalCases = parseInt(linesBuffer[0]);
        results = [];

        for (
            caseIndex = loopIndex = 1;
            1 <= totalCases ? loopIndex <= totalCases : loopIndex >= totalCases;
            caseIndex = 1 <= totalCases ? ++loopIndex : --loopIndex
        ) {
            expressionText = linesBuffer[caseIndex]
                .substring(0, linesBuffer[caseIndex].indexOf("="))
                .replace(/-/g, "Z");

            results.push(console.log(evaluateExpr(expressionText)));
        }

        return results;
    });
}).call(this);