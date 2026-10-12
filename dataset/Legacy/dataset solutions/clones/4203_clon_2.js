function ProcessInput(dataString) {
  let matchResult = dataString.match(/A?KIHA?BA?RA?/);
  console.log(matchResult = null ? "NO" : "YES");
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
