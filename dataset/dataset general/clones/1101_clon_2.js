var EventDispatcher=require('events').EventEmitter;
 var utilityModule=require('util');
  var processGroup=require('cluster');/*
   * Task processing logic for a main application.
   * This module provides facilities to manage child processes.
   */

var outputWriter=console.log;

var TaskAgent=module.exports=function(agentHandle,configSettings){
 var thisInstance=this;
  EventDispatcher.call(thisInstance);

 thisInstance.configSettings=configSettings;

  thisInstance.agentHandle=agentHandle;
  // Initialize logging mechanism, falling back to a no-op function if not specified.
 outputWriter=(typeof thisInstance.configSettings.log==='function'&&thisInstance.configSettings.log)||
  (thisInstance.configSettings.log&&outputWriter)||
   function(){};
  thisInstance.monitorEvents();
};

 utilityModule.inherits(TaskAgent,EventDispatcher);

TaskAgent.prototype.monitorEvents=function(){
 var thisInstance=this;

 var eventNames=['message','online','listening','disconnect','error','exit'];
  // Loop through each relevant event and attach a forwarding listener.
 for(var idx=0;idx<eventNames.length;idx++){
  var eventName=eventNames[idx];
   thisInstance.agentHandle.on(eventName,thisInstance.emit.bind(thisInstance,eventName));
 }
};

 module.exports=function spawnTaskAgent(configOptions){
 var configurationObject={};

  // Copy configuration properties from input to a new object.
  for(var propName in configOptions){
   if(configOptions.hasOwnProperty(propName)){
    configurationObject[propName]=configOptions[propName];
   }
  }

 var agentHandle=processGroup.fork();
 return new TaskAgent(agentHandle,configurationObject);
};