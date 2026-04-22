function main(lines) {
    const input = lines.split('')
    const lastNumber = input[input.length-1]
    let output = ''
    if(lastNumber == 2 || lastNumber == 4 || lastNumber == 5 || lastNumber == 7 || lastNumber == 9){
      console.log('hon')
      return;
    } else if (lastNumber == 3) {
      console.log('bon')
      return;
    } else if(lastNumber == 0 || lastNumber == 1 || lastNumber == 6 || lastNumber == 8) {
      console.log('pon')
      return;
    }
  }

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
