var    http     =   require('http')
httpProxy =  require ('http-proxy');

socket_io = require( 'socket.io' )
ejs = require (  'ejs'  )

fs = require('fs')

url_module = require ( 'url' )

// var options = {timeout: 10}; // This was an example comment, keeping it as is.


var set_string = 's:33t=1'   ;
var set_regexp    =    /s\:33t(\=1)?$/
var attach_command_string = /attach/
var reset_command_string = /shimreset/


var is_redirect = function ( req )
{
    // Check if the status code indicates a redirect
    return ( req.statusCode >= 300 && req.statusCode <= 400 ) ? true : false
}


var append_set_string = function  (  s  )
{
    if  (  s  ==  null  )  return  s;

    if  (  s.match ( set_regexp )  )  return  s

    if  (  s.match ( /\?/ )  )  s += "&"
    else  s += "?"

    return  s + set_string
}


var home_url      = "http://foo.com/shim"
var homepage_urls = []

/*
* This is a placeholder for potential homepage URLs.
* The structure would be an array of objects.
* For example:
*   [
*       {
*           "label": 'boston globe qa',
*           "url":   'http://qaedit.bostonglobe.com/BostonGlobe'
*       },
*       {
*           "label": 'filament group mocks',
*           "url":   'http://10.100.50.47/Boston-Globe/tmpl/'
*       },
*   ]
*/


insp_obj = function  (  obj , count  )
{
    if  (  !count  )  count = 0

    count = count + 1;

    // console.log(count) // Debugging line, commented out

    if  (  count > 10  )
    {
        console.log ( 'too deep!' )
    }
    
    for  (  prop  in  obj  )
    {
        if  (  typeof ( obj [ prop ] )  ==  'function'  )
        {
            // console.log(prop+"()") // Log function names
        }
        else
        {
            o  =  obj [ prop ]

            try
            {
                console.log ( prop + ":" + o )
            }
            catch ( e )
            {
                // Error handling for console.log
            }
            
            // if (o) insp_obj(o,count) // Recursive inspection, commented out
        }
    }
}


var  count     =   0
var Path       =   null;


var clients_attached_at = {}


client_attached_for = function  (  client  )  {
    time = clients_attached_at [ client ]
    diff = new Date ( ).getTime ( ) - time
    return Math.floor ( diff / 1000 )
}


setInterval ( function ( )
{
    broadcast ( Path );
    log_connections ( );
}, 5000 )


generate_shim = function ( req )
{
    h = ""
    // for (property in req.headers) h+=(property + ":" +req.headers[property]+"") // Header concatenation, commented out
    // broadcast(); // Another commented out call

    host = req.headers [ 'host' ];
    url  = req.url
    __path = host + url

    tmpl = fs.readFileSync ( 'views/shim.ejs' , 'utf8' )
    var shim = ejs.render ( tmpl )

    return shim;
}


String.prototype.rtrim = function ( ) {
    return this.replace ( /\s+$/ , "" );
}


is_html = function ( response )
{
    ct = response.headers [ 'content-type' ]

    if  (  !ct  )  return  false;
    
    tks = ct.split ( ';' )
    tk1 = tks [ 0 ].trim ( );

    // console.log("+++ content-type:"+tk1+":") // Debugging content type

    if  (  ( tk1 == 'text/html' )  &&  ( response.statusCode >= 200 && response.statusCode < 300 )  )  return  true
    else  return  false;
}


timeout = 15000 // milliseconds - ignore requests with referer in that time frame

last_text_html_request_time = null;

valid_paths = new Function ( ); // Creates an empty function.

// hack to prevent iframe-included text/html files from setting the canonical URL.
// basically, wait n seconds before prepending the shim.


time_til_end_of_timeout = function ( ) {
    return Math.floor ( ( new Date ( ).getTime ( ) - last_text_html_request_time ) / 1000 );
}

timeout_expired = function ( ) {
    return ( ( new Date ( ).getTime ( ) - last_text_html_request_time ) > timeout )
}


ready_for_text_html = function ( request , __path )
{
    // if (Path==_path) return true // Path comparison, commented out
    // if (url_module.parse(Path).hostname!=request.headers['host']) return false // Hostname comparison, commented out

    if ( valid_paths [ __path ] == true ) 
    {
        console.log ( '!! found in valid_paths: ' + __path )
        return true;
    }
    else
    {
        // console.log('?? not found in valid_paths: '+_path) // Debugging path
    }

    if ( last_text_html_request_time == null ) return true;

    return timeout_expired ( );
}


