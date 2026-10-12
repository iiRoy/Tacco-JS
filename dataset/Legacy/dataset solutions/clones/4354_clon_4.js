(function(incomingText) {
    console.log(["ABC", incomingText].join(''));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
