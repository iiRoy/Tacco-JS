function main(arg) {
  const a = arg.split(/\r\n|\r|\n/).map(item => item.split(' ').map(Number))

  if (a[1][1] === 1) {
    console.log(1)
  } else {
    console.log(0)
  }
}