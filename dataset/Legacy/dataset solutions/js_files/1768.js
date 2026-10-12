function main(input) {
  input = input.trim();
  const list = input.split(" ");
  list.forEach((v, i) => {
    if (Number(v) === 0) console.log(i + 1)
  })
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
