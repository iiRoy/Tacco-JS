function Main(s) { 
    if (s[0] !== 'A') {
        console.log('WA');
        return;
    }

    var cutStr = s.slice(2, -1);
    if (cutStr.indexOf('C') === -1 || cutStr.split('C').length !== 2) {
        console.log('WA');
        return;
    }

    var str = s[1] + cutStr.slice(0, cutStr.indexOf('C')) + cutStr.slice(cutStr.indexOf('C') + 1) + s.slice(-1);

    if (str.match(/^[a-z]+$/)) {
        console.log('AC');
        return;
    }
    console.log('WA');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));