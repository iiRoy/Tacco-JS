function main ( )
{
  // This function initializes the main display logic for the Chrome extension popup.
  // It fetches technology data for the currently active tab and renders it.
  chrome . tabs . getSelected ( null ,  function( tab )
  {
    // Retrieve the technology data for the current tab ID from the background page.
    var data = chrome . extension . getBackgroundPage ( ) . technologyData [ tab . id ] ;

    // console.log(data); // Original comment, now slightly modified. This line was commented out in the source.

    if  (  data [ 'ip_info' ]  )
    {
      // If IP information is available, create a table row to display it.
      var tr = document . createElement ( 'tr' ) ;
      var td1 = document . createElement ( 'td' ) ;
      td1 . innerHTML = "<strong>" ;
      td1 . innerHTML += chrome . i18n . getMessage ( "ip" ) ;
      td1 . innerHTML += "</strong>" ;

      var td2 = document . createElement ( 'td' ) ;
      // td2.innerHTML = data['ip_info']['Ip']; // Original commented out line.
      td2 . innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"flags/" + data [ 'ip_info' ] [ 'CountryCode' ] . toLowerCase ( ) + ".gif\">" ;

      var td3 = document . createElement ( 'td' ) ;
      // td3.innerHTML = data['ip_info']['City'] + ", " + data['ip_info']['RegionName'] + ", " + data['ip_info']['CountryName']; // Original commented out line.
      td3 . innerHTML = data [ 'ip_info' ] [ 'Ip' ] + "/" + data [ 'ip_info' ] [ 'City' ] + ", " + data [ 'ip_info' ] [ 'RegionName' ] + ", " + data [ 'ip_info' ] [ 'CountryName' ] ;

      // Append the table data cells to the table row.
      tr . appendChild ( td1 ) ;
      tr . appendChild ( td2 ) ;
      tr . appendChild ( td3 ) ;

      // Finally, append the completed row to the "detail" element in the DOM.
      document . getElementById ( "detail" ) . appendChild ( tr ) ;
    } // End of IP info block.


    if ( data [ 'technology' ] )
    {
      // Handle web technology data.
      var tr = document . createElement ( 'tr' ) ;
      var td1 = document . createElement ( 'td' ) ;
      td1 . innerHTML = "<strong>" ;
      td1 . innerHTML += chrome . i18n . getMessage ( "webTechnology" ) ;
      td1 . innerHTML += "</strong>" ;

      var td2 = document . createElement ( 'td' ) ;
      if ( data [ 'technology' ] . url )
      {
        // td2.innerHTML = "<a href=\"" + data['technology_url'] + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data['technology_icon'] + "\" />&nbsp;&nbsp;" + data['technology'] + "</a>"; // Original commented out line.
        td2 . innerHTML = "<a href=\"" + data [ 'technology' ] . url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'technology' ] . icon + "\" title=\"" + data [ 'technology' ] . title + "\"></a>" ;
      }
      else
      {
        td2 . innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'technology' ] . icon + "\" title=\"" + data [ 'technology' ] . title + "\">" ;
      }

      var td3 = document . createElement ( 'td' ) ;
      if ( data [ 'technology' ] . result )
      {
        td3 . innerHTML = data [ 'technology' ] . result [ 0 ] ;
      }
      else
      {
        td3 . innerHTML = data [ 'technology' ] . title ;
      }

      tr . appendChild ( td1 ) ;
      tr . appendChild ( td2 ) ;
      tr . appendChild ( td3 ) ;
      document . getElementById ( "detail" ) . appendChild ( tr ) ;
    } // End of technology block.


    if ( data [ 'server' ] )
    {
      // Process web server information.
      var tr = document . createElement ( 'tr' ) ;
      var td1 = document . createElement ( 'td' ) ;
      td1 . innerHTML = "<strong>" ;
      td1 . innerHTML += chrome . i18n . getMessage ( "webserver" ) ;
      td1 . innerHTML += "</strong>" ;

      var td2 = document . createElement ( 'td' ) ;
      if ( data [ 'webserver' ] . url )
      {
        // td2.innerHTML = "<a href=\"" + data['webserver_url'] + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data['webserver_icon'] + "\" />&nbsp;&nbsp;" + data['webserver'] + "</a>"; // Original commented out line.
        td2 . innerHTML = "<a href=\"" + data [ 'webserver' ] . url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'webserver' ] . icon + "\" title=\"" + data [ 'webserver' ] . title + "\"></a>" ;
      }
      else
      {
        td2 . innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'webserver' ] . icon + "\" title=\"" + data [ 'webserver' ] . title + "\">" ;
      }

      var td3 = document . createElement ( 'td' ) ;
      if ( data [ 'webserver' ] . result )
      {
        td3 . innerHTML = data [ 'webserver' ] . result [ 0 ] ;
      }
      else
      {
        td3 . innerHTML = data [ 'webserver' ] . title ;
      }

      tr . appendChild ( td1 ) ;
      tr . appendChild ( td2 ) ;
      tr . appendChild ( td3 ) ;
      document . getElementById ( "detail" ) . appendChild ( tr ) ;
    } // End of web server block.


    if ( data [ 'os' ] )
    {
      // Display operating system data.
      var tr = document . createElement ( 'tr' ) ;
      var td1 = document . createElement ( 'td' ) ;
      td1 . innerHTML = "<strong>" ;
      td1 . innerHTML += chrome . i18n . getMessage ( "os" ) ;
      td1 . innerHTML += "</strong>" ;

      var td2 = document . createElement ( 'td' ) ;
      if ( data [ 'os' ] . url )
      {
        // td2.innerHTML = "<a href=\"" + data['os_url'] + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data['os_icon'] + "\" />&nbsp;&nbsp;" + data['os'] + "</a>"; // Original commented out line.
        td2 . innerHTML = "<a href=\"" + data [ 'os' ] . url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'os' ] . icon + "\" title=\"" + data [ 'os' ] . title + "\"></a>" ;
      }
      else
      {
        td2 . innerHTML = "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'os' ] . icon + "\" title=\"" + data [ 'os' ] . title + "\">" ;
      }

      var td3 = document . createElement ( 'td' ) ;
      if ( data [ 'os' ] . result )
      {
        td3 . innerHTML = data [ 'os' ] . result [ 0 ] ;
      }
      else
      {
        td3 . innerHTML = data [ 'os' ] . title ;
      }

      tr . appendChild ( td1 ) ;
      tr . appendChild ( td2 ) ;
      tr . appendChild ( td3 ) ;
      document . getElementById ( "detail" ) . appendChild ( tr ) ;
    } // End of OS block.


    if ( data [ 'front_libraries' ] . length != 0 )
    {
      // Render front-end library information if available.
      var tr = document . createElement ( 'tr' ) ;
      var td1 = document . createElement ( 'td' ) ;
      td1 . innerHTML = "<strong>" ;
      td1 . innerHTML += chrome . i18n . getMessage ( "frontLibraries" ) ;
      td1 . innerHTML += "</strong>" ;

      var td2 = document . createElement ( 'td' ) ;
      td2 . setAttribute ( "colspan" , "2" ) ;
      for ( var i in data [ 'front_libraries' ] )
      {
        if ( data [ 'front_libraries' ] [ i ] . url )
        {
          // td2.innerHTML += "<a href=\"" + data['front_libraries'][i].url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data['front_libraries'][i].icon + "\" />&nbsp;&nbsp;" + data['front_libraries'][i].title + "</a>"; // Original commented out line.
          td2 . innerHTML += "<a href=\"" + data [ 'front_libraries' ] [ i ] . url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'front_libraries' ] [ i ] . icon + "\" title=\"" + data [ 'front_libraries' ] [ i ] . title + "\" />&nbsp;" + data [ 'front_libraries' ] [ i ] . title + "</a>&nbsp;&nbsp;" ;
        }
        else
        {
          td2 . innerHTML += "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'front_libraries' ] [ i ] . icon + "\" />&nbsp;" + data [ 'front_libraries' ] [ i ] . title + "&nbsp;&nbsp;" ;
        }
      }

      tr . appendChild ( td1 ) ;
      tr . appendChild ( td2 ) ;
      document . getElementById ( "detail" ) . appendChild ( tr ) ;
    } // End of front-end libraries block.


    if ( data [ 'web_apps' ] . length != 0 )
    {
      // Display detected web applications.
      var tr = document . createElement ( 'tr' ) ;
      var td1 = document . createElement ( 'td' ) ;
      td1 . innerHTML = "<strong>" ;
      td1 . innerHTML += chrome . i18n . getMessage ( "webApps" ) ;
      td1 . innerHTML += "</strong>" ;

      var td2 = document . createElement ( 'td' ) ;
      td2 . setAttribute ( "colspan" , "2" ) ;
      for ( var i in data [ 'web_apps' ] )
      {
        if ( data [ 'web_apps' ] [ i ] . url )
        {
          // td2.innerHTML += "<a href=\"" + data['web_apps'][i].url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data['web_apps'][i].icon + "\" />&nbsp;&nbsp;" + data['web_apps'][i].title + "</a>"; // Original commented out line.
          td2 . innerHTML += "<a href=\"" + data [ 'web_apps' ] [ i ] . url + "\" target=\"_blank\"><img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'web_apps' ] [ i ] . icon + "\" title=\"" + data [ 'web_apps' ] [ i ] . title + "\" />&nbsp;" + data [ 'web_apps' ] [ i ] . title + "</a>&nbsp;&nbsp;" ;
        }
        else
        {
          td2 . innerHTML += "<img class=\"img\" width=\"19px\" hight=\"19px\" src=\"icons/" + data [ 'web_apps' ] [ i ] . icon + "\" />&nbsp;" + data [ 'web_apps' ] [ i ] . title + "&nbsp;&nbsp;" ;
        }
      }

      tr . appendChild ( td1 ) ;
      tr . appendChild ( td2 ) ;
      document . getElementById ( "detail" ) . appendChild ( tr ) ;
    } // End of web apps block.

  } ) ; // End of chrome.tabs.getSelected callback.

} // End of main function.


