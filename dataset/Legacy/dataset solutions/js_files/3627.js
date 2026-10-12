function main(arg) {
    arg = arg.split("\n")
    arg = parseInt(arg[0], 10)

    var result = 0
    var i = 0
    for (i = 0; i < Math.pow(10,9); i++){
        var num2 = i.toString(2)

        var tmp = 0
        for (var j = 0; j < num2.length; j++) {
            if (num2[j] === '0') {
                continue
            }
            tmp += Math.pow(-2,j)
        }
        if (tmp === arg) {
            result = num2
            break
        }
    }
    console.log(num2.split("").reverse().join(""))
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));