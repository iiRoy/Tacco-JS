function Main(input){

  var c = String(input);

  if( c === 'a' || c === 'i' || c === 'u' || c === 'e' || c === 'o') {
      console.log('vowel');
  } else {
    console.log('consonant');
  }


}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));