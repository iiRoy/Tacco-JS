const keyStr = (r, c) => `r${r}c${c}`

const calcMap = new Map();

const calc = (a, b, c, d) => {
  const key = keyStr(c, d);
  if (calcMap.has(key)) {
    return calcMap.get(key)
  }
  let ans;
  if (a === c) {
    ans = a ** (d - b);
  } else if (b === d) {
    ans = b ** (c - a);
  } else {
    ans = calc(a, b, c - 1n , d) * d +
      calc(a, b, c, d - 1n) * c -
      calc(a, b, c - 1n, d - 1n) * (c - 1n) * (d - 1n);
  }
  calcMap.set(keyStr(c, d), ans);
  return ans
}

const main = (input) => {
	const inputs = input.split("\n");
	const [a, b, c, d] = inputs[0].split(" ").map(num => BigInt(num));
  	console.log(Number(calc(a, b, c, d)  % 998244353n))
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));