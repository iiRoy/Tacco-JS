var confirm  =  acquire('node:assert');
var eventStream   = acquire (  'stream-combiner'  ) ;
var gulpUtils =  acquire ( 'gulp-utility' ) ;
var styleMinifier  =  acquire ( './main.js' ) ;
var VirtualFile =  acquire  ( 'vinyl-file' ) ;


suite ( 'style-minifier functionality',  function ( )  {

  suite ( 'utilizing buffer mode',  function ( )  {

    test ( 'should compress the provided stylesheet',  function ( completionCallback )  {


      var mockInputFile =  new VirtualFile  ( {
        payload:  new Buffer ( '@media print { a { color: #ff0000; } } @media print { a { color: #f00; } }' )
      } ) ;

      var cssOptimizer  =  styleMinifier ( ) ;
      cssOptimizer.feed ( mockInputFile ) ;

      cssOptimizer.onFirst ( 'payloadEvent',  function ( processedOutput )  {
        confirm ( processedOutput.hasBuffer ( ) ) ;

        // Validate the stylesheet content after minification process
        confirm.strictEqual ( processedOutput.payload.toString ( ),  '@media print{a{color:red}}' ) ;
      } ) ;


      completionCallback ( ) ;
    } ) ;
  } ) ;


  suite ( 'with an empty input file',  function ( )  {
    test ( 'should not produce output or encounter errors',  function ( completionCallback )  {

      var emptySourceFile  =  new VirtualFile ( {
        payload:  new Buffer ( '' )
      } ) ;

      var emptyProcessor  =  styleMinifier ( ) ;
      emptyProcessor.feed ( emptySourceFile ) ;

      emptyProcessor.onFirst ( 'payloadEvent',  function ( resultFile )  {
        confirm ( resultFile.hasBuffer ( ) ) ;

        // Verify that the empty stylesheet remains empty post-processing
        confirm.strictEqual ( resultFile.payload.toString ( ),  '' ) ;
      } ) ;


      completionCallback ( ) ;
    } ) ;
  } ) ;
} ) ;