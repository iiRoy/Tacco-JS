function Main(s) {
  s = s.trim();
  console.log(/^(A|)KIH(A|)B(A|)R(A|)$/.test(s) ? "YES" : "NO");
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));