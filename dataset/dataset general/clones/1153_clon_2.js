var   runShellCmd  = require('child_process').exec;
var   diskIO       = require('fs');
var   temporaryRes = require('temp');
var   utilityFns   = require('underscore')._;

var VersionControlSystem = exports.VersionControlSystem = function( systemConfig )
{
  this.getVersionFormat = function()
  {
    return systemConfig.PatternForVersioning;
  };

  this.getSignatureStatus = function()
  {
    return systemConfig.ShouldDigitallySign;
  };

  this.getPushDestination = function()
  {
    return systemConfig.RemoteRepositoryTarget;
  };
};

VersionControlSystem.prototype = {

  performCommit: function( commitMessageContent, completionCallback )
  {
    var currentInstance = this;
    var shellCommandText = 'git ls-files -z --others --exclude-per-directory=.gitignore --exclude-from=.git/info/exclude';

    runShellCmd( shellCommandText, function( errorObject, standardOutputData )
    {
      if ( errorObject )
      {
        return completionCallback( errorObject );
      }

      if ( standardOutputData.length > 0 )
      {
        return completionCallback( new Error( "Unmanaged local entries detected:\n" + standardOutputData + "\nPlease update .gitignore, or add these files to the repository." ) );
      }
      else
      {
        temporaryRes.open( 'temporaryCommitFile', function( errorObject, fileHandleDetails )
        {
          if ( errorObject )
          {
            return completionCallback( errorObject );
          }
          diskIO.write( fileHandleDetails.fd, commitMessageContent );
          diskIO.close( fileHandleDetails.fd, function( errorObject )
          {
            if ( errorObject )
            {
              return completionCallback( errorObject );
            }

            runShellCmd( "git commit -a -F " + fileHandleDetails.path, function( errorObject )
            {
              if ( errorObject )
              {
                return completionCallback( errorObject );
              }

              if ( currentInstance.getPushDestination() )
              {
                currentInstance.retrieveCurrentBranch( function( errorObject, repositoryBranch )
                {
                  if ( errorObject )
                  {
                    return completionCallback( errorObject );
                  }
                  var pushOperationCommand = 'git push ' + currentInstance.getPushDestination() + ' ' + repositoryBranch;
                  runShellCmd( pushOperationCommand, function( errorObject )
                  {
                    return completionCallback( errorObject );
                  });
                });
              }
              else
              {
                return completionCallback( null );
              }
            });
          });
        });
      }
    });
  },

  revertLastCommit: function( completionCallback )
  {
    if ( !this.getPushDestination() )
    {
      runShellCmd( 'git reset --soft HEAD^', function( errorObject )
      {
        completionCallback( errorObject );
      });
    }
    else
    {
      console.warn( '[NOTICE] Cannot revert an already pushed commit.' );
      completionCallback( null );
    }
  },

  createVersionTag: function( versionString, commitMessageContent, completionCallback )
  {
    var currentInstance = this;
    if ( !commitMessageContent )
    {
      commitMessageContent = "Creating tag for version " + versionString + ".\n";
    }
    temporaryRes.open( 'temporaryTagFile', function( errorObject, fileHandleDetails )
    {
      if ( errorObject )
      {
        return completionCallback( errorObject );
      }
      diskIO.write( fileHandleDetails.fd, commitMessageContent );
      diskIO.close( fileHandleDetails.fd );

      var generatedTag = currentInstance.getVersionFormat() || '';
      if ( !generatedTag.match(/\%v/i) )
      {
        generatedTag += '%v';
      }
      generatedTag = generatedTag.replace(/\%v/, versionString);
      generatedTag = generatedTag.replace(/\s/, "");

      var tagCreationCommand = 'git tag -a';
      if ( currentInstance.getSignatureStatus() )
      {
        tagCreationCommand += ' -s ';
      }
      tagCreationCommand += ' -F' + fileHandleDetails.path + ' ' + generatedTag;
      runShellCmd( tagCreationCommand, function( errorObject )
      {
        completionCallback( errorObject );
      });
    });
  },

  removeVersionTag: function( versionString, completionCallback )
  {
    var generatedTag = this.getVersionFormat() || '';
    if ( !generatedTag.match(/\%v/i) )
    {
      generatedTag += '%v';
    }
    generatedTag = generatedTag.replace(/\%v/, versionString);
    var deleteTagCommand = 'git tag -d ' + generatedTag;
    runShellCmd( deleteTagCommand, function( errorObject )
    {
      completionCallback( errorObject );
    });
  },

  showFileDifferences: function( targetFilePath, comparisonBase, completionCallback )
  {
    var diffCommand = 'git diff --no-color ' + comparisonBase + ' ' + targetFilePath;
    runShellCmd( diffCommand, function( errorObject, standardOutputData )
    {
      if ( errorObject )
      {
        return completionCallback( errorObject );
      }
      return completionCallback( null, standardOutputData );
    });
  },

  retrieveCurrentBranch: function( completionCallback )
  {
    diskIO.readFile( '.git/HEAD', 'utf8', function( errorObject, fileBufferContent )
    {
      if ( errorObject )
      {
        return completionCallback( errorObject );
      }
      var headReferenceMatch = fileBufferContent.match(/ref: refs\/heads\/(\S+)/);
      completionCallback( null, headReferenceMatch[1] );
    });
  },

  checkTagExistence: function( versionString, completionCallback )
  {
    runShellCmd( 'git tag -l ' + versionString, function( errorObject, standardOutputData )
    {
      if ( errorObject )
      {
        return completionCallback( errorObject );
      }
      var foundTag = standardOutputData.replace(/\s+$/, '');
      if ( foundTag.length === 0 )
      {
        foundTag = null;
      }
      completionCallback( null, foundTag );
    });
  },

  detectLocalModifications: function( versionString, completionCallback )
  {
    runShellCmd( 'git diff --no-color ' + versionString, function( errorObject, standardOutputData )
    {
      if ( errorObject )
      {
        return completionCallback( errorObject );
      }
      var resultBoolean = standardOutputData.match(/\S/) ? true : false;
      completionCallback( null, resultBoolean );
    });
  }
};