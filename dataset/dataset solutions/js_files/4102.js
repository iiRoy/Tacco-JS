function main(input) {
    const args = input.split(/\n/);
    const N = args[0],
          nums = args.slice(1, args.length - 1);
    
    console.log(nums.filter((n, i) => nums.indexOf(n) === i).length);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
