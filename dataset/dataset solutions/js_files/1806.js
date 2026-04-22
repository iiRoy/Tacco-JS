process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputData = '';

process.stdin.on('data', inputStdin => {
  inputData += inputStdin;
});

process.stdin.on('end', _ => {
  inputData = inputData.replace(/\s*$/g, '')
    .split(' ');
  main();
});

function main() {
  let result = inputData.reduce((a, b) => a * b);

  process.stdout.write(result.toString())
}
