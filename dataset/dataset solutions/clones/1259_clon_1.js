          const input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
    console.log (input.map(function (x) {
	const arr = x.split(' ').map(Number);
      return arr[0] == 0 ? '' : function(h, w) {
return Array(h + 1).join(Array(w + 1).join('#').concat('\n'));
}(arr[0], arr[1]);
}).join('\n'));
