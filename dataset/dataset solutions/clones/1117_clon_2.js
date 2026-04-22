const   inputLines    = require  ('fs') . readFileSync (   '/dev/stdin'  , 'utf-8'   ).  split(  '\n' )  ;

const siftDown = (  collection  ,  rootIndex   ) =>
{
    const leftChildIdx  = rootIndex * 2   ;
    const rightChildIdx = leftChildIdx + 1;
    let largestIdx      ;

    if (    leftChildIdx <= collection.length && collection[leftChildIdx - 1] > collection[rootIndex - 1]   )
    {
        largestIdx = leftChildIdx;
    }
    else
    {
        largestIdx = rootIndex;
    }

    if  (   rightChildIdx <= collection.length  &&  collection[rightChildIdx - 1] > collection[largestIdx - 1]   )
    {
        largestIdx = rightChildIdx;
    }

    if  (   largestIdx  !== rootIndex   )
    {
        const tempVal = collection[rootIndex - 1] ;
        collection[rootIndex - 1] = collection[largestIdx - 1] ;
        collection[largestIdx - 1] = tempVal ;
        siftDown( collection, largestIdx ) ;
    }

};

const constructHeap = theCollection => {
    for (  let k = Math.floor(theCollection.length / 2) ; k > 0 ; k--   )
    {
        siftDown( theCollection, k ) ;
    }

    return theCollection  ;
} ;

const addValue = (  targetArray  ,  newValue   ) => {
    if ( targetArray[0] < newValue ) {
        targetArray.unshift(newValue);
        return targetArray;
    }
    else
    {
        targetArray.unshift(newValue);
        return constructHeap(targetArray);
    }
};

const removeMax = sourceArray => {
    const extractedVal = sourceArray.shift();
    sourceArray.unshift(sourceArray.pop());
    constructHeap(sourceArray);
    return extractedVal;
};

const finalStructure = inputLines.reduce((accumulator, singleCommand) => {
    const commandParts = singleCommand.split(' ');
    switch (commandParts[0]) {
        case 'insert':
            return addValue(accumulator, parseInt(commandParts[1], 10));
        case 'extract':
            console.log(removeMax(accumulator));
            return accumulator;
    }
}, []);