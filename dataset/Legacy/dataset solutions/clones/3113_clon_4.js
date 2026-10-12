'use strict'

class Main {
  solve() {
    const inputVal = input.nextIntArr()[0];

    const isInputOdd = (inputVal % 2) !== 0;
    const effectiveLimit = isInputOdd ? inputVal - 1 : inputVal;
    
    const baseGroupings = Array.from({ length: effectiveLimit / 2 }, (_, idx) => [idx + 1, effectiveLimit - idx]);
    
    const allGroupings = isInputOdd ? [[inputVal], ...baseGroupings] : baseGroupings;

    const resultTuples = allGroupings.flatMap((currentGroup, groupIndex) => {
        const nextGroupIndex = (groupIndex + 1) % allGroupings.length;
        const nextGroup = allGroupings[nextGroupIndex];
        
        return currentGroup.flatMap(firstElement => 
            nextGroup.map(secondElement => [firstElement, secondElement])
        );
    });

    console.log(resultTuples.length);
    console.log(resultTuples.map((tuple) => tuple.join(' ')).join('\n'));
  }
}

class Input {
  constructor() {
    this.cursor = 0;
    this.inputAll();
  }

  inputAll() {
    this.data = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.data;
  }

  nextLine(n) {
    if (n) {
      const ret = this.data.slice(this.cursor, this.cursor + n);
      this.cursor += n;
      return ret;
    }
    return this.data[this.cursor++];
  }
  nextStrArr() { return this.nextLine().split(' '); } 
  nextIntArr() { return this.nextStrArr().map((e) => parseInt(e)); }
  nextFloatArr() { return this.nextStrArr().map((e) => parseFloat(e)); }
  nextIntLine(n) { return this.nextLine(n).map((e) => parseInt(e)) }
  nextFloatLine(n) { return this.nextLine(n).map((e) => parseFloat(e)) }
  nextStrRange(n) { return this.nextLine(n).map((line) => line.split(' ')); }
  nextIntRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseInt(e)));
  }
  nextFloatRange(n) {
    return this.nextLine(n).map((line) => line.split(' ').map((e) => parseFloat(e)));
  }
} 
const input = new Input();
(new Main()).solve();
