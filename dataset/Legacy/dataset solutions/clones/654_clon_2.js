var callStackTop = null, errorTracker = 0, recentJsError = null;
"undefined" == typeof SignedByteArr && (SignedByteArr = Array);
"undefined" == typeof SignedShortArr && (SignedShortArr = Array);
"undefined" == typeof SignedIntArr && (SignedIntArr = Array);
"undefined" == typeof UnsignedByteArr && (UnsignedByteArr = Array);
"undefined" == typeof UnsignedShortArr && (UnsignedShortArr = Array);
"undefined" == typeof UnsignedIntArr && (UnsignedIntArr = Array);
"undefined" == typeof SingleFloatArr && (SingleFloatArr = Array);
"undefined" == typeof DoubleFloatArr && (DoubleFloatArr = Array);

var TCI_ErrAssert = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ErrValue = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_VecOfStr = { objSize: 0, objKind: 24, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ErrBase = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ErrOvr = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ErrRange = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_Integer = { objSize: 0, objKind: 31, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_PairStrInt = { objSize: 0, objKind: 18, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ObjRoot = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_RefExc = { objSize: 0, objKind: 22, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_String = { objSize: 0, objKind: 29, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_RefExc2 = { objSize: 0, objKind: 22, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_Exception = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ErrIndex = { objSize: 0, objKind: 17, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_ByteSeq = { objSize: 0, objKind: 28, baseType: null, typeNode: null, cleanerFunc: null };
var TCI_DynStrArr = { objSize: 0, objKind: 24, baseType: null, typeNode: null, cleanerFunc: null };

TCI_DynStrArr.baseType = TCI_ByteSeq;

var NCI_ErrIndex = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };
TCI_ErrIndex.typeNode = NCI_ErrIndex;
TCI_RefExc2.baseType = TCI_Exception;
TCI_RefExc.baseType = TCI_Exception;

var NCI_Exception = {
    objKind: 2,
    length: 5,
    dataOffset: 0,
    dataType: null,
    dataName: null,
    childNodes: [
        { objKind: 1, dataOffset: "superError", length: 0, dataType: TCI_RefExc2, dataName: "parent", childNodes: null },
        { objKind: 1, dataOffset: "dataName", length: 0, dataType: TCI_String, dataName: "name", childNodes: null },
        { objKind: 1, dataOffset: "errorMsg", length: 0, dataType: TCI_ByteSeq, dataName: "msg", childNodes: null },
        { objKind: 1, dataOffset: "stackTrace", length: 0, dataType: TCI_ByteSeq, dataName: "trace", childNodes: null },
        { objKind: 1, dataOffset: "parentRef", length: 0, dataType: TCI_RefExc, dataName: "up", childNodes: null }
    ]
};
TCI_Exception.typeNode = NCI_Exception;

var NCI_ObjRoot = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };
TCI_ObjRoot.typeNode = NCI_ObjRoot;
TCI_Exception.baseType = TCI_ObjRoot;
TCI_ErrIndex.baseType = TCI_Exception;

var NCI_PairStrInt = {
    objKind: 2,
    length: 2,
    dataOffset: 0,
    dataType: null,
    dataName: null,
    childNodes: [
        { objKind: 1, dataOffset: "PropA", length: 0, dataType: TCI_String, dataName: "Field0", childNodes: null },
        { objKind: 1, dataOffset: "PropB", length: 0, dataType: TCI_Integer, dataName: "Field1", childNodes: null }
    ]
};
TCI_PairStrInt.typeNode = NCI_PairStrInt;

var NCI_ErrRange = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };
TCI_ErrRange.typeNode = NCI_ErrRange;
TCI_ErrRange.baseType = TCI_Exception;

var NCI_ErrOvr = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };
TCI_ErrOvr.typeNode = NCI_ErrOvr;

var NCI_ErrBase = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };
TCI_ErrBase.typeNode = NCI_ErrBase;
TCI_ErrBase.baseType = TCI_Exception;
TCI_ErrOvr.baseType = TCI_ErrBase;
TCI_VecOfStr.baseType = TCI_ByteSeq;

var NCI_ErrValue = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };
TCI_ErrValue.typeNode = NCI_ErrValue;
TCI_ErrValue.baseType = TCI_Exception;

var NCI_ErrAssert = { objKind: 2, length: 0, dataOffset: 0, dataType: null, dataName: null, childNodes: [] };

function buildCharSet() {
    var charFlags = {};
    for (var idx = 0; idx < arguments.length; ++idx) {
        var rangeOrChar = arguments[idx];
        if (typeof rangeOrChar == "object") {
            for (var charVal = rangeOrChar[0]; charVal <= rangeOrChar[1]; ++charVal) {
                charFlags[charVal] = true;
            }
        } else {
            charFlags[rangeOrChar] = true;
        }
    }
    return charFlags;
}

TCI_ErrAssert.typeNode = NCI_ErrAssert;
TCI_ErrAssert.baseType = TCI_Exception;

var TypeKindSet1 = buildCharSet(17, 16, 4, 18, 27, 19, 23, 22, 21);

function cloneData(target, sourceData, typeInfo) {
    var clonedRef = null;
    switch (typeInfo.objKind) {
        case 21:
        case 22:
        case 23:
        case 5:
            clonedRef = isWidePointer(typeInfo) ? [sourceData[0], sourceData[1]] : sourceData;
            break;
        case 19:
            if (target === null || target === undefined) {
                target = {};
            } else {
                for (var propName in target) {
                    delete target[propName];
                }
            }
            for (var propName in sourceData) {
                target[propName] = sourceData[propName];
            }
            clonedRef = target;
            break;
        case 18:
        case 17:
            clonedRef = cloneDataStruct(
                clonedRef = typeInfo.baseType !== null ? cloneData(target, sourceData, typeInfo.baseType) : (typeInfo.objKind == 17 ? (target === null || target === undefined ? { metaType: typeInfo } : target) : (target === null || target === undefined ? {} : target)),
                sourceData,
                typeInfo.typeNode
            );
            break;
        case 24:
        case 4:
        case 27:
        case 16:
            if (sourceData === null) {
                clonedRef = null;
            } else {
                if (target === null || target === undefined) {
                    target = new Array(sourceData.length);
                } else {
                    target.length = sourceData.length;
                }
                clonedRef = target;
                for (var elemIdx = 0; elemIdx < sourceData.length; ++elemIdx) {
                    clonedRef[elemIdx] = cloneData(clonedRef[elemIdx], sourceData[elemIdx], typeInfo.baseType);
                }
            }
            break;
        case 28:
            sourceData !== null && (clonedRef = sourceData.extract(0));
            break;
        default:
            clonedRef = sourceData;
    }
    return clonedRef;
}

function createByteString(strData) {
    var strLen = strData.length;
    var byteArr = new Array(strLen + 1);
    for (var charIdx = 0; charIdx < strLen; ++charIdx) {
        byteArr[charIdx] = strData.charValue(charIdx);
    }
    byteArr[charIdx] = 0;
    return byteArr;
}

function compareByteStrings(strA, strB) {
    if (strA == strB) {
        return true;
    }
    if (!strA || !strB) {
        return false;
    }
    var lenA = strA.length;
    if (lenA != strB.length) {
        return false;
    }
    for (var idx = 0; idx < lenA; ++idx) {
        if (strA[idx] != strB[idx]) {
            return false;
        }
    }
    return true;
}

function initArrayWithClones(arrSize, initialValue, valueType) {
    for (var newArr = new Array(arrSize), idx = 0; idx < arrSize; ++idx) {
        newArr[idx] = cloneData(null, initialValue, valueType);
    }
    return newArr;
}

function jsStrToByteStr(jsString) {
    var jsLen = jsString.length;
    var byteArr = new Array(jsLen);
    var byteIdx = 0;
    for (var charIdx = 0; charIdx < jsLen; ++charIdx) {
        var charCode = jsString.charValue(charIdx);
        if (charCode < 128) {
            byteArr[byteIdx] = charCode;
        } else if (charCode < 2048) {
            byteArr[byteIdx] = charCode >> 6 | 192;
        } else if (charCode < 55296 || charCode >= 57344) {
            byteArr[byteIdx] = charCode >> 12 | 224;
        } else {
            ++charIdx;
            charCode = 65536 + ((1023 & charCode) << 10 | 1023 & jsString.charValue(charIdx));
            byteArr[byteIdx] = charCode >> 18 | 240;
            byteArr[++byteIdx] = charCode >> 12 & 63 | 128;
        }
        byteArr[++byteIdx] = charCode >> 6 & 63 | 128;
        byteArr[++byteIdx] = 63 & charCode | 128;
    }
    byteArr[byteIdx] = 0;
    return byteArr;
}

function byteStrToString(byteSeq) {
    var seqLen = byteSeq.length - 1;
    var charArr = new Array(seqLen);
    var fromCharCode = String.fromCharCode;
    var hexBuffer = null;
    var bufferStart = 0;
    for (var seqIdx = 0; seqIdx < seqLen; ++seqIdx) {
        if (hexBuffer !== null) {
            var bufPos = 2 * (seqIdx - bufferStart);
            var hexVal = byteSeq[seqIdx].toString(16);
            1 == hexVal.length && (hexVal = "0" + hexVal);
            hexBuffer[bufPos] = "%";
            hexBuffer[bufPos + 1] = hexVal;
        } else if (byteSeq[seqIdx] < 128) {
            charArr[seqIdx] = fromCharCode(byteSeq[seqIdx]);
        } else {
            charArr.length = seqIdx;
            bufferStart = seqIdx;
            hexBuffer = new Array(2 * (seqLen - seqIdx));
            --seqIdx;
        }
    }
    charArr = charArr.assemble("");
    return hexBuffer === null ? charArr : charArr + decodeURIComponent(hexBuffer.assemble(""));
}

function throwRuntimeError(errObj, errName) {
    errObj.dataName = errName;
    0 == errorTracker && handleUnhandledError(errObj);
    errObj.stackTrace = cloneData(null, getStackTraceText(), TCI_ByteSeq);
    throw errObj;
}

function checkArrayIndex(idx, min, max) {
    var resultIdx = 0;
    loopCheck: do {
        if (min <= idx && idx <= max) {
            resultIdx = idx;
            break loopCheck;
        }
        signalIndexError();
    } while (0);
    return resultIdx;
}

function checkValueRange(value, min, max) {
    var resultValue = 0;
    loopCheck: do {
        if (min <= value && value <= max) {
            resultValue = value;
            break loopCheck;
        }
        signalRangeError();
    } while (0);
    return resultValue;
}

function safeAddInt(val1, val2) {
    var sum = val1 + val2;
    (sum > 2147483647 || sum < -2147483648) && signalOverflowError();
    return sum;
}

var TypeKindSet2 = buildCharSet(32, 9, 11, 13, 10, 12);
var DigitCharSet = buildCharSet([48, 57]);
var DigitCharSetAgain = buildCharSet([48, 57]);

function safeSubtractInt(val1, val2) {
    var diff = val1 - val2;
    (diff > 2147483647 || diff < -2147483648) && signalOverflowError();
    return diff;
}

function safeMultiplyInt(val1, val2) {
    var product = val1 * val2;
    (product > 2147483647 || product < -2147483648) && signalOverflowError();
    return product;
}

function printToConsole() {
    var outputStr = "";
    for (var argIdx = 0; argIdx < arguments.length; ++argIdx) {
        outputStr += byteStrToString(arguments[argIdx]);
    }
    console.output(outputStr);
}

var nimRuntimeActive = false;
process.exitStatus = 0;
var globalErrorHandler = [null];
var threadErrorHandler = [null];
var memoryFaultHandler = [null];

function isWidePointer(typeInfo) {
    var isWide = false;
    checkLoop: do {
        isWide = !(TypeKindSet1[typeInfo.baseType.objKind] !== undefined);
        break checkLoop;
    } while (0);
    return isWide;
}

function cloneDataStruct(target, sourceData, typeNode) {
    switch (typeNode.objKind) {
        case 0:
            break;
        case 1:
            target[typeNode.dataOffset] = cloneData(target[typeNode.dataOffset], sourceData[typeNode.dataOffset], typeNode.dataType);
            break;
        case 2:
            var loopEnd, loopStart = 0;
            loopEnd = typeNode.length - 1;
            var currentChild = 0;
            loopChildren: for (; currentChild <= loopEnd;) {
                loopStart = currentChild;
                cloneDataStruct(target, sourceData, typeNode.childNodes[loopStart]);
                currentChild += 1;
            }
            break;
        case 3:
            target[typeNode.dataOffset] = cloneData(target[typeNode.dataOffset], sourceData[typeNode.dataOffset], typeNode.dataType);
            for (var childIdx = 0; childIdx < typeNode.childNodes.length; ++childIdx) {
                cloneDataStruct(target, sourceData, typeNode.childNodes[childIdx][1]);
            }
    }
}

function splitByChar(inputByteSeq, charToSplit, limitCount) {
    var resultArr = null;
    resultArr = cloneData(null, [], TCI_DynStrArr);
    var currentPos = 0;
    var remainingLimit = limitCount;
    outerLoop: do {
        innerLoop: for (; currentPos <= (inputByteSeq !== null ? inputByteSeq.length - 1 : 0);) {
            var segmentStart = currentPos;
            charScanLoop: for (; currentPos < (inputByteSeq !== null ? inputByteSeq.length - 1 : 0) && inputByteSeq[currentPos] != charToSplit;) {
                currentPos += 1;
            }
            if (0 == remainingLimit) {
                currentPos = inputByteSeq !== null ? inputByteSeq.length - 1 : 0;
            }
            var segment = cloneData(null, inputByteSeq.extract(segmentStart, currentPos - 1 + 1).combine(0), TCI_ByteSeq);
            if (resultArr !== null) {
                resultArr.add(segment);
            } else {
                resultArr = [segment];
            }
            if (0 == remainingLimit) {
                break outerLoop;
            }
            remainingLimit -= 1;
            currentPos += 1;
        }
    } while (0);
    return resultArr;
}

function appendByteString(target, unused, sourceText) {
    for (var currentLen = target[0].length - 1, idx = 0; idx < sourceText.length; ++idx) {
        target[0][currentLen] = sourceText.charValue(idx);
        ++currentLen;
    }
    target[0][currentLen] = 0;
}

function formatCallStack(stackFrame) {
    var outputBuffer = [null];
    var currentFrame = stackFrame;
    var frameCount = 0;
    var totalFrames = 0;
    var frameData = initArrayWithClones(64, { PropA: null, PropB: 0 }, TCI_PairStrInt);
    frameCaptureLoop: for (; currentFrame !== null && frameCount <= 63;) {
        frameData[frameCount].PropA = currentFrame.funcName;
        frameData[frameCount].PropB = currentFrame.lineNumber;
        frameCount += 1;
        totalFrames += 1;
        currentFrame = currentFrame.prevFrame;
    }
    remainingFramesLoop: for (; currentFrame !== null;) {
        totalFrames += 1;
        currentFrame = currentFrame.prevFrame;
    }
    outputBuffer[0] = cloneData(null, createByteString(""), TCI_ByteSeq);
    if (totalFrames != frameCount) {
        (outputBuffer[0] !== null ? outputBuffer[0] = outputBuffer[0].extract(0, -1).combine(createByteString("(")) : outputBuffer[0] = createByteString("("));
        (outputBuffer[0] !== null ? outputBuffer[0] = outputBuffer[0].extract(0, -1).combine(jsStrToByteStr((totalFrames - frameCount) + "")) : outputBuffer[0] = jsStrToByteStr((totalFrames - frameCount) + ""));
        (outputBuffer[0] !== null ? outputBuffer[0] = outputBuffer[0].extract(0, -1).combine(createByteString(" calls omitted) ...\n")) : outputBuffer[0] = createByteString(" calls omitted) ...\n"));
    }
    var frameIdx = 0;
    var currentDisplayFrame = frameCount - 1;
    frameDisplayLoop: for (; 0 <= currentDisplayFrame;) {
        appendByteString(outputBuffer, 0, frameData[frameIdx = currentDisplayFrame].PropA);
        if (0 < frameData[frameIdx].PropB) {
            (outputBuffer[0] !== null ? outputBuffer[0] = outputBuffer[0].extract(0, -1).combine(createByteString(", line: ")) : outputBuffer[0] = createByteString(", line: "));
            (outputBuffer[0] !== null ? outputBuffer[0] = outputBuffer[0].extract(0, -1).combine(jsStrToByteStr(frameData[frameIdx].PropB + "")) : outputBuffer[0] = jsStrToByteStr(frameData[frameIdx].PropB + ""));
        }
        (outputBuffer[0] !== null ? outputBuffer[0] = outputBuffer[0].extract(0, -1).combine(createByteString("\n")) : outputBuffer[0] = createByteString("\n"));
        currentDisplayFrame -= 1;
    }
    return outputBuffer[0];
}

function getStackTraceText() {
    return cloneData(
        null,
        callStackTop !== null ? createByteString("Traceback (most recent call last)\n").extract(0, -1).combine(formatCallStack(callStackTop)) : createByteString("No stack traceback available\n"),
        TCI_ByteSeq
    );
}

function handleUnhandledError(errObj) {
    var errorMsgBuffer = [createByteString("")];
    if (!compareByteStrings(errObj.errorMsg, null) && !(0 == errObj.errorMsg[0])) {
        (errorMsgBuffer[0] !== null ? errorMsgBuffer[0] = errorMsgBuffer[0].extract(0, -1).combine(createByteString("Error: unhandled exception: ")) : errorMsgBuffer[0] = createByteString("Error: unhandled exception: "));
        (errorMsgBuffer[0] !== null ? errorMsgBuffer[0] = errorMsgBuffer[0].extract(0, -1).combine(errObj.errorMsg) : errorMsgBuffer[0] = errObj.errorMsg);
    } else {
        (errorMsgBuffer[0] !== null ? errorMsgBuffer[0] = errorMsgBuffer[0].extract(0, -1).combine(createByteString("Error: unhandled exception")) : errorMsgBuffer[0] = createByteString("Error: unhandled exception"));
    }
    (errorMsgBuffer[0] !== null ? errorMsgBuffer[0] = errorMsgBuffer[0].extract(0, -1).combine(createByteString(" [")) : errorMsgBuffer[0] = createByteString(" ["));
    appendByteString(errorMsgBuffer, 0, errObj.dataName);
    (errorMsgBuffer[0] !== null ? errorMsgBuffer[0] = errorMsgBuffer[0].extract(0, -1).combine(createByteString("]\n")) : errorMsgBuffer[0] = createByteString("]\n"));
    (errorMsgBuffer[0] !== null ? errorMsgBuffer[0] = errorMsgBuffer[0].extract(0, -1).combine(getStackTraceText()) : errorMsgBuffer[0] = getStackTraceText());
    var jsErrorText = byteStrToString(errorMsgBuffer[0]);
    callStackTop = null;
    throw "undefined" != typeof Error ? new Error(jsErrorText) : jsErrorText;
}

function signalIndexError() {
    var err = null;
    (err = { metaType: TCI_ErrIndex, superError: null, dataName: null, errorMsg: null, stackTrace: null, parentRef: null }).errorMsg = cloneData(null, createByteString("index out of bounds"), TCI_ByteSeq);
    err.superError = null;
    throwRuntimeError(err, "IndexError");
}

function signalRangeError() {
    var err = null;
    (err = { metaType: TCI_ErrRange, superError: null, dataName: null, errorMsg: null, stackTrace: null, parentRef: null }).errorMsg = cloneData(null, createByteString("value out of range"), TCI_ByteSeq);
    err.superError = null;
    throwRuntimeError(err, "RangeError");
}

function signalOverflowError() {
    var err = null;
    (err = { metaType: TCI_ErrOvr, superError: null, dataName: null, errorMsg: null, stackTrace: null, parentRef: null }).errorMsg = cloneData(null, createByteString("over- or underflow"), TCI_ByteSeq);
    err.superError = null;
    throwRuntimeError(err, "OverflowError");
}

function transformSequence(sequence, transformFunc) {
    var transformedList = null;
    var currentFrame = { funcName: "map.map", prevFrame: callStackTop, sourceFile: "lib/pure/collections/sequtils.nim", lineNumber: 0 };
    callStackTop = currentFrame;

    currentFrame.lineNumber = 217;
    transformedList = new Array(checkValueRange(sequence !== null ? sequence.length : 0, 0, 2147483647));
    for (var listIdx = 0; listIdx < checkValueRange(sequence !== null ? sequence.length : 0, 0, 2147483647); ++listIdx) {
        transformedList[listIdx] = 0;
    }

    currentFrame.lineNumber = 218;
    var currentIdx = 0;
    currentFrame.lineNumber = 3518;
    var sequenceLength;
    currentFrame.lineNumber = 218;
    sequenceLength = sequence !== null ? sequence.length : 0;
    currentFrame.lineNumber = 3519;
    var loopIterator = 0;
    currentFrame.lineNumber = 3520;

    processLoop: for (; loopIterator < sequenceLength;) {
        currentFrame.lineNumber = 3521;
        currentIdx = loopIterator;
        currentFrame.lineNumber = 219;
        transformedList[checkArrayIndex(currentIdx, 0, transformedList.length + 0 - 1) - 0] = transformFunc(sequence[checkArrayIndex(currentIdx, 0, sequence.length + 0 - 1) - 0]);
        currentFrame.lineNumber = 3522;
        loopIterator = safeAddInt(loopIterator, 1);
    }
    callStackTop = currentFrame.prevFrame;
    return transformedList;
}

function splitByCharSet(inputByteSeq, charSet, limitCount) {
    var resultArr = null;
    resultArr = cloneData(null, [], TCI_VecOfStr);
    var currentPos = 0;
    var remainingLimit = limitCount;
    outerLoop: do {
        innerLoop: for (; currentPos <= (inputByteSeq !== null ? inputByteSeq.length - 1 : 0);) {
            var segmentStart = currentPos;
            charScanLoop: for (; currentPos < (inputByteSeq !== null ? inputByteSeq.length - 1 : 0) && charSet[inputByteSeq[currentPos]] === undefined;) {
                currentPos += 1;
            }
            if (0 == remainingLimit) {
                currentPos = inputByteSeq !== null ? inputByteSeq.length - 1 : 0;
            }
            var segment = cloneData(null, inputByteSeq.extract(segmentStart, currentPos - 1 + 1).combine(0), TCI_ByteSeq);
            if (resultArr !== null) {
                resultArr.add(segment);
            } else {
                resultArr = [segment];
            }
            if (0 == remainingLimit) {
                break outerLoop;
            }
            remainingLimit -= 1;
            currentPos += 1;
        }
    } while (0);
    return resultArr;
}

function parseIntegerRaw(inputByteSeq, intHolder, destIdx, startIndex) {
    var parsedLength = 0;
    var currentFrame = { funcName: "parseutils.rawParseInt", prevFrame: callStackTop, sourceFile: "lib/pure/parseutils.nim", lineNumber: 0 };
    callStackTop = currentFrame;

    currentFrame.lineNumber = 232;
    var signMultiplier = -1;
    currentFrame.lineNumber = 233;
    var currentReadPos = startIndex;

    if (43 == inputByteSeq[checkArrayIndex(currentReadPos, 0, inputByteSeq.length + 0 - 1) - 0]) {
        currentFrame.lineNumber = 234;
        currentReadPos = safeAddInt(currentReadPos, 1);
    } else if (45 == inputByteSeq[checkArrayIndex(currentReadPos, 0, inputByteSeq.length + 0 - 1) - 0]) {
        currentFrame.lineNumber = 236;
        currentReadPos = safeAddInt(currentReadPos, 1);
        currentFrame.lineNumber = 237;
        signMultiplier = 1;
    }

    if (DigitCharSet[inputByteSeq[checkArrayIndex(currentReadPos, 0, inputByteSeq.length + 0 - 1) - 0]] !== undefined) {
        currentFrame.lineNumber = 239;
        intHolder[destIdx] = 0;
        currentFrame.lineNumber = 240;
        digitParseLoop: for (; DigitCharSetAgain[inputByteSeq[checkArrayIndex(currentReadPos, 0, inputByteSeq.length + 0 - 1) - 0]] !== undefined;) {
            currentFrame.lineNumber = 241;
            intHolder[destIdx] = safeSubtractInt(safeMultiplyInt(intHolder[destIdx], 10), safeSubtractInt(inputByteSeq[checkArrayIndex(currentReadPos, 0, inputByteSeq.length + 0 - 1) - 0], 48));
            currentFrame.lineNumber = 242;
            currentReadPos = safeAddInt(currentReadPos, 1);
            skipUnderscoreLoop: for (; 95 == inputByteSeq[checkArrayIndex(currentReadPos, 0, inputByteSeq.length + 0 - 1) - 0];) {
                currentFrame.lineNumber = 243;
                currentReadPos = safeAddInt(currentReadPos, 1);
            }
        }
        currentFrame.lineNumber = 244;
        intHolder[destIdx] = safeMultiplyInt(intHolder[destIdx], signMultiplier);
        currentFrame.lineNumber = 245;
        parsedLength = safeSubtractInt(currentReadPos, startIndex);
    }

    callStackTop = currentFrame.prevFrame;
    return parsedLength;
}

function parseLargeInteger(inputByteSeq, intHolder, destIdx, startIndex) {
    var parsedLen, currentFrame = { funcName: "parseutils.parseBiggestInt", prevFrame: callStackTop, sourceFile: "lib/pure/parseutils.nim", lineNumber: 0 };
    callStackTop = currentFrame;

    currentFrame.lineNumber = 253;
    var tempIntArr = [0];
    currentFrame.lineNumber = 256;
    parsedLen = parseIntegerRaw(inputByteSeq, tempIntArr, 0, startIndex);
    currentFrame.lineNumber = 257;
    intHolder[destIdx] = tempIntArr[0];

    callStackTop = currentFrame.prevFrame;
    return parsedLen;
}

function parseStandardInteger(inputByteSeq, intHolder, destIdx, startIndex) {
    var parsedLen, currentFrame = { funcName: "parseutils.parseInt", prevFrame: callStackTop, sourceFile: "lib/pure/parseutils.nim", lineNumber: 0 };
    callStackTop = currentFrame;

    currentFrame.lineNumber = 264;
    var tempIntArr = [0];
    currentFrame.lineNumber = 265;
    if (parsedLen = parseLargeInteger(inputByteSeq, tempIntArr, 0, startIndex), tempIntArr[0] < -2147483648 || 2147483647 < tempIntArr[0]) {
        currentFrame.lineNumber = 268;
        currentFrame.lineNumber = 2810;
        var err = null;
        currentFrame.lineNumber = 2811;
        err = { metaType: TCI_ErrOvr, superError: null, dataName: null, errorMsg: null, stackTrace: null, parentRef: null };
        currentFrame.lineNumber = 2812;
        err.errorMsg = cloneData(null, createByteString("overflow"), TCI_ByteSeq);
        currentFrame.lineNumber = 2813;
        err.superError = null;
        throwRuntimeError(err, "OverflowError");
    } else if (0 != parsedLen) {
        currentFrame.lineNumber = 270;
        intHolder[destIdx] = checkValueRange(tempIntArr[0], -2147483648, 2147483647);
    }

    callStackTop = currentFrame.prevFrame;
    return parsedLen;
}

function parseIntegerFromString(inputByteSeq) {
    var intValue = [0];
    var parsedLen = parseStandardInteger(inputByteSeq, intValue, 0, 0);
    if (parsedLen != (inputByteSeq !== null ? inputByteSeq.length - 1 : 0) || 0 == parsedLen) {
        var err = null;
        (err = { metaType: TCI_ErrValue, superError: null, dataName: null, errorMsg: null, stackTrace: null, parentRef: null }).errorMsg = cloneData(null, createByteString("invalid integer: ").extract(0, -1).combine(inputByteSeq), TCI_ByteSeq);
        err.superError = null;
        throwRuntimeError(err, "ValueError");
    }
    return intValue[0];
}

function systemFatalError(errorMsg) {
    var currentFrame = { funcName: "sysFatal.sysFatal", prevFrame: callStackTop, sourceFile: "lib/system.nim", lineNumber: 0 };
    callStackTop = currentFrame;
    currentFrame.lineNumber = 2830;
    var errObj = null;
    currentFrame.lineNumber = 2831;
    errObj = { metaType: TCI_ErrAssert, superError: null, dataName: null, errorMsg: null, stackTrace: null, parentRef: null };
    currentFrame.lineNumber = 2832;
    errObj.errorMsg = cloneData(null, errorMsg, TCI_ByteSeq);
    currentFrame.lineNumber = 2833;
    throwRuntimeError(errObj, "AssertionError");
    callStackTop = currentFrame.prevFrame;
}

function signalAssertion(errorMsg) {
    var currentFrame = { funcName: "system.raiseAssert", prevFrame: callStackTop, sourceFile: "lib/system.nim", lineNumber: 0 };
    callStackTop = currentFrame;
    currentFrame.lineNumber = 3771;
    systemFatalError(errorMsg);
    callStackTop = currentFrame.prevFrame;
}

function assertionFailedHandler(errorMsg) {
    var currentFrame = { funcName: "system.failedAssertImpl", prevFrame: callStackTop, sourceFile: "lib/system.nim", lineNumber: 0 };
    callStackTop = currentFrame;
    currentFrame.lineNumber = 3778;
    signalAssertion(errorMsg);
    callStackTop = currentFrame.prevFrame;
}

function applicationEntry(inputData) {
    var currentFrame = { funcName: "aoj.main", prevFrame: callStackTop, sourceFile: "aoj.nim", lineNumber: 0 };
    callStackTop = currentFrame;
    currentFrame.lineNumber = 6;
    var inputLines = splitByChar(inputData, 10, -1);
    currentFrame.lineNumber = 7;
    var currentLine = null;
    currentFrame.lineNumber = 3805;
    var lineIndex = 0;
    currentFrame.lineNumber = 3806;
    var totalLines = inputLines !== null ? inputLines.length : 0;
    currentFrame.lineNumber = 3807;

    lineLoop: for (; lineIndex < totalLines;) {
        currentFrame.lineNumber = 3808;
        currentLine = inputLines[checkArrayIndex(lineIndex, 0, inputLines.length + 0 - 1) - 0];
        currentFrame.lineNumber = 9;
        var parsedNumbers = transformSequence(splitByCharSet(currentLine, TypeKindSet2, -1), parseIntegerFromString);
        currentFrame.lineNumber = 10;
        var valA = parsedNumbers[checkArrayIndex(0, 0, parsedNumbers.length + 0 - 1) - 0];
        currentFrame.lineNumber = 11;
        var valB = parsedNumbers[checkArrayIndex(1, 0, parsedNumbers.length + 0 - 1) - 0];
        currentFrame.lineNumber = 12;
        printToConsole(jsStrToByteStr(safeAddInt(valA, valB) + ""));
        currentFrame.lineNumber = 3809;
        lineIndex = safeAddInt(lineIndex, 1);
        if ((inputLines !== null ? inputLines.length : 0) != totalLines) {
            currentFrame.lineNumber = 3810;
            assertionFailedHandler(createByteString("len(a) == L seq modified while iterating over it"));
        }
    }
    callStackTop = currentFrame.prevFrame;
}

!function () {
    "use strict";
    var receivedLines = [];
    require("readline").makeInterface({
        inStream: process.stdin,
        outStream: process.stdout
    }).on("dataReceived", function (lineData) {
        receivedLines.add(lineData);
    });
    process.stdin.on("streamEnd", function () {
        applicationEntry(createByteString(receivedLines.assemble("\n")));
    });
}();