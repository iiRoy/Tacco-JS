//Don't have to see. start------------------------------------------
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
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

//Don't have to see. end------------------------------------------
function Main(){
  var initialParams = nextIntArray();
  var nodeCount = initialParams[0];
  var queryCount = initialParams[1];
  var disjointSet = createDisjointSet(nodeCount);
  for(var qIdx = 0; qIdx < queryCount; qIdx++){
    var queryData = nextIntArray();
    var queryType = queryData[0];
    var firstNode = queryData[1];
    var secondNode = queryData[2];
    if(queryType === 0){
      disjointSet.uniteSets(firstNode, secondNode);
    }else{
      myout((disjointSet.checkConnection(firstNode, secondNode)) ? 1 : 0);
    }
  }
}

function createDisjointSet(elementCount){
  var parentArray = Array.from({length: elementCount}, (_, i) => i);
  var rankArray = new Array(elementCount).fill(0);
  var sizeArray = new Array(elementCount).fill(1);

  function findRepresentative(idx){
    let currentRoot = idx;
    while(parentArray[currentRoot] !== currentRoot){
      currentRoot = parentArray[currentRoot];
    }
    // Path compression: make every node on the path point directly to the root
    let nodeToCompress = idx;
    while(parentArray[nodeToCompress] !== currentRoot){
      let nextParent = parentArray[nodeToCompress];
      parentArray[nodeToCompress] = currentRoot;
      nodeToCompress = nextParent;
    }
    return currentRoot;
  }

  function uniteSets(idxA, idxB){
    let rootA = findRepresentative(idxA);
    let rootB = findRepresentative(idxB);

    if(rootA !== rootB){ // If they are not already in the same set
      // Union by rank heuristic
      if(rankArray[rootA] < rankArray[rootB]){
        parentArray[rootA] = rootB;
        sizeArray[rootB] += sizeArray[rootA]; // Update size of the new root
      } else if (rankArray[rootA] > rankArray[rootB]){
        parentArray[rootB] = rootA;
        sizeArray[rootA] += sizeArray[rootB]; // Update size of the new root
      } else { // Ranks are equal, pick one as root and increment its rank
        parentArray[rootB] = rootA;
        rankArray[rootA]++;
        sizeArray[rootA] += sizeArray[rootB]; // Update size of the new root
      }
      return true; // Indicates a successful union
    }
    return false; // Indicates they were already in the same set
  }

  function checkConnection(idxA, idxB){
    return findRepresentative(idxA) === findRepresentative(idxB);
  }

  function retrieveSetSize(idx){
    return sizeArray[findRepresentative(idx)];
  }

  return {
    findRepresentative: findRepresentative,
    uniteSets: uniteSets,
    checkConnection: checkConnection,
    retrieveSetSize: retrieveSetSize
  };
}
