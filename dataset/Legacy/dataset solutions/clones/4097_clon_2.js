console.log((sourceContent => sourceContent.replace(/7/, '8'))(require('fs').readFileSync('/dev/stdin', 'utf8')));
