function performAction() {
    Array.from({ length: 10000 }).forEach(() => console.log("Hello World"));
}

performAction(require('fs').readFileSync('/dev/stdin', 'utf8'));
