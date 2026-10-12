function main(input) {
  const s = input
  let array = []
  for(let i=1; i<100; i++){
    array.push(2019*i)
  }
  
  let matchCounter = ''
  for(let j=0; j<array.length; j++){
    let regNumber = array[j]
    let match = s.match( new RegExp(`${regNumber}`, 'g'))
    if ((match || '').length > 0){
      matchCounter += '#'
    }
  }

  console.log(matchCounter.length)
  
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));