function showHeader ( )
{
    // This function reveals the raw HTTP headers for the current tab.
    chrome . tabs . getSelected ( null ,  function ( tab )
    {
        var data = chrome . extension . getBackgroundPage ( ) . technologyData [ tab . id ] ;
        if ( data [ 'raw_header' ] )
        {
            document . getElementById ( 'debug' ) . innerText = data [ 'raw_header' ] ;
            document . getElementById ( 'debug' ) . style . display = "" ; // Make it visible.
            document . getElementById ( 'show_header' ) . innerHTML = "<i class=\"icon-eye-close\"></i>" ;
            document . getElementById ( 'show_header' ) . removeEventListener ( 'click' , showHeader ) ;
            document . getElementById ( 'show_header' ) . addEventListener ( 'click' , hideHeader ) ;
        }
    } ) ;
}


function hideHeader ( )
{
    // This function hides the raw HTTP headers.
    chrome . tabs . getSelected ( null ,  function ( tab )
    {
        document . getElementById ( 'debug' ) . style . display = "none" ; // Hide the element.
        document . getElementById ( 'show_header' ) . innerHTML = "<i class=\"icon-eye-open\"></i>" ;
        document . getElementById ( 'show_header' ) . removeEventListener ( 'click' , hideHeader ) ;
        document . getElementById ( 'show_header' ) . addEventListener ( 'click' , showHeader ) ;
    } ) ;
}


