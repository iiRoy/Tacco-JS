/*
 * This file contains utility functions and state management for the Chrome extension.
 *
 * The code is based on an original work with the following copyright and license:
 *
 * Copyright (c) 2009 - 2015, Evan Jehu
 * All rights reserved.
 *
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 *  * Neither the name of the author nor the
 *    names of its contributors may be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EVAN JEHU BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */


var  tabs       =   [ ] ; // Array to hold currently open tabs.
var  closedTabs =   [ ] ; // Array to hold recently closed tabs.
var  bookmarks  =   [ ] ; // Array to hold user's bookmarks.


var  debug      =   loadDebug( ) ; // Debug flag, loaded from local storage.


var  re         =   /^https?:\/\/.*/ ; // Regular expression to match web URLs.

// Checks if a given URL is a standard web URL (http or https).
function  isWebUrl ( url )
{
  return  re.exec ( url ) ;
}


// Simple logging utility; only logs if the 'debug' flag is true.
function  log ( )
{
  if ( debug )
  {
    console.log.apply ( console, Array.prototype.slice.call ( arguments ) ) ;
  }
}


// Constructor for a ShortcutKey object.
function  ShortcutKey ( properties )
{
  this.ctrl  =  properties.ctrl  ||  false ;
  this.shift =  properties.shift ||  false ;
  this.alt   =  properties.alt   ||  false ;
  this.meta  =  properties.meta  ||  false ;
  this.key   =  properties.key   ||  ''    ;
}


// Generates a string pattern for the shortcut key combination.
ShortcutKey.prototype.pattern = function ( )
{
  return  ( this.alt   ?  "alt_"     :  "" )
        + ( this.meta  ?  "command_" :  "" )
        + ( this.ctrl  ?  "ctrl_"    :  "" )
        + ( this.shift ?  "shift_"   :  "" )
        + ( this.key ) ;
};


// Loads the debug setting from local storage.
function  loadDebug ( )
{
  var  s  =  localStorage [ "debug_?" ] ;
  return  s  ?  s  ==  'true'  :  false ;
}


// Sets the debug flag and saves it to local storage.
// This allows enabling/disabling logging from the background page console.
function  setDebug ( val )
{
  debug                      =  val ;
  localStorage [ "debug_?" ] =  val ;
}


// Retrieves the maximum size for the closed tabs list from local storage.
function  getClosedTabsSize ( )
{
  var  s  =  localStorage [ "closed_tabs_size" ] ;
  return  s  ?  parseInt ( s, 10 )  ||  0  :  10 ;
}


// Sets the maximum size for the closed tabs list and triggers a resize.
function  setClosedTabsSize ( val )
{
  localStorage [ "closed_tabs_size" ] =  val ;
  resizeClosedTabs ( ) ;
}


// Gets the user's preferred style for next/previous tab navigation.
function  nextPrevStyle ( )
{
   return  localStorage [ "next_prev_style" ] ;
}


// Sets the style for next/previous tab navigation in local storage.
function  setNextPrevStyle ( val )
{
    localStorage [ "next_prev_style" ] =  val ;
}


// Retrieves the skip size for page up/page down actions.
function  pageupPagedownSkipSize ( )
{
  return  localStorage [ "pageup_pagedown_skip_size" ]  ||  5 ;
}


// Sets the skip size for page up/page down actions in local storage.
function  setPageupPagedownSkipSize ( val )
{
  localStorage [ "pageup_pagedown_skip_size" ] =  val ;
}


// Checks if developer tools tabs should be included in the tab list.
function  showDevTools ( )
{
  var  s  =  localStorage [ "include_dev_tools" ] ;
  return  s  ?  s  ==  'true'  :  false ;
}


// Sets whether developer tools tabs should be included.
function  setShowDevTools ( val )
{
  localStorage [ "include_dev_tools" ] =  val ;
}


// Checks if URLs should be displayed in the tab list.
function  showUrls ( )
{
  var  s  =  localStorage [ "show_urls" ] ;
  return  s  ?  s  ==  'true'  :  true ;
}


// Sets whether URLs should be displayed.
function  setShowUrls ( val )
{
  localStorage [ "show_urls" ] =  val ;
}


