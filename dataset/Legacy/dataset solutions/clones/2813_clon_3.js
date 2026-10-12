function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(inputLines) {
  const firstLineParts = inputLines[0].split(' ').map(Number);
  const _firstLineParts = _slicedToArray(firstLineParts, 2),
        nodeCount = _firstLineParts[0],
        targetEdges = _firstLineParts[1];

  let foundSolution = false;
  let finalMValue = -1;

  const calculateEdgesForM = (currentM, totalNodes) => {
    const remainingNodesForChain = totalNodes - currentM + 1;
    const edgesFromRemainingNodes = (remainingNodesForChain - 1) * (remainingNodesForChain - 2) / 2;
    const edgesInMainChain = currentM - 1;
    return edgesFromRemainingNodes + edgesInMainChain;
  };

  for (let currentCandidateM = nodeCount; currentCandidateM >= 1; currentCandidateM--) {
    const computedEdges = calculateEdgesForM(currentCandidateM, nodeCount);
    if (computedEdges === targetEdges) {
      foundSolution = true;
      finalMValue = currentCandidateM;
      break;
    }
  }

  if (!foundSolution) {
    console.log(-1);
    return;
  }

  console.log(`M=${finalMValue}`);
  console.log(nodeCount - 1);

  const printGraphEdge = (u, v) => {
    console.log(`${u} ${v}`);
  };

  for (let chainNodeIndex = 1; chainNodeIndex <= finalMValue; chainNodeIndex++) {
    printGraphEdge(chainNodeIndex, chainNodeIndex + 1);
  }

  const commonStarNode = finalMValue + 1;
  for (let starBranchNodeIndex = finalMValue + 2; starBranchNodeIndex <= nodeCount; starBranchNodeIndex++) {
    printGraphEdge(commonStarNode, starBranchNodeIndex);
  }
}

function runInputProcessor() {
  let rawInputData = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function (chunk) {
    rawInputData += chunk;
  });
  process.stdin.on("end", function () {
    main(rawInputData.split("\n"));
  });
}

runInputProcessor();
