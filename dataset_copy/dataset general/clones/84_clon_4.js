import { promises as fileSys } from 'fs';
import { exec as runCommand } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as parseHtml } from 'cheerio';
import fetch from 'node-fetch';
import archiver from 'archiver';
import formatBytes from 'prettysize';

import appManifest from './package.json' assert { type: 'json' };

const currentDirectory = dirname(fileURLToPath(import.meta.url));

let hasUserConfiguration = false;
let recordSetModified = false;

const defaultSettings = {
  parallelOperations: 5,
  destinationDirectory: 'visual_assets',
  shouldPushToRepo: false,
  includeAllContent: false,
  verifyDeletions: false,
  createArchive: null,
  postCompletionCommand: null,
};

let appSettings = { ...defaultSettings };

const reqHeaders = {
  'User-Agent': 'Visual-Content-Acquirer'
};

let imageRecords = [];

const parseCliArguments = (argList) => {
  const parsed = {};
  for (let i = 0; i < argList.length; i++) {
    const arg = argList[i];
    if (arg.startsWith('--')) {
      const key = arg.substring(2).replace(/-/g, '_');
      if (argList[i + 1] && !argList[i + 1].startsWith('-')) {
        parsed[key] = argList[++i];
      } else {
        parsed[key] = true;
      }
    } else if (arg.startsWith('-')) {
      switch (arg) {
        case '-c': parsed.concurrent_downloads = argList[++i]; break;
        case '-f': parsed.folder_path = argList[++i]; break;
        case '-g': parsed.git_push = true; break;
        case '-a': parsed.all = true; break;
        case '-C': parsed.check_for_deleted = true; break;
      }
    }
  }
  return parsed;
};

const processArguments = async () => {
  const cliArgs = parseCliArguments(process.argv.slice(2));

  try {
    const configPath = `${currentDirectory}/config.js`;
    const userConfigModule = await import(configPath);
    const userConfig = userConfigModule.default || userConfigModule;

    if (userConfig.concurrent_downloads !== undefined) appSettings.parallelOperations = Number(userConfig.concurrent_downloads);
    if (userConfig.folder_path !== undefined) appSettings.destinationDirectory = userConfig.folder_path;
    if (userConfig.git_push !== undefined) appSettings.shouldPushToRepo = userConfig.git_push;
    if (userConfig.all !== undefined) appSettings.includeAllContent = userConfig.all;
    if (userConfig.check_for_deleted !== undefined) appSettings.verifyDeletions = userConfig.check_for_deleted;
    if (userConfig.create_zip !== undefined) appSettings.createArchive = userConfig.create_zip;
    if (userConfig.post_command !== undefined) appSettings.postCompletionCommand = userConfig.post_command;

    if (!userConfig.concurrent_downloads || !userConfig.folder_path || !userConfig.git_push || !userConfig.all) {
      hasUserConfiguration = true;
    }
  } catch (err) {
    hasUserConfiguration = false;
  }

  if (cliArgs.concurrent_downloads !== undefined) appSettings.parallelOperations = Number(cliArgs.concurrent_downloads);
  if (cliArgs.folder_path !== undefined) appSettings.destinationDirectory = cliArgs.folder_path;
  if (cliArgs.git_push !== undefined) appSettings.shouldPushToRepo = cliArgs.git_push;
  if (cliArgs.all !== undefined) appSettings.includeAllContent = cliArgs.all;
  if (cliArgs.check_for_deleted !== undefined) appSettings.verifyDeletions = cliArgs.check_for_deleted;
};

const validateSettings = () => {
  if (!appSettings.parallelOperations || !appSettings.destinationDirectory) {
    console.error('Error: Missing required parameters. Please specify --concurrent_downloads and --folder_path.');
    console.log(`
Usage: node script.js [options]

Options:
  -c, --concurrent_downloads <amount>  Amount of concurrent downloads allowed (default: ${defaultSettings.parallelOperations})
  -f, --folder_path <path>           Folder path of where to download the photos (default: ${defaultSettings.destinationDirectory})
  -g, --git_push                     Automatically commit & push to git repo in photos folder path
  -a, --all                          Download all images on the front page rather than just the featured ones
  -C, --check_for_deleted            Check if an image has been deleted/re-added, and update the metadata.
`);
    process.exit(1);
  }
};

