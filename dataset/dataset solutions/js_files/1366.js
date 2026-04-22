function Main () {
    for(var i = 0; i < 10000; i++) {
        console.log("Hello World");
    }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));