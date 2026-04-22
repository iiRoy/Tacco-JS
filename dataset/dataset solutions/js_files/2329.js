#!/bin/bash
':' /*
docker run --rm -it -v $(cd $(dirname $0) && pwd):/vo:ro node:5.2-slim \
  /bin/bash -c "node /vo/$(basename $0) < /vo/g.inp"; exit $?
exit 0
*/

"use strict";

const main = (input) => {
  let n = Number.parseInt(input[0]);
  let a = Array.from(input[1].split(" "), x => Number.parseInt(x));

  let cnt = 1;
  for(let ai of a) {
    if(ai==cnt) cnt+=1;
  }

  return cnt==1 ? -1 : n - cnt + 1;
};
console.log(main(require("fs").readFileSync("/dev/stdin", "utf-8")
  .trim().split("\n")));
