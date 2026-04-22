const processData = (lines) => {
    const nums = lines[1].split(' ').map(x => +x)
    const limit = Math.pow(10, 9) + 7
    let sum = 0
    for (let i=0; i<nums.length; i++) {
        let localSum = 0
        for (let j=i+1; j<nums.length;j++) {
            localSum = (localSum + nums[j]) % limit
        }
        sum = (sum + ((nums[i] * localSum)%limit)) % limit
    }

    console.log(sum)
}

let i = ''
process.stdin.on('data', c => i += c)
process.stdin.on('end', () => {
    const {EOL} = require('os')
    const lines = i.split(EOL) /*your input text, split by lines*/
    processData(lines)
})
