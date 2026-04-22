function main(input) {
    var  S = input.split(/\n/)[0].trim().split('');
    if(S.slice(-1)[0]=='s') S.push('es')
    else S.push('s')

    
    console.log(S.join(""));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));