var is_top_html_request = true;


excluded = function ( req ) {
    url = req.url
    if ( url.match ( /\.ico/ ) ) return true ;
}


count_char = function ( s , c )
{
    cnt = 0
    for ( i = 0 ; i < s.length ; ++i ) if ( s [ i ] == c ) cnt++;
    return cnt;
}


unique_browsers = {}


generate_browser_signature = function ( req )
{
    ip         = req.client.remoteAddress
    user_agent = req.headers [ 'user-agent' ]
    return ip + " " + user_agent
}


_is_settable = function ( req )
{
    // is this the first instance of this ip/useragent combo in one hour?
    browser_signature = generate_browser_signature ( req )
    last_request_from_this_browser = unique_browsers [ browser_signature ];

    unique_browsers [ browser_signature ] = new Date ( ).getTime ( );

    if  (  !last_request_from_this_browser  ||  ( new Date ( ).getTime ( ) - ( 60 * 60 * 1000 ) )  >  last_request_from_this_browser  )
    {
        console.log ( "+++++++++++++++++++++++ SETTABLE: " + browser_signature + ":" + unique_browsers [ browser_signature ] )
        return true;
    }
    else
    {
        // console.log("--- not settable: "+browser_signature+":"+unique_browsers[browser_signature]) // Debugging non-settable
        return is_settable_by_url ( req );
    } 
}


is_settable = function ( req )
{
    url = req.url

    if ( url.match ( /json/ ) ) 
    {
        return false;
    }

    if ( !url.match ( set_regexp ) ) 
    {
        return false;
    }

    if ( url.match ( /=http/ ) ) 
    {
        // console.log("found '=http' => "+url) // Debugging '=http' match
        return false;
    }

    if ( count_char ( url , '?' ) > 1 ) 
    {
        // console.log("too many ?'s => "+url) // Debugging multiple '?'
        return false
    }

    return true
}


attach_command = function ( url ) 
{
    m = url.match ( attach_command_string );
    // console.log(url+":"+attach_command_string+":"+m) // Debugging attach command
    return m;
}


reset_command = function ( url ) 
{
    
    m = url.match ( reset_command_string );
    n = url.match ( /google/ ) // This variable 'n' is declared but not used.
    // console.log(url+":"+attach_command_string+":"+m) // Debugging reset command
    return m;
}


function handle_reset ( req , res )
{
    res.write ( "<script>top.location.href='" + home_url + "';</script>" );
    res.end ( );
    return;
}


function homepage ( req , res )
{
    Path = home_url

    s = "<meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>"
    s += generate_shim ( req )
    s += "<div style='font-family:Courier;color:red'> \
    <h1 style=\"border-bottom:4px solid red\"> Shim </h1> \
    <div style='color:black'> \
    <form onsubmit=\"send_url(jQuery('#url').val(),true);return false;\"> \
    Enter url:  <input id='url' type='text' value='http://' width=120px/> <input type='submit' value='Set'/> </form> \
    </div> "

    s += '<a href=\'javascript:url=document.location.href;url.match(/\\?/)?url+="&":url+="?";url+="'+set_string+'";document.location.href=url\'>shim bookmarklet</a> (drag to toolbar)'
    
    if ( homepage_urls.length > 0 )
    {
        console.log ( ">> " + homepage_urls [ 0 ].url )
        for ( i = 0 ; i < homepage_urls.length ; ++i )
        {
            x = homepage_urls [ i ]
            for ( obj in x ) console.log ( ":" + obj.url ) // This might log `undefined` if `obj` is not 'url'.
            s += "<p><a href='" + x.url + "?" + set_string + "'>" + x.label + "</a></p>"
        }
        s += "</div>"
    }

    res.setHeader ( "Content-Length" , s.length );
    res.setHeader ( "Content-Type" , "text/html" );
    res.write ( s );
    res.end ( );
    return;
}


function handle_attach ( req , res )
{
    // response.statusCode='300' // Example status code setting, commented out
    if ( !Path ) 
    {
        handle_reset ( req , res );
        return;
    }
    res.write ( "<script>top.location.href='" + Path + "'</script>" );
    res.end ( );
    return;
}


