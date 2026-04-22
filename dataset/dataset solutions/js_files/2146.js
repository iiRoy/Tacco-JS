function Main (S) {
  var s = S.split(' ') 
  if (s[0] === s[1] && s[0] !== s[2]) {
    console.log('Yes')
  } else if (s[0] === s[2] && s[0] !== s[1]) {
    console.log('Yes')
  } else if (s[2] === s[1] && s[0] !== s[2]) {
    console.log('Yes')
  } else {
    console.log('No')
  }
}
 
Main(require("fs").readFileSync("/dev/stdin", "utf8"));