'use strict';
// JavaScript Array permutation generator
// (optimized from CoffeeScript output: see ArrayPermutation.coffee)
(function() {
  var generatePermutation = function(perm, pre, post, n) {
    var elem, i, rest, len;
    if (n > 0)
      for (i = 0, len = post.length; i < len; ++i) {
        rest = post.slice(0);
        elem = rest.splice(i, 1);
        generatePermutation(perm, pre.concat(elem), rest, n - 1);
      }
    else
      perm.push(pre);
  };

  /*
  extend Array.prototype
  e.g. [0, 1, 2].permutation(2)
  => [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]]
  */
  Array.prototype.permutation = function(n) {
    if (n == null) n = this.length;
    var perm = [];
    generatePermutation(perm, [], this, n);
    return perm;
  };
})();
const main = input => {
  const n = parseInt(input[0]);
  const p = input[1].split(' ').map(val => parseInt(val));
  const q = input[2].split(' ').map(val => parseInt(val));
  let pStr = p.join('');
  let qStr = q.join('');
  // console.log(pStr, qStr);
  // console.log(p.permutation());
  let str = p.permutation().map(val => val.join(''));
  // console.log(str);
  str.sort();
  // console.log(str);
  let pId, qId;
  for(let i=0; i<str.length; i++) {
    if (pStr == str[i]) pId = i;
    if (qStr == str[i]) qId = i;
  }
  console.log(Math.abs(pId-qId));
  
}
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));