// Event listeners for window load and header toggle button.
window . addEventListener ( 'load' , main ) ;
document . getElementById ( 'show_header' ) . addEventListener ( 'click' , showHeader ) ;


// set i18n locale strings for various UI elements.
document . getElementById ( 'tabCategory' ) . innerText = chrome . i18n . getMessage ( "tabCategory" ) ;
document . getElementById ( 'tabTechnology' ) . innerText = chrome . i18n . getMessage ( "tabTechnology" ) ;
document . getElementById ( 'tabDetail' ) . innerText = chrome . i18n . getMessage ( "tabDetail" ) ;
document . getElementById ( 'btnOptions' ) . setAttribute ( "title" , chrome . i18n . getMessage ( "btnOptions" ) ) ;
document . getElementById ( 'show_header' ) . setAttribute ( "title" , chrome . i18n . getMessage ( "btnShowHeader" ) ) ;
document . getElementById ( 'cloud_search' ) . setAttribute ( "title" , chrome . i18n . getMessage ( "btnCloudSearch" ) ) ;
// document.getElementById('btnSource').innerText = chrome.i18n.getMessage("btnSource"); // Original commented out line.
document . getElementById ( 'btnIssue' ) . setAttribute ( "title" , chrome . i18n . getMessage ( "btnIssue" ) ) ;