const loadExistingRecords = async () => {
  try {
    const recordFilePath = `${appSettings.destinationDirectory}/records.json`;
    const data = await fileSys.readFile(recordFilePath, 'utf8');
    imageRecords = JSON.parse(data);
  } catch (error) {
    imageRecords = [];
  }
};

const runLimitedConcurrency = async (items, limit, handler) => {
  const activePromises = new Set();
  const results = [];

  for (const item of items) {
    const promise = handler(item).finally(() => {
      activePromises.delete(promise);
    });
    activePromises.add(promise);
    results.push(promise);

    if (activePromises.size >= limit) {
      await Promise.race(activePromises);
    }
  }
  return Promise.all(results);
};

const processItemsSequentially = async (items, handler) => {
  const results = [];
  for (const item of items) {
    results.push(await handler(item));
  }
  return results;
};

const initiateProcess = async () => {
  await processArguments();
  validateSettings();
  await loadExistingRecords();

  await fileSys.mkdir(appSettings.destinationDirectory, { recursive: true });

  await acquireContentAndDownload();
};

const contentSource = appSettings.includeAllContent
  ? 'https://unsplash.com/filter?scope[featured]=0'
  : 'https://unsplash.com/filter?scope[featured]=1';

const retrievePageLimit = async () => {
  try {
    const response = await fetch(contentSource, { headers: reqHeaders });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const htmlBody = await response.text();
    const $ = parseHtml(htmlBody);
    
    let maxPage = 0;
    $('.pagination a').each((idx, el) => {
      const linkText = $(el).text();
      const pageNum = parseInt(linkText, 10);
      if (!isNaN(pageNum) && pageNum > maxPage) {
        maxPage = pageNum;
      }
    });
    return maxPage;
  } catch (error) {
    console.error('Failed to retrieve page count:', error);
    throw error;
  }
};

const findExistingEntry = (candidateRecord) => {
  const matches = imageRecords.filter(rec => rec.contentUrl === candidateRecord.contentUrl);
  return matches.length > 0 ? matches[0] : null;
};

const cleanString = (inputStr) => inputStr.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

const extractContentDetails = async (pageNumber) => {
  const pageUrl = `${contentSource}&page=${pageNumber}`;
  const extractedDetails = [];

  try {
    const response = await fetch(pageUrl, { headers: reqHeaders });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const htmlBody = await response.text();
    const $ = parseHtml(htmlBody);

    $('.photo-container').each((idx, el) => {
      const container = $(el);
      const downloadPath = container.find('.photo a').attr('href');
      
      if (!downloadPath) {
          console.warn('Skipping photo-container due to missing download path.');
          return;
      }

      const postSource = `https://unsplash.com${downloadPath.replace('/download', '')}`;
      let detailEntry = {
        postSourceUrl: postSource,
        contentUrl: `https://unsplash.com${downloadPath}`,
        uniqueId: downloadPath.replace('/photos/', '').replace('/download', '')
      };

      container.find('.epsilon a').each((aIdx, aEl) => {
        const linkElem = $(aEl);
        const linkText = linkElem.text();
        const linkRef = linkElem.attr('href');

        if (linkText === 'Download') {
          detailEntry.contentUrl = detailEntry.contentUrl || linkRef;
        } else {
          detailEntry.creatorProfileUrl = `https://unsplash.com${linkRef}`;
          detailEntry.creatorName = linkText;
        }
      });

      if (!detailEntry.creatorName) {
        const creatorText = container.find('.epsilon p').text().split('/')[1];
        detailEntry.creatorName = creatorText ? cleanString(creatorText.replace('By', '')) : 'Anonymous';
      }

      if (!detailEntry.contentUrl) {
        console.error(`Could not find content URL for ${postSource}`);
      } else {
        const existing = findExistingEntry(detailEntry);

        if (existing) {
          if (existing.postSourceUrl !== detailEntry.postSourceUrl ||
              existing.creatorName !== detailEntry.creatorName ||
              existing.creatorProfileUrl !== detailEntry.creatorProfileUrl) {
            recordSetModified = true;
            const existingIndex = imageRecords.findIndex(rec => rec.contentUrl === existing.contentUrl);
            if (existingIndex !== -1) {
              imageRecords[existingIndex].postSourceUrl = detailEntry.postSourceUrl;
              imageRecords[existingIndex].creatorName = detailEntry.creatorName;
              imageRecords[existingIndex].creatorProfileUrl = detailEntry.creatorProfileUrl;
            }
          }
        } else {
          extractedDetails.push(detailEntry);
        }
      }
    });
    return extractedDetails;
  } catch (error) {
    console.error(`Failed to extract content details for page ${pageNumber}:`, error);
    throw error;
  }
};

