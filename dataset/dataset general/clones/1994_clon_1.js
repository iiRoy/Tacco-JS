/*
 * This file contains utility functions for Jasmine tests,
 * specifically for handling asynchronous operations and
 * testing API interactions.
 */
// Original URL: "http://rhodes-store-server.heroku.com/application";


function   waitsForSpies ( spy ,  msg ,  timeout )
{

   timeout  =  timeout  ||  1000 ;

   // Determine if 'spy' is an array or a single spy object.
   var   spies   =   $ . isArray ( spy )   ?   spy   :   [ spy ] ;

   for ( var   i   in   spies )
   {
      spies [ i ] . refCallCount   =   spies [ i ] . refCallCount   ||   0 ;

      // jasmine.log(spies[i].identity +': ' +spies[i].refCallCount.toString() +' = ' +spies[i].callCount.toString());
      // The above line is commented out in the original, keeping it that way.
   }


   waitsFor ( function ( )
   {
      for ( var   i   in   spies )
      {
         // jasmine.log(spies[i].identity +': ' +spies[i].refCallCount.toString() +' <? ' +spies[i].callCount.toString());
         // This log statement also remains commented as per original.
         if ( spies [ i ] . refCallCount   <   spies [ i ] . callCount )
         {
            spies [ i ] . refCallCount   =   spies [ i ] . callCount ;
            return   true ; // A spy has been called.
         }
      }
      return   false ; // No spy has been called more than its reference count.
   } ,  msg ,  timeout ) ;

}



/*
 * Function to test setting and getting values via an API.
 * It iterates through a list of items and their associated values.
 */
function   testSetGetValue ( items ,  timeout )
{
   $ . each ( items ,  function ( idx ,  item )
   {
      $ . each ( item . values ,  function ( idx ,  value )
      {
         // Spies to capture success and error callbacks
         var   okHdlr   =   jasmine . createSpy ( 'for ok' ) ;
         var   errHdlr   =   jasmine . createSpy ( 'for errors' ) ;

         it ( item . label ,  function ( )
         {
            runs ( function ( )
            {
               jasmine . log ( 'set value to '   +   value ) ;
               // Call the API function to set the value
               api [ item . funcNameSet ] ( value ,  okHdlr ,  errHdlr ) ;
            } ) ; // End of first runs block

            // Wait for the spies to be called
            waitsForSpies ( [ okHdlr ,  errHdlr ] ,  item . funcNameSet   +   ' timeout' ,  timeout ) ;

            runs ( function ( )
            {
               expect ( errHdlr ) . not . toHaveBeenCalled ( ) ;
               if ( 0   <   errHdlr . callCount )
               {
                  jasmine . log ( 'errHdlr called with: '   +   errHdlr . mostRecentCall . args ) ;
               }
               expect ( okHdlr ) . toHaveBeenCalled ( ) ;
               if ( 0   <   okHdlr . callCount )
               {
                  jasmine . log ( 'result is '   +   okHdlr . mostRecentCall . args [ 0 ] ) ;
                  expect (
                     item . resultTest . apply ( this ,  [ okHdlr . mostRecentCall . args [ 0 ] ] )
                  ) . toBeTruthy ( ) ;
               }
            } ) ; // End of second runs block


            // If a getter function is provided, test reading the value back
            if ( item . funcNameGet )
            {
               runs ( function ( )
               {
                  jasmine . log ( 'read value' ) ;
                  api [ item . funcNameGet ] ( okHdlr ,  errHdlr ) ;
               } ) ; // End of third runs block

               waitsForSpies ( [ okHdlr ,  errHdlr ] ,  item . funcNameGet   +   ' timeout' ,  timeout ) ;

               runs ( function ( )
               {
                  expect ( errHdlr ) . not . toHaveBeenCalled ( ) ;
                  if ( 0   <   errHdlr . callCount )
                  {
                     jasmine . log ( 'errHdlr called with: '   +   errHdlr . mostRecentCall . args ) ;
                  }
                  expect ( okHdlr ) . toHaveBeenCalled ( ) ;
                  if ( 0   <   okHdlr . callCount )
                  {
                     jasmine . log ( 'result is '   +   okHdlr . mostRecentCall . args [ 0 ] ) ;
                     expect (
                        item . resultTest . apply ( this ,  [ okHdlr . mostRecentCall . args [ 0 ] ,  value ] )
                     ) . toBeTruthy ( ) ;
                  }
               } ) ; // End of fourth runs block
            } // End of funcNameGet check
         } ) ; // End of 'it' block

      } ) ; // End of inner $.each (values)
   } ) ; // End of outer $.each (items)
}


/**
 * @description Helper function to test if an API call returns an 'ok' status.
 * @param {Array} items - An array of test configurations.
 * @param {number} timeout - The maximum time to wait for asynchronous operations.
 */
function   testIsOk ( items ,  timeout )
{
   $ . each ( items ,  function ( idx ,  item )
   {
      var   okHdlr   =   jasmine . createSpy ( 'for ok' ) ;
      var   errHdlr   =   jasmine . createSpy ( 'for errors' ) ;

      it ( item . label ,  function ( )
      {
         runs ( function ( )
         {
            api [ item . funcName ] ( okHdlr ,  errHdlr ) ;
         } ) ;
         waitsForSpies ( [ okHdlr ,  errHdlr ] ,  item . funcName   +   ' timeout' ,  timeout ) ;
         runs ( function ( )
         {
            expect ( errHdlr ) . not . toHaveBeenCalled ( ) ;
            if ( 0   <   errHdlr . callCount )
            {
               jasmine . log ( 'errHdlr called with: '   +   errHdlr . mostRecentCall . args ) ;
            }
            expect ( okHdlr ) . toHaveBeenCalled ( ) ;
            if ( 0   <   okHdlr . callCount )
            {
               jasmine . log ( 'result is '   +   okHdlr . mostRecentCall . args [ 0 ] ) ;
               expect (
                  resultIsOk ( okHdlr . mostRecentCall . args [ 0 ] )
               ) . toBeTruthy ( ) ;
            }
         } ) ;
      } ) ;
   } ) ;
}


// Checks if the result is a number string and optionally matches a value.
function   resultIsNumber ( result ,  value )
{
   return   (
      "string"   ==   typeof   result
         &&   result . match ( / [0-9]+ / )
         &&   ( 'undefined'   ==   typeof   value   ||   parseInt ( result )   ==   value )
      ) ;
}


/*
 * Checks if the result string is exactly "ok".
 * @param {string} result - The string result to check.
 * @param {*} [value] - An optional value, not used in this function but for consistency.
 */
function   resultIsOk ( result ,  value )
{
   return   "ok"   ==   result ;
}


// Jasmine's beforeEach hook for setting up the test environment.
beforeEach ( function ( )
{

   this . addMatchers ( {
      toBeSet :   function ( descr )
      {
         // Custom matcher to check if a value is defined, not null, and not NaN.
         return   ( undefined   !=   this . actual   &&   null   !=   this . actual
            &&   this . actual   ==   this . actual   /* (NaN == NaN) is always false, so this checks for NaN */ ) ;
      }
   } ) ;

   userlogin   =   "testUserToFailAuth" ;
   userpass   =   "userpass" ;
   wrongpass   =   "wrongpass" ;

   api   =   window . Rho . syncengine ;

   /*
    * The following lines were commented out in the original code.
    * They are kept commented out to maintain logical equivalence.
    */
//    notified = false;
//    notify = function(evt, obj){
//        jasmine.log(evt.type + ': ' + $.toJSON(obj));
//        notified = true;
//    };


} ) ;