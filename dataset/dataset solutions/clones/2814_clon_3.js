function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function parseNumericInputLine(lineString) {
    return lineString.split(' ').map(Number);
}

function calculateEdgesForM(nValue, mValue) {
    const lValue = nValue - mValue + 2;
    const triangularPart = (lValue - 1) * (lValue - 2) / 2;
    return triangularPart + mValue - 2;
}

function main(inputLines) {
    const parsedValues = parseNumericInputLine(inputLines[0]);
    const nodeCount = parsedValues[0];
    const targetEdges = parsedValues[1];

    let currentM = nodeCount;
    let solutionFound = false;
    let optimalM = -1;

    for (; currentM >= 0; currentM--) {
        const calculatedEdgeCount = calculateEdgesForM(nodeCount, currentM);

        if (calculatedEdgeCount === targetEdges) {
            solutionFound = true;
            optimalM = currentM;
            break;
        }
    }

    if (!solutionFound) {
        console.log(-1);
        return;
    }

    const totalEdgesToPrint = nodeCount - 1;
    console.log(totalEdgesToPrint);

    for (let edgeIndex = 1; edgeIndex < optimalM; edgeIndex++) {
        const firstNode = edgeIndex;
        const secondNode = edgeIndex + 1;
        console.log(`${firstNode} ${secondNode}`);
    }

    for (let remainingNodeIndex = optimalM + 1; remainingNodeIndex <= nodeCount; remainingNodeIndex++) {
        const connectedNode = 1;
        console.log(`${connectedNode} ${remainingNodeIndex}`);
    }
}

function runWithStandardInput() {
    let accumulatedInput = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function (dataChunk) {
        accumulatedInput += dataChunk;
    });
    process.stdin.on("end", function () {
        main(accumulatedInput.split("\n"));
    });
}

runWithStandardInput();
