// This module handles basic string processing tasks.
function processInput(  rawData  ) {
  let textSegment = rawData.split(
    "\n"
  )[  0  ];  // Extracting the initial line from the provided data.

  if (
    textSegment.length
    ===
    2
  )
  {
    console.log(
      textSegment
    );
  }
  else if (
    textSegment.length
    ===
    3
  )
  {
    // Reversing the characters of a three-character segment.
    console.log(
      textSegment[  2  ]
      +
      textSegment[  1  ]
      +
      textSegment[  0  ]
    );
  }
}

processInput(
  require('fs').readFileSync(
    '/dev/stdin',
    'utf8'
  )
);