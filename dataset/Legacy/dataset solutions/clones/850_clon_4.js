'use strict';

function literalMatcher(patternString) {
  const patternLength = patternString.length;
  return (sourceInput, currentPosition) => {
    if (currentPosition < 0 || currentPosition + patternLength > sourceInput.length) {
      return [false, null, currentPosition];
    }

    let isMatch = true;
    let charIndex = 0;
    while (charIndex < patternLength) {
      if (sourceInput.charCodeAt(currentPosition + charIndex) !== patternString.charCodeAt(charIndex)) {
        isMatch = false;
        break;
      }
      charIndex++;
    }

    if (isMatch) {
      return [true, patternString, currentPosition + patternLength];
    } else {
      return [false, null, currentPosition];
    }
  };
}

// function choice() {
//   const parsers = arguments;
//   return (target, pos) => {
//     for (let parser of parsers) {
//       const parsed = parser(target, pos);
//       if (parsed[0]) return parsed;
//     }
//     return [false, null, pos];
//   };
// }

// function seq() {
//   const parsers = arguments;
//   return (target, pos) => {
//     const result = [];
//     let nextPos = pos;
//     for (let parser of parsers) {
//       const parsed = parser(target, nextPos);
//       if (!parsed[0]) return [false, null, pos];
//       result.push(parsed[1]);
//       nextPos = parsed[2];
//     }
//     return [true, result, nextPos];
//   };
// }

// function lazy(f) {
//   let parser;
//   return function (target, position) {
//     if (!parser) parser = f();
//     return parser(target, position);
//   };
// }

// function fmap(parser, f) {
//   return (target, pos) => {
//     const result = parser(target, pos);
//     if (result[0]) {
//       return [result[0], f(result[1]), result[2]];
//     } else {
//       return result;
//     }
//   };
// }

// function oneOf(s) {
//   let d = {};
//   for (let c of s) d[c] = c;
//   return (target, pos) => {
//     const c = target.substr(pos, 1);
//     return d[c] ? [true, c, pos + 1] : [false, null, pos];
//   };
// }

function processInputContent(inputData) {
  // const formulaP = lazy(() => {
  //   const andP = fmap(seq(token('('), formulaP, token('*'), formulaP, token(')')), x => {
  //     return { op: '*', fs: [x[1], x[3]] };
  //   });
  //   const orP = fmap(seq(token('('), formulaP, token('+'), formulaP, token(')')), x => {
  //     return { op: '+', fs: [x[1], x[3]] };
  //   });
  //   const impP = fmap(seq(token('('), formulaP, token('->'), formulaP, token(')')), x => {
  //     return { op: '->', fs: [x[1], x[3]] };
  //   });
  //   const notP = fmap(seq(token('-'), formulaP), x => {
  //     return { op: '-', fs: [x[1]] };
  //   });
  //   const valP = fmap(oneOf('abcdefghijkTF'), x => { return { val: x, fs: [] }; });
  //   return choice(andP, orP, impP, notP, valP);
  // });
  // const equationP = fmap(seq(formulaP, token('='), formulaP), x => {
  //   return { left: x[0], right: x[2] };
  // });

  const lineActions = {
    '#': () => process.exit(0)
  };

  const receivedLines = inputData.toString().split('\n');
  for (const currentLine of receivedLines) {
    (lineActions[currentLine] || (() => {}))();
    // const r = equationP(s, 0);
    // let isValid = true;
    // for (let i = 0; i < (1 << 11); i++) {
    //   isValid &= evalF(r[1].left) === evalF(r[1].right);
    //   function toBool(c) {
    //     if (c === 'T') return true;
    //     if (c === 'F') return false;
    //     return !!(i >> (c.charCodeAt() - 'a'.charCodeAt()) & 1);
    //   }
    //   function evalF(f) {
    //     switch (f.fs.length) {
    //       case 0: return toBool(f.val);
    //       case 1: return !evalF(f.fs[0]);
    //       case 2:
    //         switch (f.op) {
    //           case '*': return evalF(f.fs[0]) && evalF(f.fs[1]);
    //           case '+': return evalF(f.fs[0]) || evalF(f.fs[1]);
    //           case '->': return !evalF(f.fs[0]) || evalF(f.fs[1]);
    //         }
    //     }
    //   }
    // }
    // console.log(isValid ? 'YES' : 'NO');
  }
}

processInputContent(require('fs').readFileSync('/dev/stdin', 'utf8'));
