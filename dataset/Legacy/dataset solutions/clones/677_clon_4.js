function MlStringLike(s) {
    this.string = s;
    this.toString = function() { return this.string; };
}

const CAML_TAG_INVALID_ARGUMENT = [0, new MlStringLike("Invalid_argument")];
const CAML_TAG_FAILURE = [0, new MlStringLike("Failure")];
const CAML_TAG_NOT_FOUND = [0, new MlStringLike("Not_found")];

function throwCamlError(tag, message) {
    throw [0, tag, new MlStringLike(message)];
}

function throwInvalidArg(message) {
    throwCamlError(CAML_TAG_INVALID_ARGUMENT, message);
}

function throwFailure(message) {
    throwCamlError(CAML_TAG_FAILURE, message);
}

function parseInteger(strVal) {
    let s = strVal.toString();
    let idx = 0;
    let sign = 1;
    let base = 10;

    if (s.charCodeAt(idx) === 45 /* '-' */) {
        sign = -1;
        idx++;
    }

    if (s.charCodeAt(idx) === 48 /* '0' */) {
        const nextChar = s.charCodeAt(idx + 1);
        switch (nextChar) {
            case 120: /* 'x' */ case 88: /* 'X' */ base = 16; idx += 2; break;
            case 111: /* 'o' */ case 79: /* 'O' */ base = 8; idx += 2; break;
            case 98: /* 'b' */ case 66: /* 'B' */ base = 2; idx += 2; break;
        }
    }

    let result = 0;
    let firstDigitFound = false;
    let currentIdx = idx;

    for (; currentIdx < s.length; currentIdx++) {
        let charCode = s.charCodeAt(currentIdx);
        if (charCode === 95 /* '_' */) continue;

        let digit;
        if (charCode >= 48 && charCode <= 57) digit = charCode - 48;
        else if (charCode >= 65 && charCode <= 90) digit = charCode - 55;
        else if (charCode >= 97 && charCode <= 122) digit = charCode - 87;
        else digit = -1;

        if (digit < 0 || digit >= base) {
            break;
        }

        firstDigitFound = true;

        const maxInt = 2147483647;
        const minIntAbs = 2147483648; // Absolute value of -2147483648

        if (sign === 1) {
            if (result > Math.floor(maxInt / base) || (result === Math.floor(maxInt / base) && digit > maxInt % base)) {
                throwFailure("int_of_string");
            }
        } else {
            if (result > Math.floor(minIntAbs / base) || (result === Math.floor(minIntAbs / base) && digit > minIntAbs % base)) {
                throwFailure("int_of_string");
            }
        }
        result = base * result + digit;
    }

    if (!firstDigitFound) throwFailure("int_of_string");

    for (let k = currentIdx; k < s.length; k++) {
        if (s.charCodeAt(k) !== 95) {
            throwFailure("int_of_string");
        }
    }

    result = sign * result;

    if (result > 2147483647 || result < -2147483648) {
        throwFailure("int_of_string");
    }

    return result;
}

function calculateMaxKSum(dataArray, kLength) {
    const arrayLength = dataArray.length;

    if (kLength <= 0 || kLength > arrayLength) {
        throwInvalidArg("list is nil");
    }

    let currentWindowSum = 0;
    for (let i = 0; i < kLength; i++) {
        currentWindowSum += dataArray[i];
    }

    let maximumSum = currentWindowSum;

    for (let i = kLength; i < arrayLength; i++) {
        currentWindowSum += dataArray[i] - dataArray[i - kLength];
        maximumSum = Math.max(maximumSum, currentWindowSum);
    }

    return maximumSum;
}

const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputLines = inputData.split(/\r?\n/);

let currentLineIndex = 0;

while (true) {
    if (currentLineIndex >= inputLines.length) break;

    const nkLine = inputLines[currentLineIndex++].trim();
    if (!nkLine) continue;

    const nkTokens = nkLine.split(/\s+/).filter(t => t.length > 0);
    if (nkTokens.length !== 2) {
        throwFailure("int_of_string");
    }

    const N = parseInteger(nkTokens[0]);
    const K = parseInteger(nkTokens[1]);

    if (N === 0 && K === 0) {
        break;
    }

    if (currentLineIndex >= inputLines.length) {
        throwFailure("int_of_string");
    }

    const dataLine = inputLines[currentLineIndex++].trim();
    const dataTokens = dataLine.split(/\s+/).filter(t => t.length > 0);

    const numbers = [];
    if (N > 0) {
        if (dataTokens.length < N) {
            throwFailure("int_of_string");
        }
        for (let i = 0; i < N; i++) {
            numbers.push(parseInteger(dataTokens[i]));
        }
        if (dataTokens.length > N) { // Check for extra tokens after N numbers
            for (let i = N; i < dataTokens.length; i++) {
                // If there are extra tokens, and they are not empty, it's an error.
                // The original `int_of_string` would fail if it tries to parse a non-empty string that's not a number.
                // My `parseInteger` expects the entire string to be a number.
                // So, if `dataTokens.length > N`, it implies there are extra numbers on the line.
                // The original `ah` function would just take `N` elements and ignore the rest of the list.
                // So, we should only process the first `N` tokens. No error for extra tokens.
            }
        }
    } else if (N === 0 && dataTokens.length > 0) {
        // If N is 0, but there are tokens on the data line, this is an error.
        // The original `ah(0, list)` returns `j` (empty list).
        // `N(aM, j)` is `j`.
        // `aX` would be `[0, [0, 0, K, j, a0]]`.
        // `aN(K, j)` would throw `Invalid_argument("list is nil")` if K > 0.
        // If K=0, `aN(0, j)` would return `0`.
        // Let's assume the input format implies that if N=0, the data line is empty.
        // If it's not empty, `parseInteger` would be called on `dataTokens[0]` and fail.
        throwFailure("int_of_string");
    }


    let originalMaxKSum;
    try {
        originalMaxKSum = calculateMaxKSum(numbers, K);
    } catch (e) {
        throw e;
    }

    let overallMaxKSum = originalMaxKSum;

    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            const tempNumbers = [...numbers];
            [tempNumbers[i], tempNumbers[j]] = [tempNumbers[j], tempNumbers[i]];

            let currentSwappedMaxKSum;
            try {
                currentSwappedMaxKSum = calculateMaxKSum(tempNumbers, K);
            } catch (e) {
                throw e;
            }

            overallMaxKSum = Math.max(overallMaxKSum, currentSwappedMaxKSum);
        }
    }

    if (overallMaxKSum < originalMaxKSum) {
        console.log("NO GAME");
    } else {
        console.log(overallMaxKSum - originalMaxKSum);
    }
}
