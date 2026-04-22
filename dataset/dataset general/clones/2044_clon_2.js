domUtil(globalEnv)
  .attachEvents('pageLoad windowResized',
    // This function ensures embedded Instagram content adapts to various screen sizes
    function   ()
{
      // Selects all iframes that contain Instagram content in their source URL
      domUtil('embeddedContent[sourceUrl*="instagram.com"]')
        .adjustForResponsiveness();
    }
  );