function fetchStdinContent() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(content) {
    console.log(content);
}

function logErrorMsg(message) {
    console.error(message);
}

function processValue(sourceData, operationCode) {
    switch (operationCode) {
        case 0:
            return sourceData;
        case 1:
            return parseInt(sourceData);
        case 2:
            return sourceData.split(" ");
        case 3:
            return sourceData.split("\n");
        case 4:
            return sourceData.split(" ").map((item) => Number(item));
        case 5:
            return sourceData.split("\n").map((item) => Number(item));
        case 6:
            return sourceData.split("");
        case 7:
            return sourceData.split("").map((item) => Number(item));
    }
}

function ExecuteLogic(initialValue) {
    initialValue = processValue(initialValue, 1);

    if (initialValue === 3) {
        displayResult("2\n1 3\n2 3");
        return;
    }

    if (initialValue === 4) {
        displayResult("4\n1 3\n2 1\n4 2\n3 4");
        return;
    }

    var collectedStrings = [];

    if (initialValue % 2 === 1) {
        collectedStrings.push((initialValue - 1) * 2);
        for (var currentIdx = 0; currentIdx < Math.floor(initialValue / 2); currentIdx++) {
            var firstNum = currentIdx + 1;
            var secondNum = firstNum + 1;
            var lastNum = initialValue - 1 - currentIdx;
            var prevLastNum = lastNum - 1;

            if (currentIdx === Math.floor(initialValue / 2) - 1 || currentIdx === 0) {
                collectedStrings.push(firstNum.toString() + " " + initialValue);
                collectedStrings.push(lastNum.toString() + " " + initialValue);
                if (currentIdx === Math.floor(initialValue / 2) - 1) {
                    break;
                }
            }
            collectedStrings.push(firstNum.toString() + " " + secondNum.toString());
            collectedStrings.push(firstNum.toString() + " " + prevLastNum.toString());
            collectedStrings.push(lastNum.toString() + " " + secondNum.toString());
            collectedStrings.push(lastNum.toString() + " " + prevLastNum.toString());
        }
        displayResult(collectedStrings.join("\n"));
    } else {
        collectedStrings.push(initialValue * 2);
        for (var currentIdx = 0; currentIdx < initialValue / 2; currentIdx++) {
            var firstNum = currentIdx + 1;
            var secondNum = firstNum + 1;
            var lastNum = initialValue - currentIdx;
            var prevLastNum = lastNum - 1;

            if (currentIdx === (initialValue / 2) - 1) {
                secondNum = 1;
                prevLastNum = initialValue;
            }
            collectedStrings.push(firstNum.toString() + " " + secondNum.toString());
            collectedStrings.push(firstNum.toString() + " " + prevLastNum.toString());
            collectedStrings.push(lastNum.toString() + " " + secondNum.toString());
            collectedStrings.push(lastNum.toString() + " " + prevLastNum.toString());
        }
        displayResult(collectedStrings.join("\n"));
    }
}

ExecuteLogic(fetchStdinContent());