function Main(input) {
  const inputChars = input.toString().split('')
  const lastChar = inputChars[inputChars.length - 1]
  let text = ''
  
  if(
    lastChar === "2" ||
    lastChar === "4" ||
    lastChar === "5" ||
    lastChar === "7" ||
    lastChar === "9"
  ) {
     text = "hon"
  } else if (
    lastChar === "0" ||
    lastChar === "1" ||
    lastChar === "6" ||
    lastChar === "8"
  ) {
     text = "pon"     
  } else {
     text = "bon"
  }
  
  console.log(text)
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));