function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const fs = require('fs');

const INVALID_CODE = -1;

const parseLineOfNumbers = (line) => line.split(' ').map(Number);

const solveProblem = (inputContent) => {
  const inputLines = inputContent.split('\n');

  const [digitCount, constraintCount] = parseLineOfNumbers(inputLines.shift());

  let resultDigits = Array(digitCount).fill(INVALID_CODE);

  for (let k = 0; k < constraintCount; k++) {
    const [constraintPos, constraintVal] = parseLineOfNumbers(inputLines.shift());
    const targetIdx = constraintPos - 1;

    if (resultDigits[targetIdx] !== INVALID_CODE && resultDigits[targetIdx] !== constraintVal) {
      console.log(INVALID_CODE);
      return;
    }

    resultDigits[targetIdx] = constraintVal;
  }

  // Specific behavior of the original code for the first digit
  if (resultDigits[0] === 0 || resultDigits[0] === INVALID_CODE) {
    console.log(INVALID_CODE);
    return;
  }

  resultDigits = resultDigits.map((val) => (val === INVALID_CODE ? 0 : val));

  console.log(resultDigits.join(''));
};

solveProblem(fs.readFileSync('/dev/stdin', 'utf8'));
