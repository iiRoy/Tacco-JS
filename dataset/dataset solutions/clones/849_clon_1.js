'use strict'
; // This directive enforces strict parsing and error handling in JavaScript.

function token( s )

{
  // This function creates a parser for a specific string literal.
  var     len = s.length
  ;       // Get the length of the string 's'.

  return function ( target , pos ) {
    // The returned function is the actual parser.
    // It checks if 'target' string contains 's' starting at 'pos'.
    return target.substr( pos , len ) === s
      ? [ true , s , pos + len ] // If match, return success, the matched string, and new position.
      : [ false , null , pos ]
    ; // Otherwise, return failure, null, and original position.
  }
} // End of token function definition.

function choice() {
  // This parser tries a list of parsers in order and returns the first successful result.
  var parsers = arguments
  ; // 'arguments' is an array-like object containing all arguments passed to the function.

  return function ( target , pos ) {
    // The returned function is the choice parser.
    // for (var i = 0; i < parsers.length; i++) { // Original loop style, now commented out.

    for ( let parser of parsers ) {
      // Iterate over each parser provided in the arguments.
      var parsed = parser( target , pos )
      ; // Attempt to parse the target string at the current position with the parser.

      if ( parsed[ 0 ] ) {
        // Check if the parsing attempt was successful (parsed[0] is true).
        return parsed
        ; // If successful, return the result immediately.
      }
    }

    return [ false , null , pos ]
    ; // If no parser succeeded, return a failure result.
  }
  ; // End of choice parser function.
} // End of choice function definition.

/*
 * The following functions (seq, lazy, fmap, oneOf)
 * and the main execution block are currently
 * commented out. They represent a more complete
 * parsing library and its usage, but are not
 * active in the current code.
 *
 * They are preserved here in their commented-out state
 * as part of the original source, with some
 * formatting adjustments for Type I cloning.
 */

/*
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
*/

/*
// function lazy(f) {
//   let parser;
//   return function (target, position) {
//     if (!parser) parser = f();
//     return parser(target, position);
//   };
// }
*/

/*
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
*/

/*
// function oneOf(s) {
//   let d = {};
//   for (let c of s) d[c] = c;
//   return (target, pos) => {
//     const c = target.substr(pos, 1);
//     return d[c] ? [true, c, pos + 1] : [false, null, pos];
//   };
// }
*/

/*
// This block is the main entry point for processing input,
// but it is currently entirely commented out.
// It seems to be designed to read from stdin, parse
// logical formulas, and evaluate their truthfulness.

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
*/