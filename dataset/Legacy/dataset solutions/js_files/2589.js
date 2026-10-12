const Main = (input) => {
    a = input.split('\n')
    b = a[0].split('')
    c = a[1].split('')
    n = 0
    for (index = 0; index < b.length; index++) {
        if (b[index] == c[index]) {n += 1} 
    }
    console.log(n);
}
   
Main(require("fs").readFileSync("/dev/stdin", "utf8"));