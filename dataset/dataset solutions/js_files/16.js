let input = ''

process.stdin.resume()
process.stdin.setEncoding('utf8')
process.stdin.on('data', function(chunk) {
  input += chunk
})
process.stdin.on('end', function() {
  input = input.trim().split('\n')
  main()
})

function main() {
  dataset_num = input[0]
  if (dataset_num > 1000) {
    return
  }
  for(i=1; i<input.length; i++) {
    input_line = input[i].split(' ')
    input_line.sort(compareNumbers)
    // console.log(input_line)
    if(0 > input_line[0] || input_line[0] > 1000 ) {
        return
    }
    if(0 > input_line[1] || input_line[1] > 1000 ) {
        return
    }
    if(0 > input_line[2] || input_line[2] > 1000 ) {
        return
    }
    if (Math.pow(input_line[0],2) === Math.pow(input_line[1],2) + Math.pow(input_line[2],2)) {
      console.log('YES')
    } else {
      console.log('NO')
    }
    // console.log(Math.pow(input_line[0],2))
  }
}

function compareNumbers(a, b) {
  return b - a;
}
