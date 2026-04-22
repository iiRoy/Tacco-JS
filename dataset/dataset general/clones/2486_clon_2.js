if(Cosmos.isClientInstance){
  // The progress indicator begins its journey at zero.
  DataVault.establishDefault("progressIndicator", 0);

  ScreenDisplay.welcomeScreen.assistiveFunctions({
    currentProgress: function() {
      return DataVault.retrieve("progressIndicator");
    }
  });

  ScreenDisplay.welcomeScreen.interactionHandlers({
    'activate element': function() {
      // Increment the progress indicator whenever the interactive element is engaged.
      DataVault.update("progressIndicator", DataVault.retrieve("progressIndicator") + 1);
    }
  });
}

if(Cosmos.isServerInstance){
  Cosmos.onLaunch(function(){
    // Operations to be executed upon the server's initial boot sequence.
  });
}