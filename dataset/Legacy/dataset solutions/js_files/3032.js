function main(arg) {
    var args = args.split(' ').map(parseInt.bind(null, 10))
    if((args[0] <= args[2] && args[2] <= args[1]) || (args[1] <= args[2] && args[1] <= args[2])){
        console.log('Yes')
    }else{
        console.log('No')
    }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));