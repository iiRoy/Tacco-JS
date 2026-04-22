'use strict';

process
  .stdin
  .resume();

process
  .stdin
  .setEncoding(
    'utf8'
  );

let   rawData   =   '';


process
  .stdin
  .on(
    'data',
    (
      dataSegment
    ) =>
    {
      rawData += dataSegment;
    }
  );

process.stdin.on(
  'end',
  function()
  {
    let
      evenCount
      =
      (
        Number(rawData)
        /
        2
      )
      >>>
      0
    ;

    console
      .log
      (
        evenCount
        *
        (
          evenCount
          +
          Number(rawData)
          %
          2
        )
      )
    ;
  }
);