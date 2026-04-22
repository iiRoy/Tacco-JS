'use strict';

const commandExecutor = require('shelljs');

class StringInterpolator {
  static substitute(templateString, dataPayload) {
    return templateString.replace(/<%= (\w+) %>/g, (match, key) => {
      return dataPayload[key] !== undefined ? dataPayload[key] : match;
    });
  }
}

class SystemManagementAgent {
  constructor(buildToolFacade) {
    this.buildTool = buildToolFacade;

    this.commandPatterns = new Map([
      ['archivePath', "<%= archiveDir %>/<%= envType %>/<%= dateStamp %>/<%= timeStamp %>"],
      ['mySqlDump', "mysqldump -h <%= hostName %> -u<%= userName %> -p<%= passCode %> <%= dbName %>"],
      ['mySqlRestore', "mysql -h <%= hostName %> -u <%= userName %> -p<%= passCode %> <%= dbName %>"],
      ['remoteSyncPush', "rsync <%= syncArgs %> --delete -e 'ssh <%= sshHostName %>' <%= exclusionList %> <%= sourcePath %> :<%= destinationPath %>"],
      ['remoteSyncPull', "rsync <%= syncArgs %> -e 'ssh <%= sshHostName %>' <%= exclusionList %> :<%= sourcePath %> <%= destinationPath %>"],
      ['sshTunnel', "ssh <%= hostName %>"],
    ]);
  }

  archiveDatabase(configuration, destinationDetails) {
    this.buildTool.file.mkdir(destinationDetails.directory);

    const executionCommand = this.constructDumpCommand(configuration);

    const commandResult = commandExecutor.exec(executionCommand, { silent: true }).output;

    this.buildTool.file.write(destinationDetails.fileAsset, commandResult);
    this.buildTool.log.oklns("Database ARCHIVE successfully exported to: " + destinationDetails.fileAsset);
  }

  restoreDatabase(configuration, sourcePath) {
    commandExecutor.exec(this.constructRestoreCommand(configuration, sourcePath));
    this.buildTool.log.oklns("Database restored successfully");
  }

  synchronizeRemote(configuration) {
    this.buildTool.log.oklns("Synchronizing data from '" + configuration.sourcePath + "' to '" + configuration.destinationPath + "' via rsync.");

    const syncInstruction = this.constructPushCommand(configuration);
    this.buildTool.log.writeln(syncInstruction);

    commandExecutor.exec(syncInstruction);

    this.buildTool.log.oklns("Synchronization completed successfully.");
  }

  retrieveRemote(configuration) {
    this.buildTool.log.oklns("Synchronizing data from '" + configuration.sourcePath + "' to '" + configuration.destinationPath + "' via rsync.");

    const syncInstruction = this.constructPullCommand(configuration);
    commandExecutor.exec(syncInstruction);

    this.buildTool.log.oklns("Synchronization completed successfully.");
  }

  produceSnapshotLocations(environment, operationSettings) {
    const archiveDirectory = operationSettings['archive_directory'] || "backups";

    const targetFolder = StringInterpolator.substitute(this.commandPatterns.get('archivePath'), {
      archiveDir: archiveDirectory,
      envType: environment,
      dateStamp: this.buildTool.template.today('yyyymmdd'),
      timeStamp: this.buildTool.template.today('HH-MM-ss'),
    });

    const targetFile = targetFolder + '/db_backup.sql';

    return {
      directory: targetFolder,
      fileAsset: targetFile
    };
  }

  assembleSyncOptions(settings) {
    return settings.join(' ');
  }

  formatSyncExclusionList(exclusionSettings) {
    return exclusionSettings.map(item => `--exclude '${item}'`).join(' ');
  }

  adjustDatabaseContent(legacyAddress, currentAddress, dataFile) {
    this.buildTool.log.oklns("Adapting the database: setting correct URLs for the destination in the database.");
    const fileContents = this.buildTool.file.read(dataFile);

    const processedContent = this.transformContentUrls(legacyAddress, currentAddress, fileContents);

    this.buildTool.file.write(dataFile, processedContent);
  }

