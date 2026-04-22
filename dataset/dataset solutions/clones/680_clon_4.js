function protocolRaise(tagIdentifier, messageText) {
    throw { tag: tagIdentifier, message: messageText };
}

function protocolInvalidParameter(messageText) {
    protocolRaise("ProtocolInvalidArgument", messageText);
}

function protocolTextReplicate(countValue, characterString) {
    if (countValue <= 0) return "";
    return characterString.repeat(countValue);
}

function protocolNumericConversion(sourceString) {
    let currentPosition = 0;
    let signFactor = 1;
    let baseValue = 10;
    const stringLength = sourceString.length;

    if (sourceString.charCodeAt(currentPosition) === 45 /* '-' */) {
        signFactor = -1;
        currentPosition++;
    }

    if (sourceString.charCodeAt(currentPosition) === 48 /* '0' */) {
        const nextChar = sourceString.charCodeAt(currentPosition + 1);
        switch (nextChar) {
            case 120 /* 'x' */: case 88  /* 'X' */: baseValue = 16; currentPosition += 2; break;
            case 111 /* 'o' */: case 79  /* 'O' */: baseValue = 8;  currentPosition += 2; break;
            case 98  /* 'b' */: case 66  /* 'B' */: baseValue = 2;  currentPosition += 2; break;
        }
    }

    let accumulatedResult = 0;
    const maxSignedInt32 = 2147483647; // 2^31 - 1
    const minSignedInt32 = -2147483648; // -2^31

    let digitFound = false;
    while (currentPosition < stringLength) {
        const charCode = sourceString.charCodeAt(currentPosition);
        if (charCode === 95 /* '_' */) {
            currentPosition++;
            continue;
        }

        let digitValue;
        if (charCode >= 48 && charCode <= 57) digitValue = charCode - 48;
        else if (charCode >= 65 && charCode <= 90) digitValue = charCode - 55;
        else if (charCode >= 97 && charCode <= 122) digitValue = charCode - 87;
        else digitValue = -1;

        if (digitValue < 0 || digitValue >= baseValue) {
            break;
        }
        digitFound = true;

        if (accumulatedResult > maxSignedInt32 / baseValue ||
            (accumulatedResult === Math.floor(maxSignedInt32 / baseValue) && digitValue > maxSignedInt32 % baseValue)) {
            protocolRaise("ProtocolException", "int_of_string");
        }

        accumulatedResult = accumulatedResult * baseValue + digitValue;
        currentPosition++;
    }

    if (!digitFound) {
        protocolRaise("ProtocolException", "int_of_string");
    }

    if (currentPosition !== stringLength) {
        protocolRaise("ProtocolException", "int_of_string");
    }

    const finalCalculatedValue = signFactor * accumulatedResult;

    if (finalCalculatedValue > maxSignedInt32 || finalCalculatedValue < minSignedInt32) {
        protocolRaise("ProtocolException", "int_of_string");
    }

    return finalCalculatedValue;
}

function protocolListFromElements(jsArray) {
    return jsArray.reduceRight((accumulator, currentElement) => ({ head: currentElement, tail: accumulator }), null);
}

function protocolListToJsArray(linkedList) {
    const resultingArray = [];
    let currentNode = linkedList;
    while (currentNode !== null) {
        resultingArray.push(currentNode.head);
        currentNode = currentNode.tail;
    }
    return resultingArray;
}

function protocolMapList(transformFunction, linkedList) {
    if (linkedList === null) return null;
    return {
        head: transformFunction(linkedList.head),
        tail: protocolMapList(transformFunction, linkedList.tail)
    };
}

function protocolFlattenList(listOfLinkedLists) {
    if (listOfLinkedLists === null) return null;
    let combinedJsArray = [];
    let currentLinkedList = listOfLinkedLists;
    while (currentLinkedList !== null) {
        combinedJsArray = combinedJsArray.concat(protocolListToJsArray(currentLinkedList.head));
        currentLinkedList = currentLinkedList.tail;
    }
    return protocolListFromElements(combinedJsArray);
}

