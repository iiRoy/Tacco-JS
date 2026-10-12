function Main(input) {
    input = input.split('\n');
    nidan = input[1].split(' ') ;
    flag = null;
    for(i = 0; i < nidan.length-1; i++) {
        if(nidan[i] === 'Y') {
            flag = true;
        }
    }
    if(flag) {
        console.log('Four');
} else {
    console.log('Three');
}
    
    }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));