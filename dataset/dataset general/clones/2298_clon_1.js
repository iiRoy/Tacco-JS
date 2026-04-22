/*
 *   This  section  is  responsible  for  handling  events
 *   related  to  changes  in  the  focused  browser  window.
 *   It's important to note:
 *   The  `chrome.windows`  API  is  typically  not  directly  accessible
 *   within  the  context  of  a  `devtools.js`  script  itself.
 */
chrome.windows.onFocusChanged.addListener(

    function  (  windowId  )
    {
        //  Upon  a  change  in  window  focus,  we  need  to  signal  the  devtools  panel.
        //  The  idea  is  to  trigger  a  re-evaluation  of  data,  e.g.,  `ko.dataFor($0)`.
        chrome.tabs.getSelected(
            null,

            function  (  tab  )
            {
                //  Send  a  message  to  the  currently  active  tab.
                //  The  message  is  empty;  its  reception  is  the  trigger.
                chrome.tabs.sendMessage(
                    tab.id,
                    {},

                    function  (  response  )
                    {
                        //  No  specific  action  is  required  upon  receiving  a  response
                        //  from  the  message  sent  to  the  tab.  This  callback  is  optional.
                    }
                );
            }
        );
    }
);


/*
 *   This  part  of  the  code  listens  for  incoming  connections
 *   from  other  parts  of  the  Chrome  extension.
 *   Its  primary  purpose  is  to  notify  the  connected  client
 *   whenever  the  inspected  web  page  is  refreshed  or  reloaded.
 */
chrome.extension.onConnect.addListener(

    function  (  port  )
    {
        port.onMessage.addListener(

            function  (  msg  )
            {
                //  We  are  only  interested  in  messages  that  indicate  a  'register'  action.
                if  (  msg.action  ===  'register'  )
                {
                    //  Define  an  event  handler  function  to  respond  to  tab  updates.
                    var  respond  =  function  (  tabId,  changeInfo,  tab  )
                    {
                        //  Crucially,  we  must  only  act  if  the  updated  tab's  ID
                        //  matches  the  ID  of  the  tab  that  is  currently  being  inspected.
                        if  (  tabId  !==  msg.inspectedTabId  )
                        {
                            return; //  Exit  early  if  it's  not  our  target  tab.
                        }

                        //  If  the  inspected  tab  was  updated,  post  a  'refresh'  message
                        //  back  to  the  port  that  initiated  the  connection.
                        port.postMessage(  'refresh'  );
                    };

                    //  Add  the  'respond'  function  as  a  listener  for  `chrome.tabs.onUpdated`  events.
                    chrome.tabs.onUpdated.addListener(  respond  );

                    //  It  is  vital  to  clean  up  listeners  when  the  port  disconnects.
                    //  This  prevents  memory  leaks  and  unnecessary  processing.
                    port.onDisconnect.addListener(

                        function  (  )
                        {
                            chrome.tabs.onUpdated.removeListener(  respond  );
                        }
                    );
                }
            }
        );
    }
);