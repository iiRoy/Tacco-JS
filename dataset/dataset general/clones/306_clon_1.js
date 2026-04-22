/*!
 *
 *  VerbalExpressions JavaScript Library v0.1.2
 *
 *  A library to help construct regular expressions.
 *
 *  Project Repository: https://github.com/VerbalExpressions/JSVerbalExpressions
 *
 *
 *  Released under the MIT license, which can be found at:
 *  http://opensource.org/licenses/MIT
 *
 *  Date: 2013-07-19
 *
 */


//  Define the core collection class within an immediately invoked function expression (IIFE).
( function () {


    //  Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;


    //  I am the primary constructor function for VerbalExpression objects.
    function VerbalExpression ()
    {

        //  Create a new regular expression instance.
        var verbalExpression = new RegExp();


        //  Inject all prototype methods into the new RegExp object.
        VerbalExpression.injectClassMethods( verbalExpression );


        //  Return the newly constructed object, which is now a VerbalExpression instance.
        return verbalExpression;

    }


    //  Define static methods for the VerbalExpression class.
    VerbalExpression.injectClassMethods = function ( verbalExpression )
    {

        //  Iterate over all methods defined on the VerbalExpression prototype.
        for ( var method in VerbalExpression.prototype )
        {

            //  Ensure that the method is a direct property of the prototype, not inherited.
            if ( VerbalExpression.prototype.hasOwnProperty( method ) )
            {

                //  Assign the prototype method to the verbalExpression instance.
                verbalExpression[ method ] = VerbalExpression.prototype[ method ];

            }

        }


        //  Return the modified verbalExpression object.
        return verbalExpression;

    };


    //  Define the class methods by extending the VerbalExpression prototype.
    VerbalExpression.prototype = {


        //  Internal variables to manage the construction of the regular expression string.
        _prefixes : "",
        _source : "",
        _suffixes : "",

        //  Default modifiers: 'g' for global matching, 'm' for multiline matching.
        _modifiers : "gm",


        //  Sanitation function: Prepares a value to be safely included in a regular expression.
        sanitize : function ( value )
        {
            //  If the value is already a RegExp object, return its source.
            if ( value.source )
            {
                return value.source;
            }

            //  Numbers can be used directly.
            if ( typeof value === "number" )
            {
                return value;
            }

            //  Escape special regex characters in the string value.
            return value.replace( /[^\w]/g, function ( character )
            {
                return "\\" + character;
            } );
        },


        //  Core function to append to the expression source and recompile the regex.
        add : function ( value )
        {
            this._source += value || "";

            //  Compile the complete regular expression using current prefixes, source, suffixes, and modifiers.
            this.compile( this._prefixes + this._source + this._suffixes, this._modifiers );

            return this;
        },


        //  Appends a start-of-line anchor (^) to the expression.
        startOfLine : function ( enable )
        {
            //  Default to true if 'enable' is not explicitly false.
            enable = ( enable !== false );

            this._prefixes = enable ? "^" : "";

            //  Recompile the expression to apply the change.
            this.add( "" );

            return this;
        },


        //  Appends an end-of-line anchor ($) to the expression.
        endOfLine : function ( enable )
        {
            //  Default to true if 'enable' is not explicitly false.
            enable = ( enable !== false );

            this._suffixes = enable ? "$" : "";

            //  Recompile the expression to apply the change.
            this.add( "" );

            return this;
        },


        //  Adds a non-capturing group for the given value. Designed for sequential matching.
        then : function ( value )
        {
            //  Sanitize the input value to escape special regex characters.
            value = this.sanitize( value );

            this.add( "(?:" + value + ")" );

            return this;
        },


        //  An alias for `then()`, intended for starting a chain of expressions.
        find : function ( value )
        {
            return this.then( value );
        },


        //  Adds a non-capturing group for the given value, making it optional (0 or 1 occurrence).
        maybe : function ( value )
        {
            //  Sanitize the input value.
            value = this.sanitize( value );

            this.add( "(?:" + value + ")?" );

            return this;
        },


        //  Matches any character zero or more times.
        anything : function ()
        {
            this.add( "(?:.*)" );

            return this;
        },


        //  Matches any character zero or more times, *except* for the specified characters.
        anythingBut : function ( value )
        {
            //  Sanitize the input value.
            value = this.sanitize( value );

            this.add( "(?:[^" + value + "]*)" );

            return this;
        },


        //  Matches any character one or more times.
        something : function ()
        {
            this.add( "(?:.+)" );

            return this;
        },


        //  Matches any character one or more times, *except* for the specified characters.
        somethingBut : function ( value )
        {
            //  Sanitize the input value.
            value = this.sanitize( value );

            this.add( "(?:[^" + value + "]+)" );

            return this;
        },


        //  Provides a convenience method for `String.prototype.replace` using the constructed regex.
        replace : function ( source, value )
        {
            //  Ensure the source is a string.
            source = source.toString();

            //  Perform the replacement using the VerbalExpression instance as the regex.
            return source.replace( this, value );
        },


        //  -------------------------------------------------------------------
        //  Methods for adding common special regular expression characters.
        //  -------------------------------------------------------------------


        //  Matches a line break (CRLF, CR, or LF).
        lineBreak : function ()
        {
            this.add( "(?:\\r\\n|\\r|\\n)" ); //  Matches Unix, Windows, and old Mac line endings.

            return this;
        },


        //  An alias for `lineBreak()`, common in HTML contexts.
        br : function ()
        {
            return this.lineBreak();
        },


        //  Matches a tab character.
        tab : function ()
        {
            this.add( "\\t" );

            return this;
        },


        //  Matches one or more alphanumeric characters (word characters).
        word : function ()
        {
            this.add( "\\w+" );

            return this;
        },


        //  Matches any single character from the provided set.
        anyOf : function ( value )
        {
            //  Sanitize the input value.
            value = this.sanitize( value );

            this.add( "[" + value + "]" );

            return this;
        },


        //  An alias for `anyOf()`.
        any : function ( value )
        {
            return this.anyOf( value );
        },


        //  Matches a character within a specified range(s).
        //  Usage: .range( from, to [, from, to ... ] )
        range : function ()
        {
            var value = "[";

            //  Iterate through arguments in pairs (from, to).
            for ( var _to = 1; _to < arguments.length; _to += 2 )
            {
                var from = this.sanitize( arguments[ _to - 1 ] );
                var to = this.sanitize( arguments[ _to ] );

                value += from + "-" + to;
            }

            value += "]";

            this.add( value );

            return this;
        },


        //  -------------------------------------------------------------------
        //  Methods for modifying regular expression behavior (e.g., case-insensitivity).
        //  -------------------------------------------------------------------


        //  Adds a modifier flag to the regular expression.
        addModifier : function ( modifier )
        {
            //  Only add if the modifier is not already present.
            if ( this._modifiers.indexOf( modifier ) === -1 )
            {
                this._modifiers += modifier;
            }

            //  Recompile to apply the new modifier.
            this.add( "" );

            return this;
        },


        //  Removes a modifier flag from the regular expression.
        removeModifier : function ( modifier )
        {
            this._modifiers = this._modifiers.replace( modifier, "" );

            //  Recompile to apply the modifier change.
            this.add( "" );

            return this;
        },


        //  Controls case-insensitivity (the 'i' flag).
        withAnyCase : function ( enable )
        {
            if ( enable !== false )
            {
                this.addModifier( "i" );
            }
            else
            {
                this.removeModifier( "i" );
            }

            //  Recompile to reflect the change.
            this.add( "" );

            return this;

        },


        //  Controls global matching (the 'g' flag).
        //  By default, VerbalExpressions uses 'g', so this method reverses that.
        stopAtFirst : function ( enable )
        {
            if ( enable !== false )
            {
                this.removeModifier( "g" );
            }
            else
            {
                this.addModifier( "g" );
            }

            //  Recompile to reflect the change.
            this.add( "" );

            return this;

        },


        //  Controls multiline matching (the 'm' flag).
        //  By default, VerbalExpressions uses 'm', so this method reverses that.
        searchOneLine : function ( enable )
        {
            if ( enable !== false )
            {
                this.removeModifier( "m" );
            }
            else
            {
                this.addModifier( "m" );
            }

            //  Recompile to reflect the change.
            this.add( "" );

            return this;

        },


        //  Repeats the previous item exactly N times, or between N and M times.
        repeatPrevious : function ()
        {
            var value;

            //  Case: repeat exactly N times.
            if ( arguments.length <= 1 )
            {
                //  Check if the argument is a number.
                if ( /\d+/.exec( arguments[ 0 ] ) !== null )
                {
                    value = "{" + arguments[ 0 ] + "}";
                }
            }
            //  Case: repeat between N and M times.
            else
            {
                var values = [];

                //  Collect all numerical arguments.
                for ( var i = 0; i < arguments.length; i++ )
                {
                    if ( /\d+/.exec( arguments[ i ] ) !== null )
                    {
                        values.push( arguments[ i ] );
                    }
                }

                value = "{" + values.join( "," ) + "}";
            }

            this.add( value || "" );

            return ( this );
        },


        //  -------------------------------------------------------------------
        //  Methods for defining repetition and alternatives.
        //  -------------------------------------------------------------------


        //  Matches the given value zero or more times.
        //  Optionally, can specify exact count or range.
        multiple : function ( value )
        {
            //  Determine if value is a VerbalExpression instance or a string.
            value = value.source ? value.source : this.sanitize( value );

            //  If only one argument, match zero or more times.
            if ( arguments.length === 1 )
            {
                this.add( "(?:" + value + ")*" );
            }
            //  If more than one argument, specify a fixed repetition count.
            if ( arguments.length > 1 )
            {
                this.add( "(?:" + value + ")" );
                this.add( "{" + arguments[ 1 ] + "}" );
            }

            return this;
        },


        //  Adds an alternative expression using the OR operator.
        or : function ( value )
        {
            //  Wrap the current expression in a non-capturing group.
            this._prefixes += "(?:";
            this._suffixes = ")" + this._suffixes;

            //  Add the OR separator.
            this.add( ")|(?:" );

            //  If a value is provided, add it as the alternative.
            if ( value )
            {
                this.then( value );
            }

            return this;
        },


        //  Starts a capturing group.
        beginCapture : function ()
        {
            //  Temporarily add the closing parenthesis to suffixes to maintain compilation.
            this._suffixes += ")";

            //  Add the opening parenthesis for the capturing group.
            this.add( "(", false ); //  The 'false' argument here indicates not to recompile immediately (internal optimization).

            return this;
        },


        //  Ends the most recently opened capturing group.
        endCapture : function ()
        {
            //  Remove the temporary closing parenthesis from suffixes.
            this._suffixes = this._suffixes.substring( 0, this._suffixes.length - 1 );

            //  Add the closing parenthesis to the actual regex source.
            this.add( ")", true ); //  The 'true' argument indicates to recompile immediately.

            return this;
        },


        //  Converts the VerbalExpression instance into a native RegExp object.
        toRegExp : function ()
        {
            //  Extract the source and flags from the string representation.
            var arr = this.toString().match( /\/(.*)\/([a-z]+)?/ );

            //  Create and return a new RegExp object.
            return new RegExp( arr[ 1 ], arr[ 2 ] );
        }

    };


    //  Factory function to create new VerbalExpression instances.
    function createVerbalExpression ()
    {
        return new VerbalExpression();
    }


    //  Support various module loading environments.
    //  For Node.js / CommonJS.
    if ( typeof module !== 'undefined' && module.exports )
    {
        module.exports = createVerbalExpression;
    }
    //  For AMD (Asynchronous Module Definition) loaders like RequireJS.
    else if ( typeof define === 'function' && define.amd )
    {
        define( function () { return VerbalExpression; } );
    }
    //  For browser environments, expose on the global object.
    else
    {
        root.VerEx = createVerbalExpression;
    }


} ).call(); //  Execute the IIFE, binding 'this' to the global object.