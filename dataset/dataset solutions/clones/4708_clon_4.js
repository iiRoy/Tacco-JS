var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n↑入力 ↓出力');
  Main();
});
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  return {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

function Main(){
  const animalCount = nextInt();
  const observations = nextCharArray().map(char => char === "o" ? 0 : 1); // Map 'o' to 0, 'x' to 1

  // Numerical representation: 'S' = 0, 'W' = 1.
  // These correspond to the original `L = "S"` and `check[0] = "S"`.
  const initialPrevAnimalState = 0; // Represents the state of animal N-1 for the first step (i=0)
  const initialCurrentAnimalState = 0; // Represents the state of animal 0

  // Defines the rule for deriving the next animal's state based on its two predecessors and the current observation.
  // This expression replaces the original's complex nested if/else structure for determining `check.push()`.
  // The formula is: s_k+1 = (s_k + o_k + s_k-1) % 2
  const calculateNextState = (previousState, currentState, currentObservation) =>
    (currentState + currentObservation + previousState) % 2;

  // Utilizes Array.prototype.reduce for a functional approach to iteratively build the sequence of animal states.
  // The accumulator object maintains the sequence of states derived so far and the last two states required for the next calculation.
  const { derivedStates } = observations.reduce(
    (accumulator, currentObservation) => {
      const [prevS, currentS] = accumulator.lastPair;
      const nextS = calculateNextState(prevS, currentS, currentObservation);
      accumulator.derivedStates.push(nextS);
      accumulator.lastPair = [currentS, nextS]; // Update the last two states for the next iteration
      return accumulator;
    },
    // Initial accumulator state:
    // `derivedStates` starts with the state of animal 0.
    // `lastPair` holds the states corresponding to `s_k-1` and `s_k` for the first iteration (i=0).
    { derivedStates: [initialCurrentAnimalState], lastPair: [initialPrevAnimalState, initialCurrentAnimalState] }
  );

  // The original code checks `if(check[N] == L)`.
  // In our numerical representation, this translates to `derivedStates[animalCount] === 0`.
  const finalDerivedState = derivedStates[animalCount]; // This is s_N
  const expectedFinalState = 0; // This corresponds to the original `L = "S"`

  if (finalDerivedState === expectedFinalState) {
    // If the condition is met, convert the derived numerical sequence (excluding the N-th state, which is s_N)
    // back into "S" or "W" characters and output the result.
    const resultString = derivedStates.slice(0, animalCount).map(state => state === 0 ? "S" : "W").join("");
    myout(resultString);
  } else {
    // If the condition is not met, output -1, matching the original behavior.
    myout(-1);
  }
}
