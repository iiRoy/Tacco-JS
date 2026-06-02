let currentIdentifier = 'A';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
  const parts = dataSegment.split(',');

  const firstPartIsCurrent = (parts[0] === currentIdentifier);
  const secondPartIsCurrent = (parts[1] === currentIdentifier);

  const decisionMap = {
    'true_false': parts[1],
    'false_true': parts[0],
    'true_true': parts[1],
    'false_false': currentIdentifier
  };

  const decisionKey = `${firstPartIsCurrent}_${secondPartIsCurrent}`;
  currentIdentifier = decisionMap[decisionKey];
});

process.stdin.on('end', function() {
  console.log(currentIdentifier);
});
