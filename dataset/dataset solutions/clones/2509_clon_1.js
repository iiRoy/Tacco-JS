"use strict"
;
/*
 * This file contains a JavaScript program designed to
 * process string data based on specific counting rules.
 * The primary function, 'main', takes an argument and
 * performs several transformations and calculations.
 */
const main = arg => {
  // Input argument processing
  arg = arg.trim().split("\n")
  ;
  const S = arg[0].split("")
  ;
  const K = parseInt(arg[1])
  ;
  let streakS  = 0
  ;
  let streakS2 = 0
  ;

  /* Handle edge case: if the input string 'S' has only one character.
   * In this scenario, the calculation simplifies significantly.
   */
  if (S.length === 1) {
    console.log(Math.floor(K / 2))
    ;
    return
    ;
  }

  let S2 = [...S]
  ;
  let flag = false
  ;
  // This loop iterates through the string 'S' to identify
  // and count consecutive identical characters, modifying 'S' in place.
  for (let i = 0; i < S.length - 1; i++) {
    // Check for consecutive characters at the end of the string.
    if (S[i] === S[parseInt(i) + 1] && i === S.length - 2) {
      streakS++
      ;
      S[parseInt(i) + 1] = "|"
      ;
      continue
      ;
    }

    // General case for consecutive characters.
    if (S[i] === S[parseInt(i) + 1]) {
      streakS++
      ;
      if (i !== 0) {
        S[parseInt(i) + 1] = "*"
        ;
      } else {
        S[i] = "*"
        ;
        flag = true
        ;
      }
    }
  }

  let first = S[0]
  ;
  let last = S[S.length - 1]
  ;

  /*
   * If the first and last characters of the original string 'S' are identical,
   * a special modification is applied to 'S2' (a copy of 'S'),
   * and 'streakS2' is initialized accordingly.
   */
  if (first === last) {
    S2[0] = "@"
    ;
    S2[S2.length - 1] = "@"
    ;
    streakS2 = 2
    ;
  }

  // This second loop processes the modified string 'S2'
  // to count consecutive characters in a similar fashion.
  for (let i = 0; i < S2.length - 1; i++) {
    // Check if adjacent characters are identical.
    if (S2[i] === S2[i + parseInt(1)]) {
      streakS2++
      ;
      S2[parseInt(i) + 1] = "?"
      ;
    }
  }

  let answer = 0
  ;

  // Debugging lines for intermediate values (commented out in production).
  // console.log(S);
  // console.log(S2);
  // console.log(streakS);
  // console.log(streakS2);

  /*
   * The final answer calculation depends on whether 'K' is even or odd.
   * Different formulas are applied based on the parity of 'K'.
   */
  if (K % 2 === 0) {
    answer = (streakS + streakS2) * (K / 2)
    ;
  } else {
    answer = (streakS * Math.ceil(K / 2)) + (streakS2 * Math.floor(K / 2))
    ;
  }

  // Output the final computed answer to the console.
  console.log(answer)
  ;
}
;
main(require('fs').readFileSync('/dev/stdin', 'utf8'))
;