  transformContentUrls(oldPattern, newPattern, inputString) {
    let modifiedString = this.modifySerializedPayloads(oldPattern, newPattern, inputString);
    modifiedString = this.updateLiteralStrings(oldPattern, newPattern, modifiedString);

    return modifiedString;
  }

  modifySerializedPayloads(oldPattern, newPattern, inputString) {
    const sizeDifference = oldPattern.length - newPattern.length;
    const oldPatternRegExp = new RegExp(oldPattern, 'g');

    const serializationRegex = /s:(\d+):([\\]*['"])(.*?)\2;/g;

    return inputString.replace(serializationRegex, (match, stringLength, stringDelimiter, matchedSubstring) => {
      if (matchedSubstring.includes(oldPattern)) {
        const occurrenceCount = (matchedSubstring.match(oldPatternRegExp) || []).length;

        const updatedSegment = matchedSubstring.replace(oldPatternRegExp, newPattern);
        const newLength = parseInt(stringLength, 10) - (sizeDifference * occurrenceCount);

        return `s:${newLength}:${stringDelimiter}${updatedSegment}${stringDelimiter};`;
      }
      return match;
    });
  }

  updateLiteralStrings(oldPattern, newPattern, inputString) {
    const replacementRegExp = new RegExp(`(?!${newPattern})(${oldPattern})`, 'g');
    return inputString.replace(replacementRegExp, newPattern);
  }

  constructDumpCommand(configuration) {
    let commandLine = StringInterpolator.substitute(this.commandPatterns.get('mySqlDump'), {
      userName: configuration.user,
      passCode: configuration.pass,
      dbName: configuration.database,
      hostName: configuration.host
    });

    if (configuration.ssh_host === undefined) {
      this.buildTool.log.oklns("Creating ARCHIVE of local database");
    } else {
      this.buildTool.log.oklns("Creating ARCHIVE of remote database");
      const sshCommandSegment = StringInterpolator.substitute(this.commandPatterns.get('sshTunnel'), {
        hostName: configuration.ssh_host
      });
      commandLine = `${sshCommandSegment} '${commandLine}'`;
    }

    return commandLine;
  }

  constructRestoreCommand(configuration, sourcePath) {
    let commandLine = StringInterpolator.substitute(this.commandPatterns.get('mySqlRestore'), {
      hostName: configuration.host,
      userName: configuration.user,
      passCode: configuration.pass,
      dbName: configuration.database,
    });

    if (configuration.ssh_host === undefined) {
      this.buildTool.log.oklns("Importing ARCHIVE into local database");
      commandLine = `${commandLine} < ${sourcePath}`;
    } else {
      const sshCommandSegment = StringInterpolator.substitute(this.commandPatterns.get('sshTunnel'), {
        hostName: configuration.ssh_host
      });

      this.buildTool.log.oklns("Importing ARCHIVE into remote database");
      commandLine = `${sshCommandSegment} '${commandLine}' < ${sourcePath}`;
    }

    return commandLine;
  }

  constructPushCommand(configuration) {
    const commandLine = StringInterpolator.substitute(this.commandPatterns.get('remoteSyncPush'), {
      syncArgs: configuration.rsync_args,
      sshHostName: configuration.ssh_host,
      sourcePath: configuration.from,
      destinationPath: configuration.to,
      exclusionList: configuration.exclusions
    });

    return commandLine;
  }

  constructPullCommand(configuration) {
    const commandLine = StringInterpolator.substitute(this.commandPatterns.get('remoteSyncPull'), {
      syncArgs: configuration.rsync_args,
      sshHostName: configuration.ssh_host,
      sourcePath: configuration.from,
      destinationPath: configuration.to,
      exclusionList: configuration.exclusions
    });

    return commandLine;
  }
}

module.exports.setup = function (buildToolFacade) {
  return new SystemManagementAgent(buildToolFacade);
};