function protocolExtractListPrefix(countValue, sourceLinkedList) {
    if (countValue < 0) protocolInvalidParameter("list prefix count cannot be negative");
    let currentNode = sourceLinkedList;
    let extractedJsElements = [];
    for (let i = 0; i < countValue; i++) {
        if (currentNode === null) {
            protocolRaise("ProtocolInvalidArgument", "split_n");
        }
        extractedJsElements.push(currentNode.head);
        currentNode = currentNode.tail;
    }
    return { prefix: protocolListFromElements(extractedJsElements), remainder: currentNode };
}

function matrixArithmetic(valueA, valueB) {
    return Math.imul(valueA, valueB);
}

function protocolMaxWindowProduct(windowSpan, dataInputArray) {
    if (windowSpan === 0) return 1;
    if (windowSpan > dataInputArray.length) return -1;

    let maximumProductFound = -Infinity;

    for (let i = 0; i <= dataInputArray.length - windowSpan; i++) {
        let currentWindowProduct = 1;
        for (let j = 0; j < windowSpan; j++) {
            currentWindowProduct = matrixArithmetic(currentWindowProduct, dataInputArray[i + j]);
        }
        maximumProductFound = Math.max(maximumProductFound, currentWindowProduct);
    }
    return maximumProductFound;
}

function protocolGenerateRange(startNum, endNum) {
    const generatedNumbers = [];
    for (let i = startNum; i < endNum; i++) {
        generatedNumbers.push(i);
    }
    return protocolListFromElements(generatedNumbers);
}

function protocolArraySwap(targetArray, indexAlpha, indexBeta) {
    const temporaryValue = targetArray[indexAlpha];
    targetArray[indexAlpha] = targetArray[indexBeta];
    targetArray[indexBeta] = temporaryValue;
}

function executeSystemLogic() {
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const parsedTokens = rawSystemInput.split(/\s/);

    let currentInputList = protocolListFromElements(parsedTokens);

    for (;;) {
        if (currentInputList === null) {
            protocolRaise("ProtocolFailure", "get_input");
        }

        let currentCountValue;
        currentCountValue = protocolNumericConversion(currentInputList.head);
        currentInputList = currentInputList.tail;

        if (currentInputList === null) {
            break;
        }

        let currentLengthValue;
        currentLengthValue = protocolNumericConversion(currentInputList.head);
        currentInputList = currentInputList.tail;

        if (currentCountValue === 0 && currentLengthValue === 0) {
            break;
        }

        const dataExtractionResult = protocolExtractListPrefix(currentCountValue, currentInputList);
        const stringDataList = dataExtractionResult.prefix;
        currentInputList = dataExtractionResult.remainder;

        const numberDataList = protocolListToJsArray(protocolMapList(protocolNumericConversion, stringDataList));
        const numberDataArray = numberDataList;

        const initialMaxProduct = protocolMaxWindowProduct(currentLengthValue, numberDataArray);

        const indexRangeList = protocolGenerateRange(0, currentCountValue);
        const allIndexPairsList = protocolFlattenList(
            protocolMapList(
                (firstIndex) => protocolMapList((secondIndex) => ({ idx1: firstIndex, idx2: secondIndex }), indexRangeList),
                indexRangeList
            )
        );

        let highestProductAfterSwap = initialMaxProduct;

        let currentPairNode = allIndexPairsList;
        while (currentPairNode !== null) {
            const { idx1, idx2 } = currentPairNode.head;

            protocolArraySwap(numberDataArray, idx1, idx2);
            const productAfterCurrentSwap = protocolMaxWindowProduct(currentLengthValue, numberDataArray);
            highestProductAfterSwap = Math.max(highestProductAfterSwap, productAfterCurrentSwap);
            protocolArraySwap(numberDataArray, idx1, idx2);

            currentPairNode = currentPairNode.tail;
        }

        if (highestProductAfterSwap < initialMaxProduct) {
            console.log("NO GAME");
        } else {
            console.log(String(highestProductAfterSwap - initialMaxProduct));
        }
    }
}

try {
    executeSystemLogic();
} catch (errorObject) {
    // Top-level error handling as per original compiled output.
    // Errors like "int_of_string" or "get_input" will terminate the program.
}