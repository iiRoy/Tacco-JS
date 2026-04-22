let numStrings = sourceData.split(/\s/);
let currentValSq;
for(let processingIndex=0;numStrings[processingIndex]*numStrings[processingIndex+1]!=0;processingIndex+=2)
{
	currentValSq = numStrings[processingIndex]*numStrings[processingIndex]; /* Calculate the square of the initial value. */
	console.log(numStrings[processingIndex] * Math.sqrt(4*numStrings[processingIndex+1]*numStrings[processingIndex+1] + currentValSq) + currentValSq);
}