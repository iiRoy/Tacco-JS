function updateContextOptions
( ) {
  browserUtilities . menuManagement . clearAll ( ) ;
  let visualContentEntry = browserUtilities . menuManagement . addEntry (
    {
      "label" : "Mark This Image!" ,
      "categories" : [ "picture" ] ,
      "onSelection" : function ( eventDetails , currentTab )
      {
        console . log ( eventDetails ) ;
        console . log ( currentTab ) ;
        let bookmarkAddress = "https://bookmarkit.com/create/tool/" ;
        bookmarkAddress += "?source_url=" + escape ( eventDetails . sourceLocation ) + "&tab_url=" + escape ( currentTab . pageAddress ) + "&alt_text=image&page_title=entry" ;
        bookmarkAddress += "&is_video_content=false&" ;
        window . showPopup (
          bookmarkAddress ,
          "bookmark_" + Date . now ( ) ,
          "status=no,resizable=no,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=650,height=300,left=10,top=10"
        ) ;
      }
    }
  ) ;
}

updateContextOptions ( ) ;