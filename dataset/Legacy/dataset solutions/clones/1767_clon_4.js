const processInput = (inputString) => {
    const tokenList = inputString.split(" ");
    let foundPosition = 0;

    for (let currentIdx = 0; currentIdx < tokenList.length; currentIdx++) {
        if (tokenList[currentIdx] === "0") {
            foundPosition = currentIdx + 1;
            break;
        }
    }
    console.log(foundPosition);
};

processInput(require("fs").readFileSync('/dev/stdin', 'utf8'));
