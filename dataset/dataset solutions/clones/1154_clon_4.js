var universeSize;
var parentRegistry = new Map();
var componentSizes = new Map();

function initializeStructure(count){
	for(let i = 0; i < count; ++i){
		parentRegistry.set(i, i);
		componentSizes.set(i, 1);
	}
}

function locateRepresentative(element){
	if(parentRegistry.get(element) === element){
		return element;
	}
	const root = locateRepresentative(parentRegistry.get(element));
	parentRegistry.set(element, root);
	return root;
}

function areConnected(elementA, elementB){
	return locateRepresentative(elementA) === locateRepresentative(elementB);
}

function mergeSets(elementA, elementB){
	let rootA = locateRepresentative(elementA);
	let rootB = locateRepresentative(elementB);

	if(rootA === rootB){
		return;
	}

	let sizeA = componentSizes.get(rootA);
	let sizeB = componentSizes.get(rootB);

	if(sizeA < sizeB){
		parentRegistry.set(rootA, rootB);
		componentSizes.set(rootB, sizeA + sizeB);
	}
	else{
		parentRegistry.set(rootB, rootA);
		componentSizes.set(rootA, sizeA + sizeB);
	}
}

function processQueries(){
	universeSize = obtainValue();
	initializeStructure(universeSize);
	var queryCount = obtainValue();
	for(let i = 0; i < queryCount; ++i){
		var operationType = obtainValue();
		var valX = obtainValue();
		var valY = obtainValue();
		if(operationType === 0){
			mergeSets(valX, valY);
		}
		else{
			outputValue(+areConnected(valX, valY));
		}
	}
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
var rawInputBuffer = '';
var bufferPointer = 0;
 
function obtainValue(type){
	if(type === 'string'){
		return rawInputBuffer[bufferPointer++];
	}
	else{
		return +rawInputBuffer[bufferPointer++];
	}
}
 
function outputValue(val){
	console.log(val);
}
 
process.stdin.on('data', function(chunk){
	rawInputBuffer += chunk;
});
process.stdin.on('end', function(){
	rawInputBuffer = rawInputBuffer.split(/\s+/);
	processQueries();
});
