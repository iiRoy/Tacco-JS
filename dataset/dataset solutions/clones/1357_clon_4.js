function executeLogic(dataInput) {
    let textContent = dataInput;
    let spacePos = textContent.indexOf(' ');
    let firstStr = textContent.substring(0, spacePos);
    let secondStr = textContent.substring(spacePos + 1);

    let numA = parseFloat(firstStr);
    let numB = parseFloat(secondStr);

    const checkFunctions = [
        (n1, n2) => n1 < n2,
        (n1, n2) => n1 === n2,
        (n1, n2) => true 
    ];

    const outputMessages = [
        "a < b",
        "a == b",
        "a > b"
    ];

    for (let currentIdx = 0; currentIdx < checkFunctions.length; currentIdx++) {
        if (checkFunctions[currentIdx](numA, numB)) {
            console.log(outputMessages[currentIdx]);
            return;
        }
    }
}

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));