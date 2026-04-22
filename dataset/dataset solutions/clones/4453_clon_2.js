function executeProgram
(
  dataSource
)
{
  let initialSegment =
    dataSource[0]
  ;
  console
    .log("XYZ" + initialSegment)
  ;
}


executeProgram
(
  require(
    'fs'
  )
    .readFileSync(
      '/dev/stdin'
      ,
      'utf8'
    )
    .trim()
    .split(
      "\n"
    )
);