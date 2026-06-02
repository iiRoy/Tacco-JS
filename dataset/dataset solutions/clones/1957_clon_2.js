let inputRadius = parseInt(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);

console.log(inputRadius * Math.PI * 2);
