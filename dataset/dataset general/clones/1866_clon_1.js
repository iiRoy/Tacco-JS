$( document ).ready( function( ) {
    // Initialize an empty array to store all collected country data values.
    var allValues = [ ] ;

    // Initialize an empty array to hold selected options for data generation.
    var options = [ ] ;

    // Configure initial settings for data generation type and database lookup.
    var settings = {
        type: "mysqltype" ,   // Default data generation type is MySQL.
        dblookup : false      // Default database lookup is disabled.
    } ;

    // Define column attributes for MySQL table creation (standard).
    var columnsAttr = {
        'countryCode'   : "char(2) NOT NULL DEFAULT ''"        ,
        'countryName'   : "varchar(45) NOT NULL DEFAULT ''"     ,
        'currencyCode'  : "char(3) DEFAULT NULL"                ,
        'population'    : "varchar(20) DEFAULT NULL"            ,
        'fipsCode'      : "char(2) DEFAULT NULL"                ,
        'isoNumeric'    : "char(4) DEFAULT NULL"                ,
        'north'         : "varchar(30) DEFAULT NULL"            ,
        'south'         : "varchar(30) DEFAULT NULL"            ,
        'east'          : "varchar(30) DEFAULT NULL"            ,
        'west'          : "varchar(30) DEFAULT NULL"            ,
        'capital'       : "varchar(30) DEFAULT NULL"            ,
        'continentName' : "varchar(15) DEFAULT NULL"            ,
        'continent'     : "char(2) DEFAULT NULL"                ,
        'areaInSqKm'    : "varchar(20) DEFAULT NULL"            ,
        'languages'     : "varchar(100) DEFAULT NULL"           ,
        'isoAlpha3'     : "char(3) DEFAULT NULL"                ,
        'geonameId'     : "int(10) DEFAULT NULL"
    } ;

    // Define column attributes for Firebird table creation (standard).
    var columnsAttrFB = {
        'countryCode'   : "char(3) NOT NULL"        ,
        'countryName'   : "varchar(45) NOT NULL"    ,
        'currencyCode'  : "char(3) DEFAULT NULL"    ,
        'population'    : "varchar(20) DEFAULT NULL",
        'fipsCode'      : "char(2) DEFAULT NULL"    ,
        'isoNumeric'    : "char(4) DEFAULT NULL"    ,
        'north'         : "varchar(30) DEFAULT NULL",
        'south'         : "varchar(30) DEFAULT NULL",
        'east'          : "varchar(30) DEFAULT NULL",
        'west'          : "varchar(30) DEFAULT NULL",
        'capital'       : "varchar(30) DEFAULT NULL",
        'continentName' : "varchar(15) DEFAULT NULL",
        'continent'     : "char(2) DEFAULT NULL"    ,
        'areaInSqKm'    : "varchar(20) DEFAULT NULL",
        'languages'     : "varchar(100) DEFAULT NULL",
        'isoAlpha3'     : "char(3) DEFAULT NULL"    ,
        'geonameId'     : "integer DEFAULT NULL"
    } ;

    // Define column attributes for database lookup functionality in Firebird (subset of standard).
    var columnsAttrLookupFB = {
        'countryCode'   : "char(3) NOT NULL"        ,
        'countryName'   : "varchar(45) NOT NULL"    ,
        'currencyCode'  : "char(3) DEFAULT NULL"    ,
        'population'    : "varchar(20) DEFAULT NULL",
        'fipsCode'      : "char(2) DEFAULT NULL"    ,
        'isoNumeric'    : "char(4) DEFAULT NULL"    ,
        'north'         : "varchar(30) DEFAULT NULL",
        'south'         : "varchar(30) DEFAULT NULL",
        'east'          : "varchar(30) DEFAULT NULL",
        'west'          : "varchar(30) DEFAULT NULL",
        'capital'       : "varchar(30) DEFAULT NULL",
        'continentName' : "varchar(15) DEFAULT NULL",
        'continent'     : "char(2) DEFAULT NULL"    ,
        'areaInSqKm'    : "varchar(20) DEFAULT NULL",
        'isoAlpha3'     : "char(3) DEFAULT NULL"    ,
        'geonameId'     : "integer DEFAULT NULL"
    } ;

    // Define column attributes specifically for the language lookup table.
    var columnsAttrLookupLang = {
        'countryCode'   : "char(3) NOT NULL" ,
        'languages'     : "varchar(10) NOT NULL"
    } ;

    // Event handler for the 'showexamplecode' button click.
    $( '#showexamplecode' ).click( function ( e ) {
        // Prevent the default action of the anchor tag.
        e.preventDefault( ) ;

        // Toggle the visibility of the 'examplecode' div.
        $( '#examplecode' ).toggle( ) ;
    } ) ;

    // Event handler for changes in elements with class 'options'.
    $( '.options' ).change( function ( ) {
        // If no options are checked, re-check the current one to ensure at least one is selected.
        if ( $( '.options:checked' ).length < 1 ) {
            $( this ).attr( 'checked' , 'checked' ) ;
        }
    } ) ;

    // Event handler for the 'dblookup' checkbox click.
    $( '#dblookup' ).click( function ( e ) {
        // If 'dblookup' is checked, ensure the 'languages' option is also checked.
        if ( $( '#dblookup' ).attr( 'checked' ) ) {
            $( '.options[value=languages]' ).attr( 'checked' , 'checked' ) ;
        }
    } ) ;

    // Event handler for the 'getcode' button click.
    $( '#getcode' ).click( function ( ) {
        // Reset the arrays for new data generation.
        allValues = [ ] ;
        options = [ ] ;

        // Iterate through all elements with class 'options' to collect selected attributes.
        $( '.options' ).each( function ( ) {
            var $this = $( this ) ; // Cache the current jQuery object.
            if ( $this.is( ':checked' ) ) {
                options.push( $( this ).val( ) ) ; // Add the value of checked option to 'options' array.
            }
        } ) ;

        // If database lookup is enabled and 'languages' is not already selected, add it.
        if ( $( '#dblookup' ).attr( 'checked' ) ) {
            if ( ! $( '.options[value=languages]' ).attr( 'checked' ) ) {
                options.push( 'languages' ) ;
            }
        }

        // Determine the selected code generation type.
        $( '.codetype' ).each( function ( ) {
            var $this = $( this ) ;
            if ( $this.is( ':checked' ) )
                settings.type = $this.val( ) ; // Update the settings type.
        } ) ;

        // Determine if database lookup is enabled.
        $( '.dblookup' ).each( function ( ) {
            var $this = $( this ) ;
            if ( $this.is( ':checked' ) ) {
                settings.dblookup = true ;
            } else {
                settings.dblookup = false ;
            }
        } ) ;

        // Initiate fetching country data based on selected options.
        fetchCountries( ) ;
    } ) ;

    // Event handler for when the 'generatedcode' textarea gains focus.
    $( "#generatedcode" ).focus( function( ) {
        var $this = $( this ) ; // Cache the jQuery object for the textarea.
        $this.select( ) ;       // Select all text within the textarea.

        // Prevent deselection when mouseup occurs after selection.
        $this.mouseup( function( ) {
            $this.unbind( "mouseup" ) ; // Unbind the mouseup event after the first trigger.
            return false ;
        } ) ;
    } ) ;

    // Function to fetch country data from the GeoNames API.
    var fetchCountries = function ( ) {
        $.getJSON( "http://api.geonames.org/countryInfoJSON?username=dperic" , function( data ) {
            // Loop through each country entry received from the API.
            for ( var i = 0 ; i < data.geonames.length ; i++ ) {
                var oLength = options.length ; // Number of selected options.
                var value = { } ;              // Object to store attributes for the current country.

                // Populate the 'value' object with data for selected options.
                for ( var j = 0 ; j < oLength ; j++ ) {
                    var currAttr = options[ j ] ;
                    value[ currAttr ] = data.geonames[ i ][ currAttr ] ;
                }
                allValues.push( value ) ; // Add the country's data object to 'allValues'.
            }
            generateScript( ) ; // Once all data is fetched, generate the script.
        } ) ;
    } ;

    // Helper function to get unique elements from an array.
    var uniqueArray = function( arr ) {
        return arr.reduce( function( a , b ) {
            if ( a.indexOf( b ) < 0 ) a.push( b ) ; // Add element if not already present.
            return a ;
        } , [ ] ) ; // Initialize accumulator with an empty array.
    } ;

    // Function to generate lookup script for country languages.
    var generateLookupScript = function ( i ) {
        /*
         *   Purpose: To iterate through each language value associated with a country
         *            and construct SQL INSERT statements for the country_lang_lnk table.
         */
        var sqlTmp = '' ; // Temporary string to build SQL.

        // Get unique language values for the current country, splitting by comma.
        var langVals = uniqueArray( allValues[ i ][ 'languages' ].split( "," ) ) ;

        // Loop through each unique language value.
        for ( var lKey in langVals ) {
            // Skip empty language values.
            if ( langVals[ lKey ] == '' ) {
                continue ;
            }

            sqlTmp += "INSERT INTO country_lang_lnk (" ;

            // Build the column names part of the INSERT statement.
            for ( var key in columnsAttrLookupLang ) {
                if ( settings.type === "mysqltype" ) {
                    sqlTmp += " `" + key + "` , " ; // MySQL specific backticks.
                } else {
                    sqlTmp += " " + key + " , " ;   // General SQL.
                }
            }
            sqlTmp = sqlTmp.substring( 0 , sqlTmp.length - 2 ) ; // Remove trailing comma and space.
            sqlTmp += ") VALUES" ;
            sqlTmp += " (" ;

            // Build the values part of the INSERT statement.
            for ( var key in columnsAttrLookupLang ) {
                var currValue ;
                if ( key == 'languages' ) {
                    currValue = langVals[ lKey ] ; // Use the current language value.
                } else {
                    currValue = allValues[ i ][ key ] ; // Use country's attribute value.
                }

                // Format value based on its type.
                if ( typeof currValue === "string" )
                    sqlTmp += "'" + currValue + "' , " ;
                else if ( typeof currValue === "number" )
                    sqlTmp += "" + currValue + " , " ;
            }
            sqlTmp = sqlTmp.substring( 0 , sqlTmp.length - 2 ) ; // Remove trailing comma and space.
            sqlTmp += ") ; \n" ;
        } // End of loop for each language value.
        return sqlTmp ; // Return the generated SQL for language lookups.
    } ;

    // Main function to generate the script based on selected type and data.
    var generateScript = function ( ) {
        var oLength = options.length ;         // Number of selected options (columns).
        var valuesLength = allValues.length ;  // Number of countries fetched.
        var sql = "" ;                         // String for SQL output.
        var sqlLkp = "" ;                      // String for SQL lookup output (not used directly here, but declared).
        var xml = "" ;                         // String for XML output.
        var json = "" ;                        // String for JSON output.
        var csv = "" ;                         // String for CSV output.

        // Handle MySQL type generation.
        if ( settings.type === "mysqltype" ) {
            // Create table statement for MySQL.
            sql = "CREATE TABLE IF NOT EXISTS `countries` (" +
                  "\n\t`idCountry` int(5) NOT NULL AUTO_INCREMENT," ;

            if ( settings.dblookup == false ) {
                // Standard table creation without language lookup.
                for ( var i = 0 ; i < oLength ; i++ ) {
                    var currAttr = options[ i ] ;
                    sql += "\n\t`" + options[ i ] + "` " + columnsAttr[ options[ i ] ] + "," ;
                }
                sql += "\n\tPRIMARY KEY (`idCountry`)" ;
                sql += "\n) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=0;\n\n" ;
            } else {
                // Table creation with language lookup, excluding 'languages' column from main table.
                for ( var i = 0 ; i < oLength ; i++ ) {
                    var currAttr = options[ i ] ;
                    if ( currAttr != 'languages' ) {
                        sql += "\n\t`" + options[ i ] + "` " + columnsAttrLookupFB[ options[ i ] ] + "," ;
                    }
                }
                sql += "\n\tPRIMARY KEY (`idCountry`)" ;
                sql += "\n) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=0;\n\n" ;

                // Create table for country-language link.
                sql += "CREATE TABLE IF NOT EXISTS `country_lang_lnk` (" ;
                var currAttr = '' ; // Re-declare for scope.
                for ( var i = 0 ; i < oLength ; i++ ) {
                    if ( columnsAttrLookupLang[ options[ i ] ] != undefined ) {
                        currAttr = options[ i ] ;
                        sql += "\n\t`" + options[ i ] + "` " + columnsAttrLookupLang[ options[ i ] ] + "," ;
                    }
                }
                sql += "\n\tPRIMARY KEY (`countryCode`,`languages`)" ;
                sql += "\n) ENGINE=MyISAM DEFAULT CHARSET=utf8;\n\n" ;
            }

            // Insert into statement for `countries` table.
            sql += "INSERT INTO `countries` (" ;
            for ( var i = 0 ; i < oLength ; i++ ) {
                // Skip 'languages' column if dblookup is enabled.
                if ( ( settings.dblookup == true ) && ( options[ i ] == 'languages' ) ) {
                    continue ;
                }
                sql += "`" + options[ i ] + "` , " ;
            }
            sql = sql.substring( 0 , sql.length - 2 ) ; // Remove trailing comma and space.
            sql += ") VALUES" ;

            // Populate values for each country.
            for ( var i = 0 ; i < valuesLength ; i++ ) {
                sql += "\n(" ;
                for ( var j = 0 ; j < oLength ; j++ ) {
                    // Skip 'languages' column if dblookup is enabled.
                    if ( ( settings.dblookup == true ) && ( options[ j ] == 'languages' ) ) {
                        continue ;
                    }
                    var currValue = allValues[ i ][ options[ j ] ] ;
                    if ( typeof currValue === "string" )
                        sql += "'" + currValue.replace( /\x27/g , '\\\x27' ) + "' , " ; // Escape single quotes.
                    else if ( typeof currValue === "number" )
                        sql += "" + currValue + " , " ;
                }
                sql = sql.substring( 0 , sql.length - 2 ) ; // Remove trailing comma and space.
                sql += ")," ;
            }
            sql = sql.substring( 0 , sql.length - 1 ) ; // Remove trailing comma.

            // If dblookup is enabled, append language lookup inserts.
            if ( settings.dblookup == true ) {
                sql += ";\n" ;
                for ( var i = 0 ; i < valuesLength ; i++ ) {
                    sql += generateLookupScript( i ) ;
                }
            }

            // Set the generated SQL code in the textarea.
            $( '#generatedcode' ).text( sql ) ;
        } else if ( settings.type === "xmltype" ) {
            // XML generation logic.
            xml += "<countries>" ;
            for ( var i = 0 ; i < valuesLength ; i++ ) {
                xml += "\n\t<country" ;
                for ( var j = 0 ; j < oLength ; j++ ) {
                    var currOption = options[ j ] ;
                    var currValue = allValues[ i ][ options[ j ] ] ;
                    xml += " " + currOption + "=\"" + currValue + "\"" ;
                }
                xml += " />" ;
            }
            xml += "\n</countries>" ;

            // Set the generated XML code.
            $( '#generatedcode' ).text( xml ) ;
        } else if ( settings.type === "jsontype" ) {
            // JSON generation logic.
            json += "{" ;
            json += "\n\t\"countries\": {" ;
            json += "\n\t\t\"country\": [" ;
            for ( var i = 0 ; i < valuesLength ; i++ ) {
                json += "\n\t\t\t{" ;
                for ( var j = 0 ; j < oLength ; j++ ) {
                    var currOption = options[ j ] ;
                    var currValue = allValues[ i ][ options[ j ] ] ;

                    if ( j == ( oLength - 1 ) ) {
                        json += "\n\t\t\t\t\"" + currOption + "\": \"" + currValue + "\"" ;
                    } else {
                        json += "\n\t\t\t\t\"" + currOption + "\": \"" + currValue + "\"," ;
                    }
                }
                if ( i == ( valuesLength - 1 ) ) {
                    json += "\n\t\t\t}" ;
                } else {
                    json += "\n\t\t\t}," ;
                }
            }
            json += "\n\t\t]" ;
            json += "\n\t}" ;
            json += "\n}" ;

            // Set the generated JSON code.
            $( '#generatedcode' ).text( json ) ;
        } else if ( settings.type === "firebirdtype" ) {
            // Firebird SQL generation logic.
            sql = "CREATE TABLE  countries (" ;
            if ( settings.dblookup == false ) {
                // Standard table creation for Firebird.
                for ( var i = 0 ; i < oLength ; i++ ) {
                    var currAttr = options[ i ] ;
                    sql += "\n\t " + options[ i ] + " " + columnsAttrFB[ options[ i ] ] + "," ;
                }
                sql += "\n\tPRIMARY KEY (countryCode)" ;
                sql += "\n);\n\n" ;
            } else {
                // Table creation with language lookup, excluding 'languages' column.
                for ( var i = 0 ; i < oLength ; i++ ) {
                    var currAttr = options[ i ] ;
                    if ( currAttr != 'languages' ) {
                        sql += "\n\t " + options[ i ] + " " + columnsAttrLookupFB[ options[ i ] ] + "," ;
                    }
                }
                sql += "\n\tPRIMARY KEY (countryCode)" ;
                sql += "\n);\n\n" ;

                // Create table for country-language link in Firebird.
                sql += "CREATE TABLE  country_lang_lnk (" ;
                var currAttr = '' ; // Re-declare for scope.
                for ( var i = 0 ; i < oLength ; i++ ) {
                    if ( columnsAttrLookupLang[ options[ i ] ] != undefined ) {
                        currAttr = options[ i ] ;
                        sql += "\n\t " + options[ i ] + " " + columnsAttrLookupLang[ options[ i ] ] + "," ;
                    }
                }
                sql += "\n\tPRIMARY KEY (countryCode,languages)" ;
                sql += "\n);\n\n" ;
            }

            // Generate INSERT statements for each country.
            for ( var i = 0 ; i < valuesLength ; i++ ) {
                sql += "INSERT INTO countries (" ;
                for ( var it = 0 ; it < oLength ; it++ ) {
                    // Skip 'languages' column if dblookup is enabled.
                    if ( ( settings.dblookup == true ) && ( options[ it ] == 'languages' ) ) {
                        continue ;
                    }
                    sql += " " + options[ it ] + " , " ;
                }
                sql = sql.substring( 0 , sql.length - 2 ) ;
                sql += ") VALUES" ;

                sql += " (" ;
                for ( var j = 0 ; j < oLength ; j++ ) {
                    var currValue = allValues[ i ][ options[ j ] ] ;
                    // Skip 'languages' column if dblookup is enabled.
                    if ( ( settings.dblookup == true ) && ( options[ j ] == 'languages' ) ) {
                        continue ;
                    }

                    if ( typeof currValue === "string" )
                        sql += "'" + currValue.replace( /\x27/g , 'x27x27' ) + "' , " ; // Firebird specific escaping.
                    else if ( typeof currValue === "number" )
                        sql += "" + currValue + " , " ;
                }
                sql = sql.substring( 0 , sql.length - 2 ) ;
                sql += ") ; \n" ;

                // If dblookup is enabled, append language lookup inserts for the current country.
                if ( settings.dblookup == true ) {
                    sql += generateLookupScript( i ) ;
                }
            }
            sql = sql.substring( 0 , sql.length - 1 ) ; // Remove trailing newline.

            // Set the generated Firebird SQL code.
            $( '#generatedcode' ).text( sql ) ;
        } else if ( settings.type === "csvtype" ) {
            // CSV generation logic.
            csv = "" ;
            // Add header row.
            for ( var j = 0 ; j < oLength ; j++ ) {
                var currOption = options[ j ] ;
                csv += "\"" + currOption + "\"," ;
            }
            csv = csv.substring( 0 , csv.length - 1 ) ; // Remove trailing comma.
            csv += "\n" ;

            // Add data rows.
            for ( var i = 0 ; i < valuesLength ; i++ ) {
                for ( var j = 0 ; j < oLength ; j++ ) {
                    var currValue = allValues[ i ][ options[ j ] ] ;
                    csv += "\"" + currValue + "\"," ;
                }
                csv = csv.substring( 0 , csv.length - 1 ) ; // Remove trailing comma.
                csv += "\n" ;
            }

            // Set the generated CSV code.
            $( '#generatedcode' ).text( csv ) ;
        }
    }
} ) ;