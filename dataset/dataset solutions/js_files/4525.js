'use strict'

const main = (input) => {
    const nums = input.split('\n')[1].split(' ').map(v => parseInt(v)).sort((a, b) => a - b)
    console.log(nums[nums.length - 1] - nums[0])
}

main(require('fs').readFileSync('/dev/stdin', 'utf-8'))