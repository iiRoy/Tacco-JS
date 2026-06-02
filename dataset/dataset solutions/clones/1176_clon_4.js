const inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');
inputSource.on('data', function(dataSegment) {
  const numericValues = dataSegment.match(/(\d+\.?\d*|\.\d+)/g).map(parseFloat);

  const sideA = numericValues[0];
  const sideB = numericValues[1];
  const angleGammaDegrees = numericValues[2];
  
  const angleGammaRadians = angleGammaDegrees * (Math.PI / 180);
  
  const sideC = Math.sqrt(sideA * sideA + sideB * sideB - 2 * sideA * sideB * Math.cos(angleGammaRadians));
  
  const triangleArea = 0.5 * sideA * sideB * Math.sin(angleGammaRadians);
  const trianglePerimeter = sideA + sideB + sideC;
  const triangleHeight = sideB * Math.sin(angleGammaRadians);
  
  console.log(triangleArea + '\n' + trianglePerimeter + '\n' + triangleHeight);
});
