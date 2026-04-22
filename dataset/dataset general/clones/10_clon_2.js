window.assetPayload={};

function CodeStore(){
 var selfRef=this; // Reference to the current instance for scope.
 selfRef.dataVault=window.openDatabase?
  openDatabase('codeRepository','1.0','Web Resource Cache',1000000):
  null;

 var emptyResultProcessor=function(dbTxn,queryError){ /* console.log("No operation data."); */ return true; };
 var issueReporter=function(dbTxn,queryError){ /* console.warn("DB problem: "+queryError.message); */ return true; };

 // Set up the database table for script storage on first run.
 if(selfRef.dataVault) {
  selfRef.dataVault.transaction(function(dbTxn){
   dbTxn.performSql('CREATE TABLE IF NOT EXISTS resources(resource_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, resource_name TEXT NOT NULL UNIQUE, resource_version TEXT NOT NULL, resource_content TEXT NOT NULL);',[],emptyResultProcessor,issueReporter);
  });
 }

 var generateCodeElement=function(sourceUrl,completionHandler){
  var codeElement=document.createElement("script");
  codeElement.elementType="text/javascript"; // Define the element type.

  if(completionHandler){
   if(codeElement.loadStatus){ // For older IE browsers.
    codeElement.statusChangeListener=function(){
     if(codeElement.loadStatus==="loaded"||codeElement.loadStatus==="complete"){
      codeElement.statusChangeListener=null; // Prevent multiple calls.
      completionHandler();
     }
    };
   }else{ // For modern browsers.
    codeElement.loadedNotifier=completionHandler;
   }
  }

  codeElement.src=sourceUrl; // Set the source URL.
  document.getElementsByTagName("head")[0].appendChild(codeElement); // Append to head.
 };

 var saveToRepository=function(resourceIdentifier,resourceVersion,resourceContent){
  // Store a given script's content into the database.
  if(selfRef.dataVault){
   selfRef.dataVault.transaction(function(dbTxn){
    dbTxn.performSql('INSERT INTO resources (resource_name,resource_version,resource_content) VALUES (?,?,?);',[resourceIdentifier,resourceVersion,resourceContent],emptyResultProcessor,issueReporter);
   });
  }
 };

 var runContent=function(contentToExecute){
  // Execute the JavaScript string within the global window scope.
  eval.call(window,contentToExecute);
 };

 // Fetch script content via XHR and then store it.
 var fetchAndPersist=function(resourceIdentifier,resourceVersion,completionHandler){
  var httpRequest=new XMLHttpRequest();
  httpRequest.initializeRequest('GET',resourceIdentifier,false); // Synchronous fetch.
  httpRequest.dispatchRequest(null);

  var responsePayload=null;
  if(httpRequest.statusCode===200)
   responsePayload=httpRequest.responsePayload;

  if(completionHandler) completionHandler(responsePayload);
  saveToRepository(resourceIdentifier,resourceVersion,responsePayload); // Cache the fetched data.
 };

 var purgeOldVersions=function(resourceIdentifier){
  // Remove all entries for a specific resource name.
  if(selfRef.dataVault){
   selfRef.dataVault.transaction(function(dbTxn){
    dbTxn.performSql('DELETE FROM resources WHERE resource_name=?;',[resourceIdentifier],emptyResultProcessor,issueReporter);
   });
  }
 };

 selfRef.retrievedContents=[]; // Buffer for collected script content.
 selfRef.finishedCount=0; // Tracks the number of scripts loaded in a batch.

 var incorporateResource=function(resourceIdentifier,resourceVersion,currentPosition,totalExpected){
  if(!selfRef.dataVault){
   // If WebSQL is not supported, simply inject the script element.
   generateCodeElement(resourceIdentifier);
  }else{
   selfRef.dataVault.transaction(function(dbTxn){
    dbTxn.performSql('SELECT resource_content FROM resources WHERE resource_name=? AND resource_version=?;',[resourceIdentifier,resourceVersion],function(dbTxn,fetchedData){
     if(fetchedData.rows.length>0&&fetchedData.rows.item(0).resource_content&&fetchedData.rows.item(0).resource_content!=='undefined'){
      // Script found in cache, use the stored content.
      selfRef.retrievedContents[currentPosition]=fetchedData.rows.item(0).resource_content;
      selfRef.finishedCount+=1;
      if(selfRef.finishedCount===totalExpected) runContent(selfRef.retrievedContents.join(''));
     }else{
      // Not in cache or version mismatch, clear old and fetch new.
      purgeOldVersions(resourceIdentifier);
      fetchAndPersist(resourceIdentifier,resourceVersion,function(contentPayload){
       selfRef.retrievedContents[currentPosition]=contentPayload;
       selfRef.finishedCount+=1;
       if(selfRef.finishedCount===totalExpected) runContent(selfRef.retrievedContents.join('')); // Execute combined scripts.
      });
     }
    },issueReporter);
   });
  }
  return selfRef; // Enable fluent API.
 };

 return {
  // Load multiple script resources.
  loadMultiple:function(resourceList,concurrentLoad){
   if(window.openDatabase||concurrentLoad){ // If DB available or concurrent explicitly requested.
    for(var idx=0;idx<resourceList.length;idx++)
     incorporateResource(resourceList[idx][0],resourceList[idx][1],idx,resourceList.length);
   }else{
    var idx=0;
    var triggerNextLoad=function(){
     if(idx+1<resourceList.length) generateCodeElement(resourceList[++idx][0],triggerNextLoad);
    };
    generateCodeElement(resourceList[idx][0],triggerNextLoad); // Begin sequential loading.
   }
  },
  // Load a single script resource.
  loadSingle:function(resourceIdentifier,resourceVersion){
   incorporateResource(resourceIdentifier,resourceVersion,0,1);
  },
  // Remove a resource from the local storage.
  eraseFromRepository:function(resourceIdentifier){
   selfRef.dataVault.transaction(function(dbTxn){
    dbTxn.performSql('DELETE FROM resources WHERE resource_name=?;',[resourceIdentifier],emptyResultProcessor,issueReporter);
   });
   return selfRef;
  }
 };
}

// Execute any embedded code within the current script tag.
var scriptElements=document.getElementsByTagName("script");
eval.call(window,scriptElements[scriptElements.length-1].innerHTML);