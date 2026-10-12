function Main(input) {
    var N = parseInt(input, 10);
    function hoge(hoge) {
        var hogehoge = hoge.toString().split('').map(n => parseInt(n, 10))
        return hogehoge.reduce((a, b) => a + b);
    }
    if(N % hoge(N) === 0) {
        console.log('Yes');
    } else{
        console.log('No');
    }
    }
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));