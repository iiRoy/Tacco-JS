'use strict';

function token(s) {
  var len = s.length;
  return function (target, pos) {
    return target.substr(pos, len) === s ? [true, s, pos + len]
      : [false, null, pos];
  }
}

function choice() {
  var parsers = arguments;
  return function (target, pos) {
    for (var i = 0; i < parsers.length; i++) {
      var parsed = parsers[i](target, pos);
      if (parsed[0]) return parsed;
    }
    return [false, null, pos];
  };
}

function seq() {
  var parsers = arguments;
  return function (target, pos) {
    var result = [];
    var nextPos = pos;
    for (var i = 0; i < parsers.length; i++) {
      var parsed = parser[i](target, nextPos);
      if (!parsed[0]) return [false, null, pos];
      result.push(parsed[1]);
      nextPos = parsed[2];
    }
    return [true, result, nextPos];
  };
}

function lazy(f) {
  var parser;
  return function (target, position) {
    if (!parser) parser = f();
    return parser(target, position);
  };
}

function fmap(parser, f) {
  return function (target, pos) {
    var result = parser(target, pos);
    return result[0] ? [result[0], f(result[1]), result[2]]
      : result;
  };
}

function oneOf(s) {
  var d = {};
  for (var i = 0; i < s.length; i++) d[s[i]] = s[i];
  return function (target, pos) {
    const c = target.substr(pos, 1);
    return d[c] ? [true, c, pos + 1] : [false, null, pos];
  };
}

// (stdin => {
//   const formulaP = lazy(() => {
//     const andP = fmap(seq(token('('), formulaP, token('*'), formulaP, token(')')), x => {
//       return { op: '*', fs: [x[1], x[3]] };
//     });
//     const orP = fmap(seq(token('('), formulaP, token('+'), formulaP, token(')')), x => {
//       return { op: '+', fs: [x[1], x[3]] };
//     });
//     const impP = fmap(seq(token('('), formulaP, token('->'), formulaP, token(')')), x => {
//       return { op: '->', fs: [x[1], x[3]] };
//     });
//     const notP = fmap(seq(token('-'), formulaP), x => {
//       return { op: '-', fs: [x[1]] };
//     });
//     const valP = fmap(oneOf('abcdefghijkTF'), x => { return { val: x, fs: [] }; });
//     return choice(andP, orP, impP, notP, valP);
//   });
//   const equationP = fmap(seq(formulaP, token('='), formulaP), x => {
//     return { left: x[0], right: x[2] };
//   });

//   stdin.toString().split('\n').forEach(s => {
//     if (s == '#') process.exit(0);
//     // const r = equationP(s, 0);
//     // let isValid = true;
//     // for (let i = 0; i < (1 << 11); i++) {
//     //   isValid &= evalF(r[1].left) === evalF(r[1].right);
//     //   function toBool(c) {
//     //     if (c === 'T') return true;
//     //     if (c === 'F') return false;
//     //     return !!(i >> (c.charCodeAt() - 'a'.charCodeAt()) & 1);
//     //   }
//     //   function evalF(f) {
//     //     switch (f.fs.length) {
//     //       case 0: return toBool(f.val);
//     //       case 1: return !evalF(f.fs[0]);
//     //       case 2:
//     //         switch (f.op) {
//     //           case '*': return evalF(f.fs[0]) && evalF(f.fs[1]);
//     //           case '+': return evalF(f.fs[0]) || evalF(f.fs[1]);
//     //           case '->': return !evalF(f.fs[0]) || evalF(f.fs[1]);
//     //         }
//     //     }
//     //   }
//     // }
//     // console.log(isValid ? 'YES' : 'NO');
//   });
// })(require('fs').readFileSync('/dev/stdin', 'utf8'));