const acquireContentAndDownload = async () => {
  const totalPages = await retrievePageLimit();
  console.log(`Found ${totalPages} pages of content.`);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const allPageDetails = await runLimitedConcurrency(pageNumbers, appSettings.parallelOperations, extractContentDetails);
  
  let newContentCandidates = allPageDetails.flat();

  if (newContentCandidates.length === 0) {
    console.log('No new content found to acquire!');
    if (appSettings.verifyDeletions) {
      await auditContentIntegrity();
    } else if (recordSetModified) {
      await finalizeOperations(false);
    }
    return;
  }

  let nextAvailableId = imageRecords.length > 0 ? Math.max(...imageRecords.map(r => r.sequence)) + 1 : 0;
  const contentForAcquisition = await processItemsSequentially(newContentCandidates, async (item) => {
    item.sequence = nextAvailableId++;
    return item;
  });

  await executeContentAcquisition(contentForAcquisition);
};

const fetchSingleContent = async (itemRecord) => {
  const fileName = `${String(itemRecord.sequence).padStart(4, '0')}_${itemRecord.uniqueId}.jpeg`;
  itemRecord.localFilename = fileName;
  const filePath = `${appSettings.destinationDirectory}/${fileName}`;
  
  try {
    const response = await fetch(itemRecord.contentUrl, { headers: reqHeaders });
    if (!response.ok) {
      throw new Error(`Failed to download ${itemRecord.contentUrl}: ${response.statusText}`);
    }
    const fileStream = fileSys.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    return itemRecord;
  } catch (error) {
    console.error(`Error downloading content ${itemRecord.contentUrl}:`, error);
    return null;
  }
};

const executeContentAcquisition = async (itemsToProcess) => {
  console.log(`Starting acquisition of ${itemsToProcess.length} new content items.`);
  let processedCount = 0;

  const downloadPromises = [];
  const results = [];

  for (const item of itemsToProcess) {
    const promise = (async () => {
      console.log(`Acquiring item ${++processedCount} of ${itemsToProcess.length} (${item.postSourceUrl})`);
      const downloadedItem = await fetchSingleContent(item);
      if (downloadedItem) {
        results.push(downloadedItem);
      }
    })();
    downloadPromises.push(promise);

    if (downloadPromises.length >= appSettings.parallelOperations) {
      await Promise.race(downloadPromises.map(p => p.catch(() => {})));
      const settled = await Promise.allSettled(downloadPromises);
      for (let i = downloadPromises.length - 1; i >= 0; i--) {
        if (settled[i].status !== 'pending') {
          downloadPromises.splice(i, 1);
        }
      }
    }
  }
  await Promise.all(downloadPromises);

  imageRecords.push(...results);
  recordSetModified = true;

  imageRecords.sort((a, b) => a.sequence - b.sequence);
  console.log('Content acquisition complete!');

  if (appSettings.verifyDeletions) {
    await auditContentIntegrity(true);
  } else {
    await finalizeOperations(true);
  }
};

