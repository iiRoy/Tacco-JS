function primeNumber (num) {

if(num === 2) {
    return true;
} else {

    for(i = 2; i < num; i++) {

        if(num % i === 0) {
            return false;
            break;
        }
        if(i + 1 === num) {
            return true;
        }
    }
}
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n")
input = input[1].split(" ")
var arr = []
input.forEach((e) =>{
  if(primeNumber(Number(e))) {
    arr.push(Number(e))
  }
})

var max = 0
for (var i = 1;;i++) {
  var current = 0
  arr.forEach((e) =>{
    current += i % e
  })

  if(current === 0) {
    break
  }

  if (max < current) {
    max = current
  }
}
console.log(max)