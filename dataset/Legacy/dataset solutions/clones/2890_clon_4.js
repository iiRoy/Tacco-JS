function run(source) {
  const eightVisibleNonO = /^(?:o*[^o\n]){8}/;
  process.stdout.write(eightVisibleNonO.test(source) ? "NO\n" : "YES\n");
}

run(require("fs").readFileSync("/dev/stdin", "utf8"));
