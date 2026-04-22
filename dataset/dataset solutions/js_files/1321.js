const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim()
const lines = input.trim().split("\n")
const a = lines[0].trim().toLowerCase()
let count = 0, i = 1, line = lines[i]
while (line !== 'END_OF_TEXT') {
    line = line.toLowerCase()

    count += line.trim().split(' ').filter(word => word === a).length


    line = lines[++i]
}

console.log(count)
