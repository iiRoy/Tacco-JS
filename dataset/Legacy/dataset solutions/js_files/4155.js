( i => {
  i = i.split('\n').map((val, index) => index ? val.split('').sort().join('') : val.split('').sort().reverse().join(''));

  console.log(i)

  console.log(i[0] > i[1] ? 'Yes' : 'No')
})(require("fs").readFileSync("/dev/stdin", "utf8"))