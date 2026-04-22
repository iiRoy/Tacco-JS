const isUpperCase = c => {
  return /^[A-Z]+$/g.test(c)
}

function Main(input) {
    input = input.split("\n");
    
    const hoge = input[0];
    
    if (isUpperCase(hoge)) {
        console.log('A');
    } else {
        console.log('a');
    }
}