const auditContentIntegrity = async (didAcquireNew = false) => {
  console.log('Initiating content integrity audit for deleted items!');
  const removedContent = [];

  await runLimitedConcurrency(imageRecords, appSettings.parallelOperations, async (record) => {
    if (record.isDeleted) {
      return;
    }

    try {
      const response = await fetch(record.contentUrl, { method: 'HEAD', headers: reqHeaders });
      if (response.status === 404) {
        console.log(`Content ${record.contentUrl} appears to be deleted!`);
        removedContent.push(record);

        const localPath = `${appSettings.destinationDirectory}/${record.localFilename}`;
        try {
          await fileSys.unlink(localPath);
          console.log(`Removed local file: ${localPath}`);
        } catch (unlinkError) {
          console.error(`Error removing local file ${localPath}:`, unlinkError);
        }
      }
    } catch (error) {
      console.error(`Error checking content ${record.contentUrl}:`, error);
    }
  });

  removedContent.forEach(item => {
    const index = imageRecords.indexOf(item);
    if (index !== -1) {
      imageRecords[index] = { sequence: item.sequence, isDeleted: true };
      recordSetModified = true;
    }
  });

  if (removedContent.length > 0 || recordSetModified || didAcquireNew) {
    await finalizeOperations(didAcquireNew);
  }
};

const finalizeOperations = async (didAcquireNew) => {
  const recordFilePath = `${appSettings.destinationDirectory}/records.json`;
  try {
    await fileSys.writeFile(recordFilePath, JSON.stringify(imageRecords, null, 2), 'utf8');
    console.log('Content records updated successfully.');
  } catch (error) {
    console.error('Error writing content records:', error);
    return;
  }

  if (appSettings.createArchive) {
    console.log(`Creating content archive: ${appSettings.createArchive}`);
    try {
      await fileSys.unlink(appSettings.createArchive).catch(() => {});

      const outputStream = fileSys.createWriteStream(appSettings.createArchive);
      const contentZipper = archiver('zip', { zlib: { level: 9 } });

      outputStream.on('close', async () => {
        console.log(`Archive creation complete, total size: ${formatBytes(contentZipper.pointer())}`);
        await performRepositoryUpdate();
        if (!appSettings.shouldPushToRepo) {
          await executePostProcessing();
        }
      });

      contentZipper.on('error', (err) => {
        console.error('Error during archive creation:', err);
        throw err;
      });

      contentZipper.pipe(outputStream);
      contentZipper.directory(appSettings.destinationDirectory, false);
      await contentZipper.finalize();
    } catch (error) {
      console.error('Failed to create archive:', error);
    }
  } else {
    await performRepositoryUpdate();
    if (!appSettings.shouldPushToRepo) {
      await executePostProcessing();
    }
  }
};

const performRepositoryUpdate = async () => {
  if (appSettings.shouldPushToRepo) {
    console.log('Initiating repository update!');
    try {
      const gitCommands = [
        `cd ${appSettings.destinationDirectory}`,
        'git add -A .',
        `git commit -m "Update visual assets - ${new Date().toLocaleDateString()}"`,
        'git push origin master'
      ].join(' && ');
      const { stdout, stderr } = await runCommand(gitCommands);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('Error during repository update:', error);
    } finally {
      await executePostProcessing();
    }
  }
};

const executePostProcessing = async () => {
  if (appSettings.postCompletionCommand) {
    console.log('Executing post-completion command...');
    try {
      const { stdout, stderr } = await runCommand(appSettings.postCompletionCommand);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error('Error executing post-completion command:', error);
    }
  }
};

initiateProcess().catch(error => {
  console.error('An unhandled error occurred during the process:', error);
  process.exit(1);
});