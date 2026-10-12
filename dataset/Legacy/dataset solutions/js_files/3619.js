function main(arg) {
    arg = arg.split("\n")
    arg = arg.split(" ")
    arg[0] = parseInt(arg[0], 10)
    arg[1] = parseInt(arg[1], 10)
    console.log(arg[0]%arg[1])
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));