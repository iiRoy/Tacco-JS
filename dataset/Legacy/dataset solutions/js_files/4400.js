'use strict'

function Main(input) {
  const S = input;
  const chars = new Set();
  for (let i = 0; i < S.length; i++) {
	chars.add(S[i]);
  }

  const sorted = Array.from(chars.values()).sort();
  let firstChar = 'a';
  for (let c of sorted.reverse()) {
    switch(c) {
      case 'a':
        firstChar = 'b';
        break;
      case 'b':
        firstChar = 'c';
        break;
      case 'c':
        firstChar = 'd';
        break;
      case 'd':
        firstChar = 'e';
        break;
      case 'e':
        firstChar = 'f';
        break;
      case 'f':
        firstChar = 'g';
        break;
      case 'g':
        firstChar = 'h';
        break;
      case 'h':
        firstChar = 'i';
        break;
      case 'i':
        firstChar = 'j';
        break;
      case 'j':
        firstChar = 'k';
        break;
      case 'k':
        firstChar = 'l';
        break;
      case 'l':
        firstChar = 'm';
        break;
      case 'm':
        firstChar = 'n';
        break;
      case 'n':
        firstChar = 'o';
        break;
      case 'o':
        firstChar = 'p';
        break;
      case 'p':
        firstChar = 'q';
        break;
      case 'q':
        firstChar = 'r';
        break;
      case 'r':
        firstChar = 's';
        break;
      case 's':
        firstChar = 't';
        break;
      case 't':
        firstChar = 'u';
        break;
      case 'u':
        firstChar = 'v';
        break;
      case 'v':
        firstChar = 'w';
        break;
      case 'w':
        firstChar = 'x';
        break;
      case 'x':
        firstChar = 'y';
        break;
      case 'y':
        firstChar = 'z';
        break;
      case 'z':
        firstChar = 'None';
        break;
    }
  }
  console.log(firstChar);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));