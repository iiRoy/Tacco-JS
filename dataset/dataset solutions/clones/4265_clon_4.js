var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n↑入力 ↓出力');
  processInputAndCompute();
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

function calculateTriplets(alpha_collection, beta_collection, gamma_collection) {
  alpha_collection.sort((first, second) => first - second);
  beta_collection.sort((first, second) => first - second);
  gamma_collection.sort((first, second) => first - second);

  let accumulated_result = 0;
  let alpha_indicator = 0;
  let gamma_indicator = gamma_collection.length - 1;

  for (let current_beta_element of beta_collection) {
    while (alpha_indicator < alpha_collection.length && alpha_collection[alpha_indicator] < current_beta_element) {
      alpha_indicator++;
    }
    const count_from_alpha = alpha_indicator;

    while (gamma_indicator >= 0 && gamma_collection[gamma_indicator] > current_beta_element) {
      gamma_indicator--;
    }
    const count_from_gamma = gamma_collection.length - (gamma_indicator + 1);

    accumulated_result += count_from_alpha * count_from_gamma;
  }
  return accumulated_result;
}

function processInputAndCompute() {
  const quantity_of_elements = nextInt();
  const set_A = nextIntArray();
  const set_B = nextIntArray();
  const set_C = nextIntArray();

  const final_tally = calculateTriplets(set_A, set_B, set_C);
  myout(final_tally);
}