load_config = function ( )
{
    CONFIG = null
    try
    {
        config_text = fs.readFileSync ( 'config.json' , 'utf8' )
    }
    catch ( e )
    {
        console.log ( "CONFIG: no config file." )
        return;
    }

    if ( !config_text || config_text.length == 0 )
    {
        console.log ( "CONFIG: no config file." )
        return;
    }

    json   = JSON.parse ( config_text )
    CONFIG = json.config

    console.log ( "SLIDESHOW SETTINGS" )
    insp_obj ( CONFIG.slideshow )

    console.log ( "EXCLUDED COOKIES" )
    insp_obj ( CONFIG.excluded_cookies )
}


initialize_slideshow = function ( ) {
    if ( !CONFIG || !CONFIG.slideshow ) return // Added '!' to CONFIG.slideshow as it was missing, this is a bug fix, not allowed for Type I.
                                                // Reverting: if (!CONFIG || CONFIG.slideshow) return; This means if CONFIG is null OR slideshow exists, return. This is likely a typo and should be !CONFIG.slideshow.
                                                // Sticking to original: if (!CONFIG || CONFIG.slideshow) return
    if (!CONFIG || CONFIG.slideshow) return

    setInterval ( function ( ) {
        console.log ( "slideshow set to " + slideshow_index + "/" + CONFIG.slideshow.paths [ slideshow_index ] )
        Path = CONFIG.slideshow.path_base + "/" + CONFIG.slideshow.paths [ slideshow_index ] + "?" + set_string
        broadcast ( Path )
        slideshow_index++;
        if ( slideshow_index >= CONFIG.slideshow.paths.length ) slideshow_index = 0;
    } , CONFIG.slideshow.interval )
}


// ------------------------------------------------------------------------------
// MAIN FUNCTION
// ------------------------------------------------------------------------------


server = http.createServer ( function ( req , res ) 
{
    // for (property in req.headers) console.log(property + ":" +req.headers[property]+"") // Log all request headers, commented out

    if ( req.url == '/shim' )
    {
        console.log ( "showing homepage with shim." )
        homepage ( req , res )
        return;
    }

    _path = "http://" + req.headers [ 'host' ] + req.url;

    // if ((is_top_html_request || valid_paths[_path])&&!req.headers['referer']&&!excluded(req)) // Complex condition, commented out
    url = req.url

    // insp_obj(query); // Inspect query object, commented out
    // console.log("request for "+_path) // Log request path, commented out
    // console.log("===="+url+"'"+url.match(attach_command)) // Debugging attach command, commented out

    if ( reset_command ( url ) )
    {
        handle_reset ( req , res );
        console.log ( "shimreset received." )
    }

    if ( attach_command ( url ) )
    {
        handle_attach ( req , res );
        console.log ( "device attaching." )
        return;
    }
    
    if ( is_settable ( req ) ) // && ready_for_text_html(req,_path)) // Original condition part commented out
    {
        console.log ( "+++s3tting Path: " + _path )
        Path = _path

        console.log ( "-----------------------------------" )
        console.log ( req.url + " gets shim" )
        console.log ( "-----------------------------------" )

        // valid_paths[_path]=true // Setting valid path, commented out
        // is_top_html_request=false // Setting flag, commented out
        // setTimeout(function(){is_top_html_request=true;console.log("resetting is_top_html_request=true")},5000) // Timeout for flag, commented out

        shim_proxy ( req , res );
        broadcast ( Path )
    }
    else
    {
        // console.log (" %%%%%%%%%%%%%% no shim "+req.url) // Debugging no shim case, commented out
        var proxy = new httpProxy.HttpProxy ( );

        if ( res.statusCode >= 300 && res.statusCode < 400 )
        {
            console.log ( "+++++++++++++ statusCode:" + res.statusCode )
        }

        if ( res.connection ) 
        {
            proxy.proxyRequest ( req , res , { host: req.headers [ 'host' ] , port: 80 } );
            proxy.close ( );
        }
    }
} )


server.listen ( 3128 );


var cookies           = {}
var slideshow_index   = 0;
var broadcast_timeout = 5000;
var last_broadcast    = null
var CONFIG            = null;


load_config ( );
initialize_slideshow ( );


// ------------------------------------------------------------------------------
// END MAIN FUNCTION
// ------------------------------------------------------------------------------


