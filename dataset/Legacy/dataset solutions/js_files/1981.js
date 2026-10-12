process.stdin.setEncoding('utf-8');
process.stdin.on('data', function (data) {
  let sum = 0
  for (let i = 1; i < Number(data) + 1; i++) {
    if(i % 3 !== 0 && i % 5 !== 0){
      sum = sum + i
    }
  }
  console.log(sum)
});