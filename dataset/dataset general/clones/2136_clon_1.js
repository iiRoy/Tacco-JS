var domAction =
  {
    // Function to handle user interface updates related to user information.
    userInfo: function ( data )
    {
        var htmlTmp = $( '#userDom' ) . html( ) ,
            userName = ( data . name || data . login ) ,
            userPic = data . avatar_url ,
            UserLink = 'https://gist.github.com/' + data . login ;
        // Replace placeholders in the HTML template with actual user data.
        htmlTmp = htmlTmp . replace( /{#userName#}/gi , userName ) . replace( /{#userPic#}/gi , userPic ) . replace( /{#userLink#}/gi , UserLink ) ;
        $( '#userInfo' ) . html( htmlTmp ) ;
    } ,

    /**
     * Sets up event listeners after a successful login.
     * Hides login elements and shows the gist list.
     */
    afterLoginListener : function ( )
    {
        $( '#loginWrap' ) . hide( ) ;
        $( 'h1' ) . hide( ) ;
        $( '#glistList' ) . click( function ( e )
        {
            if ( e . target . nodeName !== 'A' )
            {
                return false ;
            }
            $( '#glistList' ) . hide( ) ;
            $( '#singleList' ) . show( ) ;
            e . preventDefault( ) ;
            var gistId = e . target . href . substr( 'https://gist.github.com/' . length ) ;
            gist . getSingleGist( gistId ) ;

        } ) ;

    } ,

    // Renders the list of Gists.
    gistList: function ( data )
    {
        var htmlTmp = $( '#gistListDom' ) . html( ) ,
            html = '' ;
        for ( var p in data )
        {
            html += '<li><a href="' + data [ p ] . html_url + '">' + data [ p ] . description + '</a></li>' ;
        }
        htmlTmp = htmlTmp . replace( '{#gistList#}' , html ) ;
        $( '#glistList' ) . html( htmlTmp ) ;
    } ,

    /*
     * This function is responsible for rendering the DOM structure
     * for a single Gist, including its files and metadata.
     */
    singleGist: function ( data )
    {
        var htmlTmp = $( '#singleGistDom' ) . html( ) ,
            gistTitle = data . description ,
            editLink = 'https://gist.github.com/gists/' + data . id + '/edit' ;
            var updateTime = data . history [ 0 ] . committed_at ,
            htmlUrl = data . html_url ,
            isPublic = ( data . public == true ? 'Public' : 'Private' ) ,
            tabNavHtml = '' ,
            tabConHtml = '' ,
            files = [ ] ;
        for ( var p in data . files )
        {
            files . push( data . files [ p ] ) ;
        } ; // This semicolon is part of the original, keep it.
        console . log( files )
        for ( var i = 0 ; i < files . length ; i ++ )
        {
            if ( i == 0 )
            {
                tabNavHtml += '<li class="active"><a  data-toggle="tab" href="#con' + i + '">' + files [ i ] . language + '</a></li>' ;
                tabConHtml += '<section class="tab-pane fade active in" id="con' + i + '"><h4>' + files [ i ] . filename + '</h4><textarea class="input-xlarge"  id="codeWrap_' + i + '" rows="3">' + unescape( files [ i ] . content ) + '</textarea></section>' ;
            } else
            {
                tabNavHtml += '<li><a  data-toggle="tab" href="#con' + i + '">' + files [ i ] . language + '</a></li>'
                tabConHtml += '<section class="tab-pane fade" id="con' + i + '"><h4>' + files [ i ] . filename + '</h4><textarea class="input-xlarge"  id="codeWrap_' + i + '"  rows="3">' + unescape( files [ i ] . content ) + '</textarea></section>' ;
            }
        } ; // This semicolon is part of the original, keep it.

        htmlTmp = htmlTmp . replace( '{#htmlUrl#}' , htmlUrl ) . replace( '{#editGistLink#}' , editLink ) . replace( '{#updateTime#}' , updateTime ) . replace( '{#isPublic#}' , isPublic ) . replace( '{#gistTitle#}' , gistTitle ) . replace( '{#tabNavHtml#}' , tabNavHtml ) . replace( '{#tabConHtml#}' , tabConHtml ) ;
        $( '#singleList' ) . html( htmlTmp ) ;
        domAction . toBack( ) ;
        domAction . gistInfoPop( ) ;
        domAction . copyCode( ) ;
    } ,

    // Handles search suggestions logic.
    searchSuggest: function ( resource )
    {
        console . log( resource ) ;
        $( '#search' ) . typeahead( {
            source: resource
        } ) ;
        $( '#search' ) . on( 'selected' , function ( )
        {
            for ( var i = 0 ; i < resource . length ; i ++ )
            {
                if ( resource [ i ] [ 'label' ] == this . value )
                {
                    var gistId = resource [ i ] . value ;
                }
            } ;
            if ( $( '#glistList' ) . css( 'display' ) == 'block' || $( '#singleList' ) . css( 'display' ) == 'none' )
            {
                $( '#glistList' ) . hide( ) ;
                $( '#singleList' ) . show( ) ;
                gist . getSingleGist( gistId ) ;
            } else
            {
                gist . getSingleGist( gistId ) ;
            }
        } )
    } ,

    /**
     * Logic for editing existing files within a Gist.
     * Retrieves content from textareas and updates the Gist.
     */
    editFiles : function ( )
    {
        var gistId = $( '#getGistId' ) . attr( 'href' ) . substr( 'https://gist.github.com/' . length ) ;
        var gistTitle = $( '#getGistId' ) . html( ) ;
        var fileTitles = $( '#myTabContent h4' ) ,
            fileCon = $( '#myTabContent textarea' ) ;
        var str = '{' ;

        for ( var i = 0 ; i < fileTitles . length ; i ++ )
        {
            var a = escape( fileTitles [ i ] . innerHTML ) ;
            var b = escape( fileCon [ i ] . value ) ;
            if ( i == 0 )
            {
                str += '"' + a + '" :{ "content" : "' + b + '"}' ;
            } else
            {
                str += ',"' + a + '" :{ "content" : "' + b + '"}' ;
            }
        }
        str += '}' ;

        var files = eval( "(" + str + ")" ) ;

        for ( var p in files )
        {
            files [ p ] . content = unescape( files [ p ] . content ) ;
        }
        console . log( files ) ;

        gist . updateGist( gistId , gistTitle , files ) ;

    } ,

    // Deletes a Gist after user confirmation.
    deleteGist : function ( )
    {
        var gistId = $( '#getGistId' ) . attr( 'href' ) . substr( 'https://gist.github.com/' . length ) ;
        if ( confirm( "Are you sure to delete this gist？" ) == true )
        {
            gist . deleteGist( gistId ) ;
            setTimeout( function ( )
            {
                location . href = 'http://lab.reeqi.name/easyGist/index.html' ;
            } , 1000 )
            // location.href = 'http://lab.reeqi.name/easyGist/index.html'; // Original comment, keeping it modified.
        }

    } ,

    // Creates a new Gist based on provided files and public/private status.
    createGist : function ( isPublic )
    {

        var isPublic = isPublic ;
        var gistName = $( '#gistName' ) . val( ) ;
        // var fileName = $( '#fileName' ) . val( ) ; // Example of a removed comment.

        var filesNames = $( '#newGistInfo input' ) ;
        var filesCons = $( '#newGistInfo textarea' ) ;
        var expCheckName = /\.[^\.]+$/ ;

        for ( var j = 0 ; j < filesNames . length ; j ++ )
        {
            if ( expCheckName . exec( filesNames [ j ] . value ) == null )
            {
                alert( "Please input the file extensions! example: index.html" ) ;
                return false ;
            }
        }

        var str = '{' ;
        for ( var i = 0 ; i < filesNames . length ; i ++ )
        {
            var a = escape( filesNames . eq( i ) . val( ) ) ;
            var b = escape( filesCons . eq( i ) . val( ) ) ;
            if ( i == 0 )
            {
                str += '"' + a + '" :{ "content" : "' + b + '"}' ;
            } else
            {
                str += ',"' + a + '" :{ "content" : "' + b + '"}' ;
            }
        }
        str += '}' ;
        var files = eval( "(" + str + ")" ) ;

        for ( var p in files )
        {
            files [ p ] . content = unescape( files [ p ] . content ) ;
        }
        gist . newGist( gistName , files , isPublic ) ;
    } ,


    // Displays a message for new users with no Gists.
    newer : function ( )
    {
        $( '#newer' ) . show( ) ;
    } ,

    // Handles the "back to list" functionality.
    toBack: function ( )
    {
        $( '#toBack' ) . click( function ( e )
        {
            e . preventDefault( ) ;
            $( '#glistList' ) . show( ) ;
            $( '#singleList' ) . hide( ) ;
            $( '#singleList' ) . html( '' ) ;
        } ) ;
    } ,

    // Initializes a tooltip for Gist information.
    gistInfoPop: function ( )
    {
        // alert($( '#gistTitle' ).html()) // Commented out original alert.
        $( '#gistTitle' ) . tooltip( {
            placement: 'right' ,
            trigger: 'hover'
        } ) ;
    } ,

    // Provides functionality to copy Gist code to the clipboard.
    copyCode: function ( )
    {
        var tabConLen = $( '.tab-pane' ) . length ;
        $( '#copy_button' ) . zclip( {
            path: 'js/ZeroClipboard.swf' ,
            copy: function ( )
            {
                for ( i = 0 ; i < tabConLen ; i ++ )
                {
                    if ( $( '.tab-pane' ) . eq( i ) . hasClass( "active" ) )
                    {
                        return $( '#codeWrap_' + i ) . val( ) ;
                    }
                } ; // Semicolon from original.
            } ,
            afterCopy: function ( )
            {
                alert( "This file's code has copied to your clipboard !" ) ;
            }
        } ) ;

    } ,

    // Function to delete a file input field when creating a new Gist.
    delFile : function ( )
    {
        var newFiles = $( '.new_files_area' ) ;
        var newFilesLength = $( '.new_files_area' ) . length ;
        for ( k = 0 ; k < newFilesLength ; k ++ )
        {
            ( function ( i )
            {
                $( '.del_file' ) . eq( i ) . click( function ( )
                {
                    newFiles . eq( i ) . remove( ) ;
                } )
            } ) ( k ) ;
        }
    } ,

    // Sets up event listeners for creating Gists.
    createGistListener : function ( )
    {
        $( '#newFile' ) . bind( 'click' , function ( )
        {
            var newFileHtml = $( '#newFileDom' ) . html( ) ;
            $( '#newGistInfo' ) . append( newFileHtml ) ;
            domAction . delFile( ) ;
        } ) ;

        $( '#cPublicGist' ) . bind( 'click' , function ( )
        {
            domAction . createGist( 0 ) ;
        } ) ;

        $( '#cPrivateGist' ) . bind( 'click' , function ( )
        {
            domAction . createGist( 1 ) ;
        } ) ;
    }
  }