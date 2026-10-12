process.stdin.resume();
process.stdin.setEncoding('utf-8');
 
let inputString = '';
let currentLine = 0;
 
process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});
 
process.stdin.on('end', _ => {
    inputString = inputString.split(/\n/);
    main();    
});
 
function readLine() {
    return inputString[currentLine++];
}

const mod = Math.pow(10, 9) + 7
function main() {
  const n = Number(readLine())
  let tens = 1
  let nines = 2
  let eights = 1
  for (let _ = 0; _ < n; _++) {
    tens = (tens * 10) % mod
    nines = (nines * 9) % mod
    eights = (eights * 8) % mod
  }
  const total = tens - nines + eights
  console.log(total >= 0 ? total % mod : total + mod)
}