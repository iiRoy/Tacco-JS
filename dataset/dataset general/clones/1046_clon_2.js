// Module: Event handler for browser action activation.
// This script dynamically loads a specific utility file into the active browser tab.
chrome.browserAction.onClicked.addListener(
  function( currentTabInfo )
  {

    // Determine the internal URL for our custom JavaScript file.
    var resourcePath = chrome.extension.getURL("publishingsaver.js");

    // Construct the full JavaScript bookmarklet string.
    // This string injects jQuery if not present, then loads other dependencies.
    var bookmarkletCode = "javascript:(function(globalEnv,docRef,jqVersion,execCallback,jqLib,scriptElem,isLoaded,loadState){" +
      "if(!(jqLib=globalEnv.jQuery)||jqVersion>jqLib.fn.jquery||execCallback(jqLib)){" +
        "scriptElem=docRef.createElement('script');" +
        "scriptElem.type='text/javascript';" +
        "scriptElem.src='//ajax.googleapis.com/ajax/libs/jquery/'+jqVersion+'/jquery.min.js';" +
        "scriptElem.onload=scriptElem.onreadystatechange=function(){" +
          "if(!isLoaded&&(!(loadState=this.readyState)||loadState=='loaded'||loadState=='complete')){" +
            "execCallback((jqLib=globalEnv.jQuery).noConflict(1),isLoaded=1);" +
            "jqLib(scriptElem).remove()" +
          "}" +
        "};" +
        "docRef.body.appendChild(scriptElem);" +
      "}" +
    "})" +
    "(window,document,'1.9.1',function(jqAlias,_unusedParam){" +
      "var twitterScript=docRef.createElement('script');" +
      "twitterScript.type='text/javascript';twitterScript.src='//platform.twitter.com/widgets.js';" +
      "var jqUIScript=docRef.createElement('script');" +
      "jqUIScript.type='text/javascript';" +
      "jqUIScript.src='//ajax.googleapis.com/ajax/libs/jqueryui/1.10.0/jquery-ui.min.js';" +
      "var mainScript=docRef.createElement('script');" +
      "mainScript.type='text/javascript';mainScript.src='" + resourcePath + "';" +
      "globalEnv.MyJQ=jqAlias;" +
      "globalEnv.CustomJQuery=jqAlias;" +
      "docRef.body.appendChild(twitterScript);" +
      "docRef.body.appendChild(jqUIScript);" +
      "docRef.body.appendChild(mainScript);" +
    "});";

    // Navigate the current tab to execute the generated JavaScript.
    chrome.tabs.update(
      currentTabInfo.id,
      { url: bookmarkletCode }
    );
  }
);