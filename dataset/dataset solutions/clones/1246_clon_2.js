let   circleMeasurement =
  parseFloat
  (
    require('node:fs')
      .readFileSync
      (
        '/dev/stdin',
        'utf8'
      )
  )
;
process
  .stdout
  .write
  (
    (
      ( 3.1415926535897932384626433832795 * circleMeasurement * circleMeasurement )
        .toFixed( 6 )
    )
    + " "
    + (
      ( 2.0 * 3.1415926535897932384626433832795 * circleMeasurement )
        .toFixed( 6 )
    )
    + "\n"
  )
;