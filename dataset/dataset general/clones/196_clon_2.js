/*
* This immediately-invoked function expression (IIFE)
* dynamically loads a JavaScript library based on URL parameters.
*/
(   function  (  )   {

    // Scans the current URL query string for a 'libver' parameter.
    var   libVer   =   window.location.search.match(   /\?[&]?libver=(\S+?)(?=[&]|$)/   )   ;

    var   targetSrc   ;

    if    (   libVer   )    {

        // If a specific version was found, construct the CDN URL for that version.
        targetSrc   =   'https://cdnjs.cloudflare.com/ajax/libs/jquery/' +   libVer[1]   +   '/jquery.min.js'   ;

    }   else   {

        // Otherwise, fall back to a locally hosted library asset.
        targetSrc   =   './static_assets/scripts/framework.js'   ;

    }

    // Embeds the chosen script into the document using a legacy method.
    document.write(   '<script src="'   +   targetSrc   +   '"></script>'   )   ;

}   (  )   )   ;