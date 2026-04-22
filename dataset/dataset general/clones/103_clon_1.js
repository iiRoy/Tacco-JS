describe ( 'audio-js' , function ( ) {
  // This block tests the core audio-js functionality.
  describe ( 'instance' , function ( ) {
    it ( 'should exist function audioJS' , function ( ) {
      expect ( audioJS ) . toBeDefined ( ) ;
    } ) ;

    it ( 'should throw exception if function audioJS not receive parameter when called' , function ( ) {
      // Define a function that calls audioJS without parameters.
      var instanceFunction = function ( ) {
        audioJS ( ) ;
      } ;

      expect ( instanceFunction ) . toThrow ( ) ;
    } ) ;

    describe ( 'parameters' , function ( ) {
      /*
       * Setup for parameter tests.
       * This beforeEach hook defines a helper function.
       */
      beforeEach ( function ( ) {
        this . verifyInstanceWithParameters = function ( params ) {
          var audio = audioJS ( params ) ;
          var isObject = typeof audio === 'object' ;
          // Expect the returned value to be an object.
          expect ( isObject ) . toBeTruthy ( ) ;
        } ;
      } ) ;

      it ( 'should be posible create instance receiving string as parameter' , function ( ) {
        this . verifyInstanceWithParameters ( 'abertura.mp3' ) ;
      } ) ;

      it ( 'should be posible create instance receiving dict as parameter' , function ( ) {
        this . verifyInstanceWithParameters ( {
          file : 'audio.mp3' ,
          autoPlay : true
        } ) ;
      } ) ;

      it ( 'should be posible create instance receiving file as string parameter' , function ( ) {
        this . verifyInstanceWithParameters ( 'audio.mp3' ) ;
      } ) ;

      it ( 'should generate exception if the file format is invalid' , function ( ) {
        var instanceFunction = function ( ) {
          audioJS ( 'audio.mp4' ) ; // Invalid file type
        } ;

        expect ( instanceFunction ) . toThrow ( ) ;
      } ) ;
    } ) ;
  } ) ;


  describe ( 'methods' , function ( ) {
    // Setup for method tests.
    beforeEach ( function ( ) {
      this . audioJS = window . audioJS ( {
        file : 'audio.mp3'
      } ) ;

      this . verifyMethod = function ( method ) {
        var isMethod = typeof this . audioJS [ method ] === 'function' ;
        expect ( isMethod ) . toBeTruthy ( ) ;
      } ;
    } ) ;

    it ( 'should exist method play' , function ( ) {
      this . verifyMethod ( 'play' ) ;
    } ) ;

    it ( 'should exist method stop' , function ( ) {
      this . verifyMethod ( 'stop' ) ;
    } ) ;
  } ) ;


  describe ( 'methods with loop' , function ( ) {
    /*
     * This block specifically tests methods
     * when the audio instance is configured with looping.
     */
    beforeEach ( function ( ) {
      this . audioJS = window . audioJS ( {
        file : 'audio.mp3' ,
        loop : true
      } ) ;

      this . verifyMethod = function ( method ) {
        var isMethod = typeof this . audioJS [ method ] === 'function' ;
        expect ( isMethod ) . toBeTruthy ( ) ;
      } ;
    } ) ;

    it ( 'should exist method play' , function ( ) {
      this . verifyMethod ( 'play' ) ;
    } ) ;

    it ( 'should exist method stop' , function ( ) {
      this . verifyMethod ( 'stop' ) ;
    } ) ;
  } ) ;


  describe ( 'play and re-play' , function ( ) {
    // Tests for playing and replaying audio.
    beforeEach ( function ( ) {
      this . audioJS = window . audioJS ( {
        file : 'audio.mp3' ,
        loop : false
      } ) ;

      this . verifyMethod = function ( method ) {
        var isMethod = typeof this . audioJS [ method ] === 'function' ;
        expect ( isMethod ) . toBeTruthy ( ) ;
      } ;
    } ) ;

    it ( 'should exist method play' , function ( ) {
      this . verifyMethod ( 'play' ) ;
    } ) ;

    it ( 'should exist method stop' , function ( ) {
      this . verifyMethod ( 'stop' ) ;
    } ) ;

    it ( 'should be able to stop and play again' , function ( ) {
      this . audioJS . stop ( ) ; // Stop the audio.
      this . audioJS . play ( ) ; // Play it again.
    } ) ;
  } ) ;
} ) ;