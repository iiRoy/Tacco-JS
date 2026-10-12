function main(lines) {
  const K = +lines[0];
  const S = lines[1];

  let res = K < S.length ? S.slice(0, K) + '...' : S;

  console.log(res);
}


main( require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n") );



function splitN(s) {
  return s.split(' ').map(Number);
}