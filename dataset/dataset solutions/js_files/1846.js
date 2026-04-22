const main = arg => {
    const str = String(arg)
    let dig = Number(str[str.length-1])
    if([2,4,5,7,9].includes(dig)) console.log('hon')
    else if([0,1,6,8].includes(dig)) console.log('pon')
    else if(dig == 3) console.log('bon')
}
 
main(require('fs').readFileSync('/dev/stdin', 'utf8'))