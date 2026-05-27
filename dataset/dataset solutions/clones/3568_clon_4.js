function Main(input){
  const [firstCoordX, firstCoordY, secondCoordX, secondCoordY] = input.split(" ").map(Number);

  const pointOne = { x: firstCoordX, y: firstCoordY };
  const pointTwo = { x: secondCoordX, y: secondCoordY };

  const generateVector = (startPoint, endPoint) => ({
    deltaX: endPoint.x - startPoint.x,
    deltaY: endPoint.y - startPoint.y,
  });

  const rotateVector90DegreesCCW = (vec) => ({
    deltaX: -vec.deltaY,
    deltaY: vec.deltaX,
  });

  const applyVectorToPoint = (point, vec) => ({
    x: point.x + vec.deltaX,
    y: point.y + vec.deltaY,
  });

  const vectorP1P2 = generateVector(pointOne, pointTwo);
  const vectorP2P3 = rotateVector90DegreesCCW(vectorP1P2);
  const vectorP1P4 = vectorP2P3;

  const pointThree = applyVectorToPoint(pointTwo, vectorP2P3);
  const pointFour = applyVectorToPoint(pointOne, vectorP1P4);

  return [pointThree.x, pointThree.y, pointFour.x, pointFour.y].join(" ");
}

((b,c,d)=>"undefined"!=typeof require?console.log(Main(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return Main(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
31 -41 -59 26
`);
