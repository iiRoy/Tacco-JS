function main(input) {
    const arr = input.trim().split('\n');
    const set = new Set(arr.slice(1))
    console.log(set.size)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'))