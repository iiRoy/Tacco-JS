const MAX_PRIME_LIMIT = 50000;
const prime_sieve_flags = new Array(MAX_PRIME_LIMIT + 1).fill(true);
prime_sieve_flags[0] = false;
prime_sieve_flags[1] = false;

for (let current_num = 2; current_num * current_num <= MAX_PRIME_LIMIT; current_num++) {
  if (prime_sieve_flags[current_num]) {
    for (let multiple = current_num * current_num; multiple <= MAX_PRIME_LIMIT; multiple += current_num) {
      prime_sieve_flags[multiple] = false;
    }
  }
}

const prime_numbers_list = [];
for (let num_idx = 2; num_idx <= MAX_PRIME_LIMIT; num_idx++) {
  if (prime_sieve_flags[num_idx]) {
    prime_numbers_list.push(num_idx);
  }
}

function processInputData() {
  let current_line_index = 0;
  const total_lines = rawInputLines.length;

  const processNextLine = () => {
    if (current_line_index >= total_lines) {
      return;
    }

    const current_input_value = parseInt(rawInputLines[current_line_index], 10);
    current_line_index++;

    if (current_input_value === 0) {
      return;
    }

    const half_value = Math.floor(current_input_value / 2);

    const pair_count = prime_numbers_list.reduce((accumulator, current_prime_candidate) => {
      if (current_prime_candidate > half_value) {
        return accumulator;
      }

      const complement_candidate = current_input_value - current_prime_candidate;

      if (prime_sieve_flags[complement_candidate]) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);

    console.log(pair_count);

    processNextLine();
  };

  processNextLine();
}

let rawInputLines = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputLines += chunk;
});
process.stdin.on('end', function() {
  rawInputLines = rawInputLines.split('\n');
  processInputData();
});
