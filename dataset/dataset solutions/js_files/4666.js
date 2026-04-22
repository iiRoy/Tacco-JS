function main(lines) {
    const input = lines-0
    var output = []
    for(var i=1; i*i<= input; i++){
        var a = input/i
        var b = input/a
        output.push( Math.max(a.toString().length, b.toString().length) )
    }
    console.log(output.sort(function(a,b){return a-b})[0] )
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

