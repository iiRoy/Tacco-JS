let numberCollection = prompt("Please enter three space-separated integers:").split(' ').map(Number);

numberCollection.sort((valA, valB) => valA - valB);

if (numberCollection[0] + numberCollection[1] === numberCollection[2] || numberCollection[0] === numberCollection[1] + numberCollection[2]) {
  console.log('Yes');
} else {
  console.log('No');
}
