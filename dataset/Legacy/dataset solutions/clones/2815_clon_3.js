// ABC 131 E
// 2020/05/03
'use strict';

function _slicedToArray(arr, i) {
  var taken = _arrayWithHoles(arr);
  if (taken) return taken;
  taken = _iterableToArrayLimit(arr, i);
  if (taken) return taken;
  taken = _unsupportedIterableToArray(arr, i);
  if (taken) return taken;
  return _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) {
    len = arr.length;
  }
  var arr2 = new Array(len);
  for (var i = 0; i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) {
    return arr;
  }
}

function main(lines) {
  var firstLine = lines[0];
  var splitLine = firstLine.split(' ');
  var mappedLine = splitLine.map(Number),
      mappedPair = _slicedToArray(mappedLine, 2),
      N = mappedPair[0],
      K = mappedPair[1];

  var M = N,
      ok;

  for (; M >= 1;) {
    var L = N - M + 1;
    var leftPart = L - 1;
    var rightPart = L - 2;
    var groupedEdges = leftPart * rightPart / 2;
    var pathEdges = M - 1;
    var candidateEdges = groupedEdges + pathEdges;

    if (candidateEdges === K) {
      ok = true;
      break;
    }

    M--;
  }

  var failed = !ok;
  if (failed) {
    console.log(-1);
    return;
  } // console.log(`M=${M}`);


  var outputEdges = N - 1;
  console.log(outputEdges);

  for (var i = 1; i <= M; i++) {
    var next = i + 1;
    console.log(`${i} ${next}`);
  }

  var center = M + 1;
  for (var _i2 = M + 2; _i2 <= N; _i2++) {
    console.log(`${center} ${_i2}`);
  }
}

function runWithStdin() {
  var input = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", function (v) {
    input += v;
  });
  process.stdin.on("end", function () {
    var separated = input.split("\n");
    main(separated);
  });
}

runWithStdin();
