function main(input) {
    const args = input.split('\n');
    const [H, W] = args[0].split(' ');

    let iArray = new Array(H);
    for(let i = 0; i < H; i++) {
        iArray[i] = args[i+1];
    }

    for(let i = 0; i < H; i++) {
        console.log( iArray[i] );
        console.log( iArray[i] );
    }
}

main( require('fs').readFileSync('/dev/stdin', 'utf8') );