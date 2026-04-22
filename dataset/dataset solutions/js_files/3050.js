function Main(input){
  input_text = input.split('\n');
  H = input_text[1].split(' ').map(n=>parseInt(n));
  S = 0;
  max = 0;
  H.forEach(n => {
    if (n >= max) {
      S++;
      max = n;
    }
  });
  console.log(S);
}

Main(require("fs").readFileSync("/dev/stdin","utf-8"));
