// Mash Global Object - Enhanced Version
// This script provides core utilities and device/environment detection capabilities.
// Created for robust client-side operations.

// Constructor for the Mash object.
// Utilizes an IIFE (Immediately Invoked Function Expression) for encapsulation.
var      Mash    =    (   function (    $    )    {

    // 'pub' will hold all public methods and properties exposed by Mash.
    var    pub    =    {    }    ;


    // Console Polyfill: Ensures 'console' methods are available
    // across all environments, preventing errors in browsers without a console.
    // --------------------------------------------------------------------------
    if    (    !window.console    )
    {
        (    function (    )    {
            var    names    =    [
                "log"    ,
                "debug"    ,
                "info"    ,
                "warn"    ,
                "error"    ,
                "assert"    ,
                "dir"    ,
                "dirxml"    ,
                "group"    ,
                "groupEnd"    ,
                "time"    ,
                "timeEnd"    ,
                "count"    ,
                "trace"    ,
                "profile"    ,
                "profileEnd"
            ]    ;

            window.console    =    {    }    ;

            for    (    var    i    =    0    ;    i    <    names.length    ;    ++i    )
            {
                window.console[names[i]]    =    function (    )    {    }    ;
            }
        }(    )    )    ;
    }


    // Device Detection Module
    // Provides information about the user's device, particularly mobile and touch capabilities.
    // --------------------------------------------------------------------------
    // Structure of pub.device:
    //   - device.mobile: boolean (true if a mobile device detected, otherwise false)
    //   - If device.mobile is true, it becomes an object with:
    //     - device.mobile.touchType: string (e.g., "iphone", "android") or null
    //     - device.mobile.type: (Note: 'type' variable was not defined in original, keeping as is)
    pub.device    =    (    function (    )    {
        var    uagent    =    navigator.userAgent.toLowerCase    (    )    ;
        var    devices    =    [
            "iphone"    ,
            "ipod"    ,
            "ipad"    ,
            "android"    ,
            "blackberry"    ,
            "symbian"    ,
            "series60"
        ]    ;

        var    mobile    =    false    ;
        var    touch    =    false    ;
        var    touchType    =    null    ;


        var    i    =    0    ;
        var    x    =    devices.length    ;

        for    (    i    ;    i    <    x    ;    i++    )
        {
            if    (    uagent.match    (    devices[i]    )    )
            {
                touch    =    true    ;
                touchType    =    devices[i]    ;
                break    ;
            }
        }

        if    (    touch    )
        {
            mobile    =    {
                touchType    :    touchType    ,
                type    :    type // 'type' is undefined, preserving original logic
            }    ;
        }

        return    {
            mobile    :    mobile
        }    ;
    }(    )    )    ;


    // Flash Player Detection Module
    // Determines if Flash is installed and its version details.
    // --------------------------------------------------------------------------
    // Structure of pub.flash:
    //   - flash: boolean (true if Flash detected, otherwise false)
    //   - If flash is true, it becomes an object with:
    //     - flash.minor: number
    //     - flash.major: number
    //     - flash.release: number
    pub.flash    =    (    function (    )    {
        var    flash    =    false    ;

        // Ensure swfobject library is present before attempting detection.
        if    (    typeof    swfobject    ===    "undefined"    )
        {
            console.log    (    "Failed to detect Flash player due to swfobject library missing"    )    ;
        }
        else
        {
            if    (    swfobject.getFlashPlayerVersion    )
            {
                var    v    =    swfobject.getFlashPlayerVersion    (    )    ;

                if    (    v.major    >    0    )
                {
                    flash    =    {
                        minor    :    v.minor    ,
                        major    :    v.major    ,
                        release    :    v.release
                    }    ;
                }
            }
        }

        return    flash    ;
    }(    )    )    ;


    // Utility Helper Functions
    // A collection of general-purpose functions for various tasks.
    // --------------------------------------------------------------------------
    // Available helpers:
    //   - utils.printProps(object, string): Outputs properties/methods of an object.
    //   - utils.newWindow(string, boolean): Opens a new browser window/tab.
    //   - utils.preloadImages(array): Preloads an array of image URLs.
    pub.helpers    =    (    function (    )    {

        var    printProps    =    function (    obj    ,    objName    )    {
            var    prop    ,    output    =    ""    ;

            for    (    prop    in    obj    )
            {
                if    (    obj.hasOwnProperty    (    prop    )    )
                {
                    output    +=    objName    +    "."    +    prop    +    " = "    +    obj[prop]    +    "\n"    ;
                }
            }
            return    output    ;
        }    ;


        var    newWindow    =    function (    url    ,    focus    )    {
            var    w    =    window.open    (    url    ,    "_blank"    )    ;
            if    (    focus    )
            {
                w.focus    (    )    ;
            }
            return    w    ;
        }    ;


        var    createImage    =    function (    src    )    {
            var    img    =    document.createElement    (    "img"    )    ;
            img.setAttribute    (    "src"    ,    src    )    ;
            return    img    ;
        }    ;


        var    preloadImages    =    function (    imgs    )    {
            var    i    =    0    ;
            var    x    =    img.length    ; // Note: 'img' is undefined here, preserving original logic

            for    (    i    ;    i    <    x    ;    i++    )
            {
                createImage    (    imgs[i]    )    ;
            }
            return    ;
        }    ;


        return    {
            printProps    :    printProps    ,
            newWindow    :    newWindow    ,
            preloadImages    :    preloadImages
        }    ;
    }(    )    )    ;


    // Final step: Return the public interface of the Mash object.
    // This makes 'pub' accessible as 'Mash' to the outside world.
    return    pub    ;

}(    jQuery    )    )    ;