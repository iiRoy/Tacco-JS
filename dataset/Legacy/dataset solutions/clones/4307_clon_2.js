function Run(data) {
console.log(data.slice(0,data.lastIndexOf('FESTIVAL')));
}

Run(require('fs').readFileSync('/dev/stdin', 'utf8'));
