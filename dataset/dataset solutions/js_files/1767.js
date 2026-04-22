const main = (array) => {
    const args = array.split(" ")
    console.log(args.findIndex(element => element === "0") + 1)
}

main(require("fs").readFileSync('/dev/stdin', 'utf8'))