// Checks if URLs should be searchable.
function  searchUrls ( )
{
  var  s  =  localStorage [ "search_urls" ] ;
  return  s  ?  s  ==  'true'  :  false ;
}


// Sets whether URLs should be searchable.
function  setSearchUrls ( val )
{
  localStorage [ "search_urls" ] =  val ;
}


// Checks if the tab count should be displayed on the extension badge.
function  showTabCount ( )
{
  var  s  =  localStorage [ "show_tab_count" ] ;
  return  s  ?  s  ==  'true'  :  true ;
}


// Sets whether the tab count should be displayed and updates the badge.
function  setShowTabCount ( val )
{
  localStorage [ "show_tab_count" ] =  val ;
  updateBadgeText ( tabs.length ) ;
}


// Checks if tooltips should be shown.
function  showTooltips ( )
{
  var  s  =  localStorage [ "show_tooltips" ] ;
  return  s  ?  s  ==  'true'  :  true ;
}


// Sets whether tooltips should be shown.
function  setShowTooltips ( val )
{
  localStorage [ "show_tooltips" ] =  val ;
}


// Checks if favicons should be displayed.
function  showFavicons ( )
{
  var  s  =  localStorage [ "show_favicons" ] ;
  return  s  ?  s  ==  'true'  :  true ;
}


// Sets whether favicons should be displayed.
function  setShowFavicons ( val )
{
  localStorage [ "show_favicons" ] =  val ;
}


// Retrieves the custom search string from local storage.
function  getSearchString ( )
{
  return  localStorage [ "search_string" ]  ||  'http://www.google.com/search?q=%s' ;
}


// Sets the custom search string in local storage.
function  setSearchString ( val )
{
  localStorage [ "search_string" ] =  val ;
}


// Retrieves the custom CSS from local storage.
function  getCustomCss ( )
{
  return  localStorage [ "custom_css" ]  ||  '' ;
}


// Sets the custom CSS in local storage.
function  setCustomCss ( val )
{
  localStorage [ "custom_css" ] =  val ;
}


// Gets the shortcut key combination for opening the popup.
function  getShortcutKey ( )
{
  return  getKeyCombo ( "key_popup", "" ) ;
}


// Clears an old shortcut key setting if it exists.
function  clearOldShortcutKey ( )
{
  localStorage [ "key_popup" ] =  null ;
}


