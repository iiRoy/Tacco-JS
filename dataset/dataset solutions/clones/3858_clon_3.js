function ProcessInput(numVal) {
    numVal = numVal | 0;
    const primeList = [11, 31, 41, 61, 71, 101, 131, 151, 181, 191, 211, 241, 251, 271, 281, 311, 331, 401, 421, 431, 461, 491, 521, 541, 571, 601, 631, 641, 661, 691, 701, 751, 761, 811, 821, 881, 911, 941, 971, 991, 1021, 1031, 1051, 1061, 1091, 1151, 1171, 1181, 1201, 1231, 1291, 1301, 1321, 1361, 1381];
    let outputStr = "";
    const SPACE_DELIMITER = " ";

    if (numVal <= 1) {
        // For numVal 0 or 1, the original code outputs only the first element.
        // The loop condition (i < input - 1) means it won't run for input 0 or 1.
        // The subsequent line (ans += arr[i]) then appends arr[0] because i remains 0.
        outputStr = primeList[0].toString();
    } else {
        // For numVal > 1, collect all elements up to numVal and join them with a space.
        const elementsToCollect = [];
        for (let index = 0; index < numVal; index++) {
            elementsToCollect.push(primeList[index]);
        }
        outputStr = elementsToCollect.join(SPACE_DELIMITER);
    }
    
    console.log(outputStr);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
