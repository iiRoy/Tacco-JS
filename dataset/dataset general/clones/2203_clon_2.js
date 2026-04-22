/* --
 * Text Editor Library
 * release: v2.0.0
 * build: Tue Jan 2 2024 10:00:00 GMT+0000 (Coordinated Universal Time)
 */
(function( ){

// editor_core.js section
EDIT_SETTINGS = window.EDIT_SETTINGS || { };

var pangu = window.pangu || { };

window.pangu = pangu;

window.EDT = pangu.editor = window.EDT || { };

EDT.modules = { };

EDT.actions = { };

EDT.instances = { };

EDT.LOCALIZATION = { };

EDT._customUI = { };

EDT.release = "2.0.0";

var markup = EDT.markup = { };

// client_environment.js
//+
//  Client environment detection module.
//  @file
//  @module EDT.clientEnv
//  @since 2.0.0
//+

/*+
 *  Provides functionality for identifying the client's browser.
 *  @unfile
 *  @module EDT.clientEnv
 */
var clientEnv = EDT.clientEnv = function( ){
    var userStr = navigator.userAgent.toLowerCase( ),
        opBrowser = window.opera,
        clientEnv = {
        /*+
         *  @property {boolean} interExpl Checks if the current client is Internet Explorer.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.interExpl ) {
         *      console.log( 'This client is Internet Explorer.' );
         *  }
         *  ```
         */
        interExpl	:  /(msie\s|trident.*rv:)([\w.]+)/.test(userStr),

        /*+
         *  @property {boolean} opBrowser Checks if the current client is Opera.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.opBrowser ) {
         *      console.log( 'This client is Opera.' );
         *  }
         *  ```
         */
        opBrowser	: ( !!opBrowser && opBrowser.version ),

        /*+
         *  @property {boolean} webKit Checks if the current client uses the WebKit engine.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.webKit ) {
         *      console.log( 'This client uses the WebKit engine.' );
         *  }
         *  ```
         */
        webKit	: ( userStr.indexOf( ' applewebkit/' ) > -1 ),

        /*+
         *  @property {boolean} macOS Checks if the current client is running on a Mac platform.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.macOS ) {
         *      console.log( 'This client is running on a Mac platform.' );
         *  }
         *  ```
         */
        macOS	: ( userStr.indexOf( 'macintosh' ) > -1 ),

        /*+
         *  @property {boolean} strangeMode Checks if the current client is in "quirks mode".
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.strangeMode ) {
         *      console.log( 'This client is operating in "quirks mode".' );
         *  }
         *  ```
         */
        strangeMode : ( document.compatMode == 'BackCompat' )
    };

    /*+
    *  @property {boolean} geckoEng Checks if the current client engine is Gecko.
    *  @example
    *  ```javascript
    *  if ( EDT.clientEnv.geckoEng ) {
    *      console.log( 'This client engine is Gecko.' );
    *  }
    *  ```
    */
    clientEnv.geckoEng = ( navigator.product == 'Gecko' && !clientEnv.webKit && !clientEnv.opBrowser && !clientEnv.interExpl);

    var vNum = 0;

    // Internet Explorer 6.0+
    if ( clientEnv.interExpl ){

        var matchA = userStr.match(/(?:msie\s([\w.]+))/);
        var matchB = userStr.match(/(?:trident.*rv:([\w.]+))/);
        if(matchA && matchB && matchA[1] && matchB[1]){
            vNum = Math.max(matchA[1]*1,matchB[1]*1);
        }else if(matchA && matchA[1]){
            vNum = matchA[1]*1;
        }else if(matchB && matchB[1]){
            vNum = matchB[1]*1;
        }else{
            vNum = 0;
        }

        clientEnv.interExpl11Comp = document.documentMode == 11;
        /*+
         *  @property { boolean } interExpl9Comp Checks if the browser mode is IE9 compatibility mode.
         *  @warning If the browser is not IE, this value will be undefined.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.interExpl9Comp ) {
         *      console.log( 'Current browser is running in IE9 compatibility mode.' );
         *  }
         *  ```
         */
        clientEnv.interExpl9Comp = document.documentMode == 9;

        /*+
         *  @property { boolean } interExpl8 Checks if the browser is IE8.
         *  @warning If the browser is not IE, this value will be undefined.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.interExpl8 ) {
         *      console.log( 'Current browser is IE8.' );
         *  }
         *  ```
         */
        clientEnv.interExpl8 = !!document.documentMode;

        /*+
         *  @property { boolean } interExpl8Comp Checks if the browser mode is IE8 compatibility mode.
         *  @warning If the browser is not IE, this value will be undefined.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.interExpl8Comp ) {
         *      console.log( 'Current browser is running in IE8 compatibility mode.' );
         *  }
         *  ```
         */
        clientEnv.interExpl8Comp = document.documentMode == 8;

        /*+
         *  @property { boolean } interExpl7Comp Checks if the browser mode is IE7 compatibility mode.
         *  @warning If the browser is not IE, this value will be undefined.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.interExpl7Comp ) {
         *      console.log( 'Current browser is running in IE7 compatibility mode.' );
         *  }
         *  ```
         */
        clientEnv.interExpl7Comp = ( ( vNum == 7 && !document.documentMode )
                || document.documentMode == 7 );

        /*+
         *  @property { boolean } interExpl6Comp Checks if the browser mode is IE6 or quirks mode.
         *  @warning If the browser is not IE, this value will be undefined.
         *  @example
         *  ```javascript
         *  if ( EDT.clientEnv.interExpl6Comp ) {
         *      console.log( 'Current browser is running in IE6 mode or quirks mode.' );
         *  }
         *  ```
         */
        clientEnv.interExpl6Comp = ( vNum < 7 || clientEnv.strangeMode );

        clientEnv.interExpl9Plus = vNum > 8;

        clientEnv.interExpl9Minus = vNum < 9;

        clientEnv.interExpl11Plus = vNum > 10;

        clientEnv.interExpl11Minus = vNum < 11;

    }

    // Gecko-based browsers.
    if ( clientEnv.geckoEng ){
        var geckoVerMatch = userStr.match( /rv:([\d\.]+)/ );
        if ( geckoVerMatch )
        {
            geckoVerMatch = geckoVerMatch[1].split( '.' );
            vNum = geckoVerMatch[0] * 10000 + ( geckoVerMatch[1] || 0 ) * 100 + ( geckoVerMatch[2] || 0 ) * 1;
        }
    }

    /*+
     *  @property { Number } chromEng Checks if the current client is Chrome; if so, returns the major version number.
     *  @warning If the browser is not Chrome, this value will be undefined.
     *  @example
     *  ```javascript
     *  if ( EDT.clientEnv.chromEng ) {
     *      console.log( 'Current client is Chrome.' );
     *  }
     *  ```
     */
    if (/chrome\/(\d+\.\d)/i.test(userStr)) {
        clientEnv.chromEng = + RegExp['\x241'];
    }

    /*+
     *  @property { Number } safariEng Checks if the current client is Safari; if so, returns the major version number.
     *  @warning If the browser is not Safari, this value will be undefined.
     *  @example
     *  ```javascript
     *  if ( EDT.clientEnv.safariEng ) {
     *      console.log( 'Current client is Safari.' );
     *  }
     *  ```
     */
    if(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(userStr) && !/chrome/i.test(userStr)){
    	clientEnv.safariEng = + (RegExp['\x241'] || RegExp['\x242']);
    }


    // Opera 9.50+
    if ( clientEnv.opBrowser )
        vNum = parseFloat( opBrowser.version() );

    // WebKit 522+ (Safari 3+)
    if ( clientEnv.webKit )
        vNum = parseFloat( userStr.match( / applewebkit\/(\d+)/ )[1] );

    /*+
     *  @property { Number } release Checks the current client version number.
     *  @remind
     *  <ul>
     *      <li>IE series returns values like 5, 6, 7, 8, 9, 10</li>
     *      <li>Gecko series returns values like 10900, 158900</li>
     *      <li>WebKit series returns its build number (e.g., 522)</li>
     *  </ul>
     *  @example
     *  ```javascript
     *  console.log( 'Current client version is: ' + EDT.clientEnv.release );
     *  ```
     */
    clientEnv.release = vNum;

    /*+
     *  @property { boolean } isGoodMatch Checks if the current client is well-compatible with EDT.
     *  @example
     *  ```javascript
     *  if ( EDT.clientEnv.isGoodMatch ) {
     *      console.log( 'Client is well-compatible with EDT.' );
     *  }
     *  ```
     */
    clientEnv.isGoodMatch =
        !clientEnv.mobile && (
        ( clientEnv.interExpl && vNum >= 6 ) ||
        ( clientEnv.geckoEng && vNum >= 10801 ) ||
        ( clientEnv.opBrowser && vNum >= 9.5 ) ||
        ( clientEnv.air && vNum >= 1 ) ||
        ( clientEnv.webKit && vNum >= 522 ) ||
        false );
    return clientEnv;
}( );
// quick references
var interExpl = clientEnv.interExpl,
    webKit = clientEnv.webKit,
    geckoEng = clientEnv.geckoEng,
    opBrowser = clientEnv.opBrowser;

// core_helpers.js
/*+
 *  Utility function package.
 *  @file
 *  @module EDT.helpers
 *  @since 2.0.0
 */

/*+
 *  Static utility functions used by the EDT framework.
 *  @module EDT.helpers
 *  @unfile
 */

var helpers = EDT.helpers = {

    /*+
     *  Iterates over an object with a given processor function.
     *  @method iterate
     *  @param { Object } collection The object to iterate over.
     *  @param { Function } processor The iterator function, which accepts two arguments:
     *                                 the current value and the current key.
     *  @example
     *  ```javascript
     *  var demoData = {
     *      id1: 10,
     *      id2: 20
     *  };
     *
     *  //output: id1: 10, id2: 20
     *  EDT.helpers.iterate( demoData, function ( value, key ) {
     *
     *      console.log( key + ": " + value );
     *
     *  } );
     *  ```
     */

    /*+
     *  Iterates over an array or array-like object with a given processor function.
     *  @method iterate
     *  @param { Array } collection The array or array-like object to iterate over.
     *  @param { Function } processor The iterator function, which accepts two arguments:
     *                                 the current value and the current index.
     *  @example
     *  ```javascript
     *  var elements = document.getElementsByTagName( "span" );
     *
     *  //output: 0: SPAN, 1: SPAN ...
     *  EDT.helpers.iterate( elements, function ( value, index ) {
     *
     *      console.log( index + ": " + value.tagName );
     *
     *  } );
     *  ```
     */
    iterate : function ( collection, processor, thisArg ) {
        if ( collection == null ) return;
        if ( collection.length === +collection.length ) {
            for ( var idx = 0, len = collection.length; idx < len; idx++ ) {
                if ( processor.call( thisArg, collection[idx], idx, collection ) === false )
                    return false;
            }
        } else {
            for ( var propName in collection ) {
                if ( collection.hasOwnProperty( propName ) ) {
                    if ( processor.call( thisArg, collection[propName], propName, collection ) === false )
                        return false;
                }
            }
        }
    },

    /*+
     *  Creates a new object using the given object as its prototype.
     *  @method createObjectFromPrototype
     *  @param { Object } protoObject The object that will serve as the prototype for the new object.
     *  @return { Object } The new object, whose prototype is the provided protoObject.
     *  @example
     *  ```javascript
     *
     *  var baseObject = { sayHi: function ( ) { console.log('Hi EDT!'); } };
     *
     *  var newObject = EDT.helpers.createObjectFromPrototype( baseObject );
     *  //output: Hi EDT!
     *  newObject.sayHi( );
     *  ```
     */
    createObjectFromPrototype : function ( obj ) {
        var emptyFunc = new Function( );
        emptyFunc.prototype = obj;
        obj = new emptyFunc;
        emptyFunc.prototype = null;
        return obj;
    },

    /*+
     *  Extends a target object with properties from a source object.
     *  @method assignProps
     *  @remind This method forcibly copies properties from the source object to the target object.
     *  @see EDT.helpers.assignProps(Object,Object,Boolean)
     *  @param { Object } targetObj The target object; new properties will be added to it.
     *  @param { Object } sourceObj The source object, whose properties will be appended to the target object.
     *  @return { Object } Returns the modified target object.
     *  @example
     *  ```javascript
     *
     *  var destination = { label: 'destination', status: true },
     *      origin = { label: 'origin', value: 100 };
     *
     *  EDT.helpers.assignProps( destination, origin );
     *
     *  //output: { label: 'origin', status: true, value: 100 }
     *  console.log( destination );
     *
     *  ```
     */

    /*+
     *  Extends a target object with properties from a source object, deciding whether to keep
     *  existing target properties with the same names based on the `keepTargetProps` value.
     *  @method assignProps
     *  @param { Object } targetObj The target object; new properties will be added to it.
     *  @param { Object } sourceObj The source object, whose properties will be appended to the target object.
     *  @param { Boolean } keepTargetProps Whether to preserve properties in the target object that
     *                                     have the same name as properties in the source object.
     *  @return { Object } Returns the modified target object.
     *  @example
     *  ```javascript
     *
     *  var destination = { label: 'destination', status: true },
     *      origin = { label: 'origin', value: 100 };
     *
     *  EDT.helpers.assignProps( destination, origin, true );
     *
     *  //output: { label: 'destination', status: true, value: 100 }
     *  console.log( destination );
     *
     *  ```
     */
    assignProps : function ( targetObj, sourceObj, keepTargetProps ) {
        if ( sourceObj ) {
            for ( var propKey in sourceObj ) {
                if ( !keepTargetProps || !targetObj.hasOwnProperty( propKey ) ) {
                    targetObj[propKey] = sourceObj[propKey];
                }
            }
        }
        return targetObj;
    },

    /*+
     *  Copies properties from multiple given objects onto a target object.
     *  @method mergeProps
     *  @remind This method forcibly copies properties from the source objects to the target object.
     *  @remind This method supports two or more arguments. Starting from the second argument,
     *          all properties will be copied to the first argument. If properties with the same
     *          name are encountered, the previous value will be overwritten.
     *  @param { Object } initialObject The target object; new properties will be added to it.
     *  @param { Object... } sourceObjects Source objects, supports multiple objects; their properties
     *                                     will be appended to the target object.
     *  @return { Object } Returns the modified target object.
     *  @example
     *  ```javascript
     *
     *  var finalObject = { },
     *      sourceOne = { name: 'originA', size: 10 },
     *      sourceTwo = { role: 'developer' };
     *
     *  EDT.helpers.mergeProps( finalObject, sourceOne, sourceTwo );
     *
     *  //output: { name: 'originA', size: 10, role: 'developer' }
     *  console.log( finalObject );
     *
     *  ```
     */
    mergeProps : function ( initialObject ) {
        var allArguments = arguments;
        for ( var argIndex = 1; argIndex < allArguments.length; argIndex++ ) {
            var currentSource = allArguments[argIndex];
            for ( var currentProp in currentSource ) {
                if ( !initialObject.hasOwnProperty( currentProp ) ) {
                    initialObject[currentProp] = currentSource[currentProp];
                }
            }
        }
        return initialObject;
    },

    /*+
     *  Simulates an inheritance mechanism, allowing a childClass to inherit from a parentClass.
     *  @method setupInheritance
     *  @param { Object } childClass The child class object.
     *  @param { Object } parentClass The parent class object.
     *  @warning This method only allows the childClass to inherit the parent's prototype;
     *           the childClass's own properties and methods will not be inherited.
     *  @return { Object } The child class object after inheriting from the parentClass.
     *  @example
     *  ```javascript
     *  function BaseClass(){
     *      this.entityName = "Alice";
     *  }
     *
     *  BaseClass.prototype = {
     *      greet:function(msg){
     *          console.log(this.entityName + " says " + msg);
     *      }
     *  }
     *
     *  function DerivedClass(){
     *      this.entityName = "Bob";
     *  }
     *
     *  EDT.helpers.setupInheritance(DerivedClass,BaseClass);
     *  ```
     */
    setupInheritance : function ( childClass, parentClass ) {
        // ... (implementation would go here)
    }
};

})( );