require
(
  "fs"
)
. readFileSync
(
  "/dev/stdin"
,
  "UTF-8"
)
. split
(
  '\n'
)
. map
(
  ( inputLine ) =>
  {
    let
      segmentCollection
      =
      inputLine
        . split
        (
          ' '
        )
    ;

    if
    (
      segmentCollection
      [
        2
      ]
    )
    {

      console
        . log
        (
          (
            (
              Number
              (
                segmentCollection
                [
                  3
                ]
              )
              -
              Number
              (
                segmentCollection
                [
                  1
                ]
              )
            )
            /
            (
              Number
              (
                segmentCollection
                [
                  2
                ]
              )
              -
              Number
              (
                segmentCollection
                [
                  0
                ]
              )
            )
          )
          . toFixed
          (
            6
          )

          ===

          (
            (
              Number
              (
                segmentCollection
                [
                  7
                ]
              )
              -
              Number
              (
                segmentCollection
                [
                  5
                ]
              )
            )
            /
            (
              Number
              (
                segmentCollection
                [
                  6
                ]
              )
              -
              Number
              (
                segmentCollection
                [
                  4
                ]
              )
            )
          )
          . toFixed
          (
            6
          )
          ?
            'SUCCESS'
          :
            'FAILURE'
        )
      ;

    }
  }
)
;