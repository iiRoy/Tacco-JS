

(function main() {
  let line = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('');
  let height_list = [0];
  let current_height = 0;

  // 初めの上昇と平坦を除去
  while (line.length > 0 && line[0] !== '\\') line.shift();
  // 終わりの下降と平坦を除去
  while (line.length > 0 && line[line.length - 1] !== '/') line.pop();

  line.forEach(function(e, i){
      if (e === '\\') current_height -= 1
      else if (e === '_') current_height += 0
      else current_height += 1
      height_list.push(current_height);
  });

  let sum = 0;
  let holes = [];
  for (;height_list.length > 1;) {
    let h = makeHole(height_list);
    if (h > 0) {
      sum += h;
      holes.push(h);
    }
  }

  console.log(sum);
  console.log(holes.length && holes.length + ' ' + holes.join(' '));
})();

function makeHole(list) {
    begin = list.shift();
    if (list[0] < begin && begin <= list.reduce((a, b) => Math.max(a, b), -100000)) {
    let area = 0;
      while (true) {
      if (list.length == 0 || begin <= list[0]) break;
        area += begin - list.shift();
      }
      return area;
    } else {
      return 0;
    }
}

