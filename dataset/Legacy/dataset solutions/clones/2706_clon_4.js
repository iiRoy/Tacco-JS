'use strict';

function processInput(inputLines) {
  const inputString = inputLines[0];
  const MOD_CONSTANT = 1000000007;
  const TARGET_REMAINDER = 5;
  const DIVISOR_VALUE = 13;

  const dp_matrix = Array.from({ length: inputString.length + 1 }, () =>
    Array(DIVISOR_VALUE).fill(0)
  );

  dp_matrix[0][0] = 1;

  for (let char_idx = 0; char_idx < inputString.length; char_idx++) {
    const current_char_symbol = inputString[char_idx];

    for (let prev_remainder_val = 0; prev_remainder_val < DIVISOR_VALUE; prev_remainder_val++) {
      if (dp_matrix[char_idx][prev_remainder_val] === 0) {
        continue;
      }

      if (current_char_symbol === '?') {
        for (let digit_choice = 0; digit_choice <= 9; digit_choice++) {
          const next_remainder_val = (prev_remainder_val * 10 + digit_choice) % DIVISOR_VALUE;
          dp_matrix[char_idx + 1][next_remainder_val] =
            (dp_matrix[char_idx + 1][next_remainder_val] +
              dp_matrix[char_idx][prev_remainder_val]) %
            MOD_CONSTANT;
        }
      } else {
        const specific_digit_val = Number(current_char_symbol);
        const next_remainder_val = (prev_remainder_val * 10 + specific_digit_val) % DIVISOR_VALUE;
        dp_matrix[char_idx + 1][next_remainder_val] =
          (dp_matrix[char_idx + 1][next_remainder_val] +
            dp_matrix[char_idx][prev_remainder_val]) %
          MOD_CONSTANT;
      }
    }
  }

  console.log(dp_matrix[inputString.length][TARGET_REMAINDER]);
}

function executeWithStandardInput() {
  let receivedInput = "";
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    receivedInput += chunk;
  });
  process.stdin.on("end", () => {
    processInput(receivedInput.split("\n"));
  });
}

executeWithStandardInput();
