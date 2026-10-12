'use strict'

function main(s) {
  s = s.split('\n');

  const city  = Number(s[0].split(' ')[0]);
  const roads = [];

  s.slice(1, -1).forEach((road) => {
    road = road.split(' ');
    roads.push(road[0]);
    roads.push(road[1]);
  });

  const ans = [...Array(city)].fill(0);
  for (const r of roads) {
    ans[Number(r) - 1] += 1;
  }

  console.log(ans.join('\n'));
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
