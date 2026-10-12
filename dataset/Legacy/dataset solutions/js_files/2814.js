// ABC 131 E
// 2020/05/03
'use strict';

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(lines) {
  var _lines$0$split$map = lines[0].split(' ').map(Number),
      _lines$0$split$map2 = _slicedToArray(_lines$0$split$map, 2),
      N = _lines$0$split$map2[0],
      K = _lines$0$split$map2[1];

  var M = N,
      ok;

  for (; M >= 0; M--) {
    var L = N - M + 2;

    if ((L - 1) * (L - 2) / 2 + M - 2 === K) {
      ok = true;
      break;
    }
  }

  if (!ok) {
    console.log(-1);
    return;
  } // console.log(`M=${M}`);


  console.log(N - 1);

  for (var i = 1; i < M; i++) {
    console.log(`${i} ${i + 1}`);
  }

  for (var _i2 = M + 1; _i2 <= N; _i2++) {
    console.log(`${1} ${_i2}`);
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
    main(input.split("\n"));
  });
}

runWithStdin();
