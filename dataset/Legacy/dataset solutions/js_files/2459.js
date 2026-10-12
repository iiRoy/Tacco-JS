var code = require('fs').readFileSync('/dev/stdin','utf8').trim()

var prePattern = code[0]
var sNum = 0
var bNum = 0
var total = 0

if(code[0] === '>') {
  code = '<' + code
}

for(var i=0;i<code.length;) {
  for(;i<code.length;i++) {
    if(code[i] !== '<') break
      sNum += 1
  }
  for(;i<code.length;i++) {
    if(code[i] !== '>') break
      bNum += 1
  }

  if(sNum > bNum) {
    for(var j=0;j<=sNum;j++) total += j
    for(var j=0;j<bNum;j++) total += j
  } else {
    for(var j=0;j<sNum;j++) total += j
    for(var j=0;j<=bNum;j++) total += j
  }

  sNum = 0
  bNum = 0
}

console.log(total)
