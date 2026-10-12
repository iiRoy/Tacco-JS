const Main = input => {
  input = input.split("\n")

  const sentence = input[0]
  const word = input[1]

  const rec = (i, temp, bool, count) => {
    if (i === word.length) return count
    const idx = temp.indexOf(word[i])
    return (idx != -1)
      ? rec(i + 1, temp.slice(idx, temp.length), true, count + idx)
      : bool ? rec(i, temp + sentence, false, count) : -1
  }

  console.log(rec(0, sentence, false, 1))
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"))