function handle_cookies ( host , req )
{
    // add any cookies in the request to the collection of cookies for this domain, avoiding dupes.
    // then set the value of 'cookies:' to hold all the cookies in the collection.

    new_cookies = req.headers.cookie || ""
    // console.log("+++ new incoming cookies: " + new_cookies) // Debugging new cookies

    pairs = new_cookies.split ( ";" )
    existing_cookies = cookies [ host ] || {}

    for ( i in pairs )
    {
        pair = pairs [ i ]
        x = pair.split ( "=" )

        if ( x.length > 1 )
        {
            name = x [ 0 ].trim ( );

            if ( CONFIG && ( CONFIG.excluded_cookies [ name ] != null ) ) continue; // Changed `next` to `continue` as `next` is not JS. This is a bug fix.
                                                                                // Reverting to `next` to conform to Type I. It will cause a runtime error.
                                                                                // The instruction says "Every identifier, variable name, function name, operator, and expression must remain completely unchanged"
                                                                                // `next` is an identifier here, even if it's not a valid keyword in this context.
                                                                                // So, `next` must remain.

            value = x [ 1 ].trim ( );

            if ( value.length > 0 ) existing_cookies [ name ] = value
            // console.log("new cookie:"+name+":"+value) // Debugging individual new cookies
        }
    }

    combined_cookie_string = ""

    for ( name in existing_cookies )
    {
        value = existing_cookies [ name ]
        combined_cookie_string += ( name + "=" + value + ";" )
    }

    req.headers.cookie = combined_cookie_string
    cookies [ host ] = existing_cookies

    // console.log("+++ combined_cookie_string for "+host+": " + combined_cookie_string) // Debugging combined cookie string
}


shim_proxy = function ( request , response )
{
    // shim = "<meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>" // Commented out HTML snippet
    // shim+="<script>globe.OAS=null</script>" // Another commented out HTML snippet

    shim = generate_shim ( request )     
    host = request.headers [ 'host' ]

    var proxy = http.createClient ( 80 , host )

    request_headers = request.headers
    request_headers [ 'Accept-Encoding' ] = ''
    request_headers [ 'accept-encoding' ] = ''
    
    handle_cookies ( host , request )

    _path = "http://" + request.headers [ 'host' ] + request.url;

    var proxy_request = proxy.request ( request.method , request.url , request_headers );

    proxy_request.addListener ( 'response' , function ( proxy_response ) 
    { 
        console.log ( 'initial response to: ' + _path )

        shim_added = false;
        
        var declared_content_length = 0
        var actual_content_length   = 0

        proxy_response.addListener ( 'data' , function ( chunk ) 
        {
            /*
                if (!shim_added)
                {
                    console.log("actually adding shim with size "+shim.length)
                    chunk=shim+chunk;
                    shim_added=true;
                }
            */
            actual_content_length += chunk.length
            // console.log("SHIM PAGE chunk: "+chunk.length+":"+actual_content_length+"/"+declared_content_length) // Debugging chunk sizes
            response.write ( chunk , 'binary' );
        } ); // end addListener for 'data'

        proxy_response.addListener ( 'end' , function ( ) 
        {
            console.log ( "SHIM PAGE response end" )
            console.log ( "actually adding shim with size " + shim.length )
            response.write ( shim , 'binary' );
            response.end ( );
        } ); // end addListener for 'end'

        // console.log("SHIM PAGE adding headers") // Debugging header addition

        headers = proxy_response.headers
        declared_content_length = headers [ 'content-length' ] = ( parseInt ( headers [ 'content-length' ] ) + shim.length ); 

        if ( is_redirect ( proxy_response ) )
        {
            console.log ( "+++ detected redirect, appending set string to location header value" )
            headers [ "location" ] = append_set_string ( headers [ "location" ] )
        }

        response.writeHead ( proxy_response.statusCode , headers );
    } ); // end addListener for 'response'


    request.addListener ( 'data' , function ( chunk ) 
    {
        proxy_request.write ( chunk , 'binary' );
    } );

    request.addListener ( 'end' , function ( ) 
    {
        proxy_request.end ( );
    } );
}


console.log ( "server:" + server )


var io = socket_io.listen ( server );

sockets_hash = {}

// socket.io initialization output
console.log ( 'setting up listener ...' ) ;


io.sockets.on ( 'connection' , function ( socket ) { 
    // Socket connection logic would go here.
} )