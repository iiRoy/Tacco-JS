function main(lines) {
    const input = lines.split('\n')
    for(let i=0; i<input.length; i+=2){
        if(input[i] == '0'){
            break;
        }

        let output = ''
        let tmpCalc = 0

        for(let k=0; k<input[i]-0; k++){
            const tmpArray = input[i+1].split(' ')
            const average = tmpArray.reduce(function(a,b){return (a-0)+(b-0)})/input[i]

            tmpCalc += Math.pow( tmpArray[k] - average, 2 ) / input[i]
        }
            output += (Math.sqrt(tmpCalc)).toFixed(4)
            console.log(output)
    }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

