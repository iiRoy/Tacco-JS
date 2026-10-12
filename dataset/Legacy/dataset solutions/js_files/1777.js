function main(lines) {
  const input = lines.split('\n')
  const array = input[1].split(' ').map(Number)

  let count = 0;
  for(let i=0; i<array.length; i++){
      let test = array[i]
      for(let j=0; j<array.length; j++){
          if(i != j && test % array[j] === 0){
              count++
              break
          }
      }
  }
  console.log(array.length - count)
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

