process.stdin.resume();
process.stdin.setEncoding('utf-8');
 
let inputString = '';
let currentLine = 0;
 
process.stdin.on('data', inputStdin => {
    inputString += inputStdin;
});
 
process.stdin.on('end', _ => {
    inputString = inputString.trim().split('\n').map(string => {
        return string.trim();
    });
    
    main();    
});
 
function readLine() {
    return inputString[currentLine++];
}

function main() {
  const n = Number(readLine())
  const cs = readLine()
  let s = 0, e = n - 1
  let result = 0
  const r = 'R', w = 'W'
  while (s <= e) {
    let wFound = false
    let rFound = false
    for (let i = s; i < e; i++) {
      if (cs[i] === r) {
        continue
      }
      wFound = true
      rFound = false
      for (let j = e; j > i; j--) {
        if (cs[j] === w) {
          continue
        }
        e = j - 1
        result += 1
        rFound = true
        break
      }
      if (!rFound) {
        break
      }
      s = i + 1
      break
    }
    if (!wFound || !rFound) {
      break
    }
  }
  console.log(result)
}