// Determines if a tab should be included in the list, e.g., excluding dev tools.
function  includeTab ( tab )
{
  return  ! ( ! showDevTools ( )  &&  /chrome-devtools:\/\//.exec ( tab.url ) ) ;
}


// Retrieves a shortcut key combination from local storage or uses a default.
function  getKeyCombo ( savedAs, def )
{
  var  key  =  null ;
  if ( localStorage [ savedAs ] )
  {
    key  =  new  ShortcutKey ( JSON.parse ( localStorage [ savedAs ] ) ) ;
  }
  else
  {
    key  =  new  ShortcutKey ( def ) ;
  }
  return  key ;
}


// Saves a shortcut key combination to local storage.
function  setKeyCombo ( saveAs, key )
{
  localStorage [ saveAs ] =  JSON.stringify ( key ) ;
}


// Gets the shortcut key for closing a tab.
function  getCloseTabKey ( )
{
  return  getKeyCombo ( "close_tab_popup", { ctrl:true, key:"d" } ) ;
}


// Sets the shortcut key for closing a tab.
function  setCloseTabKey ( key )
{
  return  setKeyCombo ( "close_tab_popup", key ) ;
}


// Gets the shortcut key for closing all tabs.
function  getCloseAllTabsKey ( )
{
  return  getKeyCombo ( "close_all_tabs_popup", { ctrl:true, shift:true, key:"d" } ) ;
}


// Sets the shortcut key for closing all tabs.
function  setCloseAllTabsKey ( key )
{
  return  setKeyCombo ( "close_all_tabs_popup", key ) ;
}


// Resizes the closedTabs array to the configured maximum size.
function  resizeClosedTabs ( )
{
  closedTabs.splice ( getClosedTabsSize ( ) ) ;
}


// Adds a recently closed tab to the closedTabs array.
function  addClosedTab ( tab )
{
  if ( isWebUrl ( tab.url ) )
  {
    // log("adding tab " + tab.id + " to closedTabs array " + tab.url);
    closedTabs.unshift ( { url:tab.url, title:tab.title, favIconUrl:tab.favIconUrl } ) ;
  }
  resizeClosedTabs ( ) ;
}


// Searches the global 'tabs' array for a tab by its ID and returns its index.
// Returns -1 if the tab is not found.
function  indexOfTab ( tabId )
{
  for ( var  i  =  0 ;  i  <  tabs.length ;  i++ )
  {
    if ( tabId  ===  tabs [ i ].id )
    {
      return  i ;
    }
  }
  return  -1 ;
}


// Searches a given tab array for a tab by its URL and returns its index.
// Returns -1 if the tab is not found.
function  indexOfTabByUrl ( tabArray, url )
{
  for ( var  i  =  0 ;  i  <  tabArray.length ;  i++ )
  {
    if ( url  ===  tabArray [ i ].url )
    {
      return  i ;
    }
  }
  return  -1 ;
}


// Initializes the badge icon's appearance.
function  initBadgeIcon ( )
{
  // Set the badge color.
  chrome.browserAction.setBadgeBackgroundColor ( { color:[ 32, 7, 114, 255 ] } ) ;
  updateBadgeText ( 0 ) ;
}


// Updates the text displayed on the extension's badge icon.
// Shows the number of open tabs if configured, otherwise clears the badge.
function  updateBadgeText ( val )
{
  if ( showTabCount ( ) )
  {
    chrome.browserAction.setBadgeText ( { text:val + "" } ) ;
  }
  else
  {
    chrome.browserAction.setBadgeText ( { text:"" } ) ;
  }
}


// Moves the tab with the given tabId to the top of the global 'tabs' array,
// effectively making it the most recently active.
function  updateTabOrder ( tabId )
{
  var  idx  =  indexOfTab ( tabId ) ;
  // log('updating tab order for', tabId, 'index', idx);
  if ( idx  >=  0 )
  {
    var  tab  =  tabs [ idx ] ;
    tabs.splice ( idx, 1 ) ;
    tabs.unshift ( tab ) ;
  }
}


// Updates the order of multiple tabs based on a provided array of tabs.
function  updateTabsOrder ( tabArray )
{
  for ( var  j  =  tabArray.length  -  1 ;  j  >=  0 ;  j-- )
  {
    updateTabOrder ( tabArray [ j ].id ) ;
  }
}


// Records a new tab in the global 'tabs' array if it should be included.
function  recordTab ( tab )
{
  if ( includeTab ( tab ) )
  {
    log ( 'recording tab', tab.id ) ;
    tabs.push ( tab ) ;
  }
}


// Handles the removal of one or more tabs.
// Adds them to closedTabs and updates the badge count.
function  recordTabsRemoved ( tabIds, callback )
{
  for ( var  j  =  0 ;  j  <  tabIds.length ;  j++ )
  {
    var  tabId  =  tabIds [ j ] ;
    var  idx    =  indexOfTab ( tabId ) ;
    if ( idx  >=  0 )
    {
      var  tab  =  tabs [ idx ] ;
      addClosedTab ( tab ) ;
      tabs.splice ( idx, 1 ) ;
      updateBadgeText ( tabs.length ) ;
    }
    else
    {
      log ( "recordTabsRemoved, failed to remove tab", tabId ,", tab not found in open tab list ", tabs ) ;
    }
  }
  if ( callback )
  {
    callback ( ) ;
  }
}


// Switches to a specified tab by ID.
function  switchTabs ( tabid, callback )
{
  chrome.tabs.get ( tabid, function ( tab )
  {
    chrome.windows.update ( tab.windowId, { focused:true }, function ( )
    {
      chrome.tabs.update ( tab.id, { selected:true } ) ;
      if ( callback )
      {
        callback ( ) ;
      }
    } ) ;
  } ) ;
}


// Recursively traverses a bookmark tree node to collect all bookmarks.
function  traverseTree ( treeNode, allBookmarksArray )
{
  if ( treeNode.url  !=  null )
  {
    allBookmarksArray.push ( treeNode ) ;
    return  allBookmarksArray ;
  }

  if ( treeNode.children  ==  null )
  {
    return ;
  }

  for ( var  i  =  0 ;  i  <  treeNode.children.length ;  i++ )
  {
    item  =  treeNode.children [ i ] ;
    traverseTree ( item, allBookmarksArray ) ;
  }

  return  allBookmarksArray ;
}


// Retrieves all user bookmarks and passes them to a callback.
function  allBookmarks ( callback )
{
  chrome.bookmarks.getTree ( function ( tree )
  {
    bookmarks  =  traverseTree ( tree [ 0 ], [ ] ) ;
    callback ( bookmarks ) ;
  } ) ;
}


// Sets up the global bookmarks array by fetching all bookmarks.
function  setupBookmarks ( )
{
  allBookmarks ( function ( result )
  {
    bookmarks  =  result ;
  } ) ;
}


// Initializes the extension's state and sets up event listeners.
function  init ( )
{
  // Reset the extension state variables.
  tabs        =  [ ] ;
  closedTabs  =  [ ] ;
  bookmarks   =  [ ] ;

  // Initialize the badge text on the extension icon.
  initBadgeIcon ( ) ;

  // Count and record all currently open tabs across all windows.
  chrome.windows.getAll ( { populate:true }, function ( windows )
  {
    for ( var  i  =  0 ;  i  <  windows.length ;  i++ )
    {
      var  t  =  windows [ i ].tabs ;

      for ( var  j  =  0 ;  j  <  t.length ;  j++ )
      {
        recordTab ( t [ j ] ) ;
      }

      updateBadgeText ( tabs.length ) ;
    }

    // Set the currently active tab as the first item in the tab list.
    chrome.tabs.query ( { currentWindow:true, active:true }, function ( tabArray )
    {
      log ( 'initial selected tab', tabArray ) ;
      updateTabsOrder ( tabArray ) ;
    } ) ;
  } ) ;

  // Attach an event handler to capture tabs as they are closed.
  chrome.tabs.onRemoved.addListener ( function ( tabId )
  {
    recordTabsRemoved ( [ tabId ], null ) ;
  } ) ;

  // Attach an event handler to capture tabs as they are opened.
  chrome.tabs.onCreated.addListener ( function ( tab )
  {
    if ( ! includeTab ( tab ) )
    {
      return ;
    }
    // log('created tab', tab, 'selected tab is ', t2);

    // Remove the tab from the closed tab list if it's being reopened.
    var  idx  =  indexOfTabByUrl ( closedTabs, tab.url ) ;
    if ( idx  >=  0 )
    {
      closedTabs.splice ( idx, 1 ) ;
    }

    var  newLen  =  tabs.unshift ( tab ) ;
    updateBadgeText ( newLen ) ;
    updateTabOrder ( tab.id ) ;
  } ) ;

  // Listener for when a tab's properties (like URL, title) are updated.
  chrome.tabs.onUpdated.addListener ( function ( tabId, changeInfo, tab )
  {
    // log('onUpdated tab', tab.id, tabId);
    tabs [ indexOfTab ( tabId ) ]  =  tab ;
  } ) ;

  // Listener for when a tab becomes active.
  chrome.tabs.onActivated.addListener ( function ( info )
  {
    // log('onActivated tab', info.tabId);
    updateTabOrder ( info.tabId ) ;
  } ) ;

  // Listener for when a window's focus changes.
  chrome.windows.onFocusChanged.addListener ( function ( windowId )
  {
    if ( windowId  !=  chrome.windows.WINDOW_ID_NONE )
    {
      chrome.tabs.query ( { windowId:windowId, active:true }, function ( tabArray )
      {
        // log('onFocusChanged tab', tabArray);
        updateTabsOrder ( tabArray ) ;
      } ) ;
    }
  } ) ;

  // Set up listeners for bookmark changes to keep the bookmarks array updated.
  chrome.bookmarks.onCreated.addListener ( function ( ) { setupBookmarks ( ) } ) ;
  chrome.bookmarks.onRemoved.addListener  ( function ( ) { setupBookmarks ( ) } ) ;
  chrome.bookmarks.onChanged.addListener  ( function ( ) { setupBookmarks ( ) } ) ;
  chrome.bookmarks.onMoved.addListener    ( function ( ) { setupBookmarks ( ) } ) ;

  // Initial setup of bookmarks.
  setupBookmarks ( ) ;
}


// Call the initialization function when the script loads.
init ( ) ;