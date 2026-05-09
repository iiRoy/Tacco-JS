/*
 * This script is designed to retrieve and manage a collection of images from Unsplash.
 * It supports downloading new images, updating metadata for existing ones, and cleaning up
 * records for images that are no longer available.
 *
 * Key features:
 * - Configurable via a local `config.js` file or command-line arguments.
 * - Downloads images concurrently.
 * - Stores image metadata in a JSON file.
 * - Can check for deleted images and remove them locally.
 * - Optional Git integration for committing and pushing changes to a repository.
 * - Optional ZIP archive creation for all downloaded assets.
 * - Supports custom post-processing commands.
 */

const asyncTasks = require('async') // Utility for managing asynchronous operations
const cliOptions = require('commander') // Command-line interface parser
const htmlParser = require('cheerio') // HTML parsing and DOM manipulation
const httpAgent = require('request') // HTTP client for making requests
const fileSystem = require('fs') // Node.js file system module
const shellCommands = require('child_process').exec // Execute shell commands
const fileSizeFormatter = require('prettysize') // Format file sizes into human-readable strings
const archiveBuilder = require('archiver') // Create ZIP archives
const projectInfo = require('./package.json') // Project package information
const pathResolver = require('path') // Utility for working with file and directory paths

let configLoadError = false // Flag indicating if configuration loading encountered issues
let metadataModifiedFlag = false // Flag indicating if any image metadata was updated

// Attempt to load application configuration from a dedicated file
let applicationSettings = {} // Default empty settings object
try {
  const loadedConfig = require('./config') // Try to load configuration from file
  Object.assign(applicationSettings, loadedConfig) // Merge loaded config with default settings

  // Validate essential configuration properties
  if (!applicationSettings.max_concurrent_operations || !applicationSettings.storage_path || !applicationSettings.git_enable || !applicationSettings.fetch_all_content) {
    configLoadError = true // Mark config as incomplete if crucial settings are missing
  }
} catch (error) {
  // If config file is not found or has errors, proceed with command-line defaults
  configLoadError = true
  console.info('Configuration file (config.js) not found or invalid. Relying on CLI arguments and defaults.')
}

// HTTP request headers to mimic a browser
const requestHeaders = {
  'User-Agent': 'Unsplash-Asset-Manager/1.0 (Node.js)'
}

// If configuration wasn't loaded or was incomplete, parse command-line arguments
if (configLoadError) {
  cliOptions
    .version(projectInfo.version) // Display application version
    .option('-c, --max_concurrent_operations <number>', 'Maximum number of simultaneous downloads', parseInt, 5)
    .option('-p, --storage_path <directory>', 'Local directory to save downloaded assets', 'unsplash_assets')
    .option('-g, --git_enable', 'Enable automatic Git commit and push to the asset storage directory')
    .option('-a, --fetch_all_content', 'Download all images from the front page, including non-featured ones')
    .option('-d, --scan_for_missing_assets', 'Check for previously downloaded images that may have been deleted/re-added on Unsplash, and update records.')
    .option('-z, --archive_output <filename>', 'Specify a filename to create a ZIP archive of all assets and metadata.')
    .option('-x, --post_process_command <command>', 'A shell command to execute after all operations are complete.')
    .parse(process.argv)

  // Merge CLI options into application settings, prioritizing CLI if explicit
  applicationSettings.max_concurrent_operations = applicationSettings.max_concurrent_operations || cliOptions.max_concurrent_operations
  applicationSettings.storage_path = applicationSettings.storage_path || cliOptions.storage_path
  applicationSettings.git_enable = applicationSettings.git_enable || cliOptions.git_enable
  applicationSettings.fetch_all_content = applicationSettings.fetch_all_content || cliOptions.fetch_all_content
  applicationSettings.scan_for_missing_assets = applicationSettings.scan_for_missing_assets || cliOptions.scan_for_missing_assets
  applicationSettings.archive_output = applicationSettings.archive_output || cliOptions.archive_output
  applicationSettings.post_process_command = applicationSettings.post_process_command || cliOptions.post_process_command
}

// Ensure critical parameters are set, otherwise display help and exit
if (!applicationSettings.max_concurrent_operations || !applicationSettings.storage_path) {
  console.error('Error: Required settings for concurrent operations or storage path are missing.')
  cliOptions.help() // Display CLI help message
  process.exit(1) // Exit with an error code
}

// Initialize asset records (metadata)
let assetRecords = []
const metadataFilePath = pathResolver.join(applicationSettings.storage_path, 'metadata.json')
try {
  assetRecords = require(metadataFilePath) // Load existing metadata
  console.log(`Loaded ${assetRecords.length} existing asset records from "${metadataFilePath}".`)
} catch (loadError) {
  console.warn(`No existing metadata file found at "${metadataFilePath}". Starting with an empty record set.`)
}

/**
 * Initiates the entire image retrieval and download process.
 * This is the main orchestration function.
 */
const startAssetWorkflow = function () {
  console.log('\n--- Starting Unsplash Asset Acquisition Workflow ---')
  determineTotalPages(function (pageCount) {
    console.log(`Discovered ${pageCount} pages of images to process.`)
    const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1) // Generate array [1, 2, ..., pageCount]

    asyncTasks.map(pageNumbers, function (currentPageNumber, pageProcessingDone) {
      extractImageDetailsFromPage(currentPageNumber, function (extractError, pageAssetDetails) {
        if (extractError) {
          console.error(`Failed to retrieve details from page ${currentPageNumber}:`, extractError.message)
          return pageProcessingDone(extractError)
        }
        pageProcessingDone(null, pageAssetDetails)
      })
    }, function (overallError, allExtractedAssetDetails) {
      if (overallError) {
        console.error('An error occurred during page information extraction:', overallError.message)
        return finalizeOperations(false, false) // Exit gracefully if page info fails
      }

      // Flatten the array of arrays into a single list of assets
      let newAssetsToProcess = []
      allExtractedAssetDetails.forEach(pageList => {
        newAssetsToProcess = newAssetsToProcess.concat(pageList)
      })

      prepareAssetsForDownload(newAssetsToProcess)
    })
  })
}

// Base URL for Unsplash content, depending on whether all images or only featured ones are requested
const unsplashBaseUrl = applicationSettings.fetch_all_content
  ? 'https://unsplash.com/filter?scope[featured]=0'
  : 'https://unsplash.com/filter?scope[featured]=1'

/**
 * Determines the total number of pages available for image scraping.
 * @param {Function} completionCallback - Callback function to receive the page count.
 */
const determineTotalPages = function (completionCallback) {
  let highestIdentifiedPage = 0
  console.log(`Fetching page count from: ${unsplashBaseUrl}`)
  httpAgent(unsplashBaseUrl, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      console.error(`Error fetching page count: ${err ? err.message : `HTTP Status ${response.statusCode}`}`)
      return completionCallback(0) // Return 0 pages on error
    }

    const $ = htmlParser.load(body)
    $('.pagination a').each(function () {
      const linkLabel = $(this).text().trim()
      const pageNumber = Number.parseInt(linkLabel, 10)

      if (!Number.isNaN(pageNumber) && pageNumber > highestIdentifiedPage) {
        highestIdentifiedPage = pageNumber
      }
    })
    completionCallback(highestIdentifiedPage)
  })
}

/**
 * Checks if an asset with the given image URL already exists in our records.
 * @param {Object} currentAssetData - The metadata of the asset to check.
 * @returns {Object|boolean} The existing asset record if found, otherwise false.
 */
const findExistingAssetRecord = function (currentAssetData) {
  if (!assetRecords || assetRecords.length === 0) {
    return false
  }
  // Find the first asset that matches the image URL
  const matchingAsset = assetRecords.find(record => record.image_url === currentAssetData.image_url)
  return matchingAsset || false
}

/**
 * Extracts image details from a specific Unsplash page.
 * @param {number} pageNumber - The page number to scrape.
 * @param {Function} completionCallback - Callback function (error, assetDetailsArray).
 */
const extractImageDetailsFromPage = function (pageNumber, completionCallback) {
  const assetsFoundOnPage = []
  const pageUrl = `${unsplashBaseUrl}&page=${pageNumber}`
  console.log(`Processing page ${pageNumber} from ${pageUrl}`)

  httpAgent(pageUrl, { headers: requestHeaders }, function (err, response, body) {
    if (err || response.statusCode !== 200) {
      console.error(`Failed to get content for page ${pageNumber}: ${err ? err.message : `HTTP Status ${response.statusCode}`}`)
      return completionCallback(new Error(`Network error for page ${pageNumber}`))
    }

    const $ = htmlParser.load(body)
    const photoContainers = $('.photo-container')

    if (photoContainers.length === 0) {
      console.warn(`No photo containers found on page ${pageNumber}.`)
      return completionCallback(null, [])
    }

    photoContainers.each(function () {
      const containerElement = $(this)
      const downloadLinkElement = containerElement.find('.photo a')
      const relativeDownloadUrl = downloadLinkElement.attr('href')

      if (!relativeDownloadUrl) {
        console.warn('Could not find download link for a photo container on page', pageNumber)
        return // Skip to next container
      }

      const fullImageUrl = 'https://unsplash.com' + relativeDownloadUrl
      const assetSourcePageUrl = fullImageUrl.replace('/download', '')
      const unsplashIdentifier = relativeDownloadUrl.replace('/photos/', '').replace('/download', '')

      let assetMetadataEntry = {
        'source_page_url': assetSourcePageUrl,
        'image_url': fullImageUrl,
        'unsplash_id': unsplashIdentifier,
        'author': 'Unknown',
        'author_profile_url': null
      }

      // Extract author information
      containerElement.find('.epsilon a').each(function () {
        const linkText = $(this).text().trim()
        const linkHref = $(this).attr('href')

        if (linkText === 'Download') {
          // This case is usually for the direct download link, which we already have
          // but if the initial .photo a didn't yield it, this could be a fallback.
          assetMetadataEntry.image_url = assetMetadataEntry.image_url || 'https://unsplash.com' + linkHref
        } else {
          assetMetadataEntry.author_profile_url = 'https://unsplash.com' + linkHref
          assetMetadataEntry.author = linkText
        }
      })

      // Fallback for author name if not found in epsilon a
      if (!assetMetadataEntry.author || assetMetadataEntry.author === 'Unknown') {
        const authorParagraphText = containerElement.find('.epsilon p').text()
        const authorMatch = authorParagraphText.match(/By\s*(.+)/i)
        if (authorMatch && authorMatch[1]) {
          assetMetadataEntry.author = trimWhitespace(authorMatch[1].split('/')[0])
        }
      }

      if (!assetMetadataEntry.image_url) {
        console.warn(`Missing image download URL for asset on page ${pageNumber} (Source: ${assetSourcePageUrl}). Skipping.`)
        return // Skip this asset if no download URL is found
      }

      const existingRecord = findExistingAssetRecord(assetMetadataEntry)

      if (existingRecord) {
        // Check if existing metadata needs updating (e.g., author changed)
        const oldRecordIndex = assetRecords.indexOf(existingRecord)
        if (existingRecord.source_page_url !== assetMetadataEntry.source_page_url ||
            existingRecord.author !== assetMetadataEntry.author ||
            existingRecord.author_profile_url !== assetMetadataEntry.author_profile_url) {
          
          console.log(`Updating metadata for existing asset: ${existingRecord.unsplash_id}`)
          // Update the existing record in place
          assetRecords[oldRecordIndex].source_page_url = assetMetadataEntry.source_page_url
          assetRecords[oldRecordIndex].author = assetMetadataEntry.author
          assetRecords[oldRecordIndex].author_profile_url = assetMetadataEntry.author_profile_url
          metadataModifiedFlag = true
        }
      } else {
        assetsFoundOnPage.push(assetMetadataEntry) // Add new asset to list for download
      }
    })

    completionCallback(null, assetsFoundOnPage)
  })
}

/**
 * Removes leading/trailing whitespace from a string.
 * @param {string} inputString - The string to trim.
 * @returns {string} The trimmed string.
 */
const trimWhitespace = function (inputString) {
  return inputString.replace(/^\s+|\s+$/g, '')
}

/**
 * Prepares a list of new images for download by assigning unique IDs.
 * @param {Array<Object>} newAssetsForDownload - List of asset metadata objects.
 */
const prepareAssetsForDownload = function (newAssetsForDownload) {
  if (newAssetsForDownload.length === 0) {
    console.log('No new assets found to download.')
    if (applicationSettings.scan_for_missing_assets) {
      return verifyAssetAvailability()
    } else if (metadataModifiedFlag) {
      return finalizeOperations(false, false) // Only metadata changed, no downloads
    }
    return console.log('No operations needed. Exiting.')
  }

  // Assign unique IDs to new assets, starting from the next available ID
  let nextAssetId = assetRecords.length > 0 ? Math.max(...assetRecords.map(a => a.id || 0)) + 1 : 0
  if (nextAssetId === 0 && assetRecords.length === 0) {
    // If no existing records, start from 0. If records exist, nextId is already correct.
  } else if (nextAssetId === 0 && assetRecords.length > 0) {
    // Edge case: if all existing records have no ID, start from 0, but this shouldn't happen with the Math.max above.
    nextAssetId = 0
  }

  const assetsWithAssignedIds = newAssetsForDownload.map(asset => {
    // Ensure ID is unique and sequential
    asset.id = nextAssetId++
    return asset
  })

  // Reverse the order to download older images first (or just for a different order than original)
  assetsWithAssignedIds.reverse()

  executeAssetDownloads(assetsWithAssignedIds)
}

/**
 * Manages the concurrent download of a list of assets.
 * @param {Array<Object>} assetsToDownload - List of asset metadata objects to download.
 */
const executeAssetDownloads = function (assetsToDownload) {
  let downloadProgressCounter = 0
  console.log(`Initiating download of ${assetsToDownload.length} new assets with ${applicationSettings.max_concurrent_operations} concurrent connections.`)

  asyncTasks.eachLimit(assetsToDownload, applicationSettings.max_concurrent_operations, function (assetItem, downloadNext) {
    downloadProgressCounter++
    console.log(`Downloading asset ${downloadProgressCounter} of ${assetsToDownload.length}: ${assetItem.source_page_url}`)

    fetchSingleAsset(assetItem, function (downloadedAssetMetadata) {
      assetRecords.push(downloadedAssetMetadata) // Add the new asset to our main records
      downloadNext() // Proceed to the next download
    })
  }, function (allDownloadsCompleteError) {
    if (allDownloadsCompleteError) {
      console.error('An error occurred during asset downloads:', allDownloadsCompleteError.message)
    } else {
      console.log('All new asset downloads complete!')
    }

    // Sort all asset records by ID for consistency
    assetRecords.sort((a, b) => (a.id || 0) - (b.id || 0))

    if (applicationSettings.scan_for_missing_assets) {
      verifyAssetAvailability(true) // Check for deleted images after new downloads
    } else {
      finalizeOperations(true, false) // Proceed to final tasks
    }
  })
}

/**
 * Checks if previously downloaded images are still available on Unsplash.
 * Deletes local files and marks records as 'deleted' if they return a 404.
 * @param {boolean} downloadsWerePerformed - True if new images were downloaded in this run.
 */
const verifyAssetAvailability = function (downloadsWerePerformed = false) {
  console.log('Commencing check for deleted assets...')

  const removedAssets = []

  asyncTasks.eachLimit(assetRecords, applicationSettings.max_concurrent_operations, function (assetItem, checkNext) {
    if (assetItem.deleted) {
      // Skip assets already marked as deleted
      return checkNext()
    }

    httpAgent.head({ url: assetItem.image_url, headers: requestHeaders }, function (err, res) {
      if (err || (res && res.statusCode === 404)) {
        console.warn(`Asset ${assetItem.unsplash_id} (${assetItem.image_url}) appears to be deleted!`)
        removedAssets.push(assetItem)

        if (assetItem.filename) {
          const localFilePath = pathResolver.join(applicationSettings.storage_path, assetItem.filename)
          fileSystem.unlink(localFilePath, function (unlinkError) {
            if (unlinkError) {
              console.error(`Error deleting local file ${localFilePath}:`, unlinkError.message)
            } else {
              console.log(`Successfully removed local file: ${localFilePath}`)
            }
            checkNext() // Continue even if file deletion fails
          })
        } else {
          console.warn(`No filename recorded for deleted asset ${assetItem.unsplash_id}. Skipping local file deletion.`)
          checkNext()
        }
      } else {
        checkNext()
      }
    })
  }, function (allChecksCompleteError) {
    if (allChecksCompleteError) {
      console.error('An error occurred during asset availability checks:', allChecksCompleteError.message)
    }

    // Update metadata for removed assets
    removedAssets.forEach(asset => {
      const index = assetRecords.indexOf(asset)
      if (index > -1) {
        assetRecords[index] = { id: asset.id, unsplash_id: asset.unsplash_id, deleted: true, last_checked: new Date().toISOString() }
        metadataModifiedFlag = true
      }
    })

    // Proceed to final tasks if any changes occurred
    if (removedAssets.length > 0 || metadataModifiedFlag || downloadsWerePerformed) {
      finalizeOperations(downloadsWerePerformed, removedAssets.length > 0)
    } else {
      console.log('No changes detected after checking for deleted assets. Exiting.')
    }
  })
}

/**
 * Executes post-download tasks: writing metadata, creating ZIP, Git push, and custom commands.
 * @param {boolean} initialDownloadPerformed - True if new assets were downloaded.
 * @param {boolean} assetsWereRemoved - True if assets were marked as deleted.
 */
const finalizeOperations = function (initialDownloadPerformed, assetsWereRemoved) {
  // Only write metadata if there were actual changes or new downloads
  if (!metadataModifiedFlag && !initialDownloadPerformed && !assetsWereRemoved) {
    console.log('No changes to metadata or new downloads. Skipping metadata file write.')
    return performGitCommitAndPush(false) // Still check for git push if enabled, might have other reasons to push.
  }

  console.log(`Writing updated metadata to: ${metadataFilePath}`)
  fileSystem.writeFile(metadataFilePath, JSON.stringify(assetRecords, null, 2), 'utf8', function (writeError) {
    if (writeError) {
      console.error('Error writing metadata file:', writeError.message)
      return console.error(writeError)
    }
    console.log('Metadata file updated successfully.')

    if (applicationSettings.archive_output) {
      createAssetArchive(initialDownloadPerformed)
    } else {
      performGitCommitAndPush(initialDownloadPerformed || assetsWereRemoved || metadataModifiedFlag)
    }
  })
}

/**
 * Downloads a single image and updates its metadata with local file details.
 * @param {Object} assetMetadataEntry - Metadata object for the asset to download.
 * @param {Function} completionCallback - Callback function (updatedAssetMetadata).
 */
const fetchSingleAsset = function (assetMetadataEntry, completionCallback) {
  // Generate a unique filename using ID and Unsplash ID
  const paddedId = String(assetMetadataEntry.id).padStart(4, '0')
  const localFileName = `${paddedId}_${assetMetadataEntry.unsplash_id}.jpeg`
  assetMetadataEntry.filename = localFileName

  const targetFilePath = pathResolver.join(applicationSettings.storage_path, localFileName)
  const fileWriteStream = fileSystem.createWriteStream(targetFilePath)

  fileWriteStream.on('finish', function () {
    console.log(`Finished downloading: ${localFileName}`)
    fileWriteStream.close(() => completionCallback(assetMetadataEntry))
  })

  fileWriteStream.on('error', function (writeError) {
    console.error(`Error writing file ${localFileName}:`, writeError.message)
    // Mark this asset as failed or handle appropriately, then call callback
    assetMetadataEntry.download_error = writeError.message
    completionCallback(assetMetadataEntry)
  })

  httpAgent.get({ url: assetMetadataEntry.image_url, headers: requestHeaders })
    .on('error', function (requestError) {
      console.error(`Error requesting image ${assetMetadataEntry.image_url}:`, requestError.message)
      fileWriteStream.destroy(requestError) // Close and clean up the file stream
    })
    .pipe(fileWriteStream)
}

/**
 * Creates a ZIP archive of all downloaded assets and metadata.
 * @param {boolean} initialDownloadPerformed - True if new assets were downloaded.
 */
const createAssetArchive = function (initialDownloadPerformed) {
  const archivePath = pathResolver.resolve(applicationSettings.storage_path, applicationSettings.archive_output)
  console.log(`Initiating ZIP archive creation at: ${archivePath}`)

  // Ensure previous archive is removed before creating a new one
  fileSystem.unlink(archivePath, { force: true }, (unlinkErr) => {
    if (unlinkErr && unlinkErr.code !== 'ENOENT') {
      console.error(`Warning: Could not remove old archive file "${archivePath}":`, unlinkErr.message)
      // Continue anyway, archiver might overwrite or fail
    }

    const outputStream = fileSystem.createWriteStream(archivePath)
    const archive = archiveBuilder('zip', {
      zlib: { level: 9 } // Maximum compression
    })

    outputStream.on('close', function () {
      console.log(`Archive created successfully. Total size: ${fileSizeFormatter(archive.pointer())}`)
      performGitCommitAndPush(initialDownloadPerformed || true) // Force git push if archive created
    })

    archive.on('error', function (archiveError) {
      console.error('Error creating archive:', archiveError.message)
      throw archiveError
    })

    archive.pipe(outputStream)

    // Add all JPEG images and the metadata file to the archive
    archive.directory(applicationSettings.storage_path, false, {
      filter: (entry) => entry.name.endsWith('.jpeg') || entry.name === 'metadata.json'
    })

    archive.finalize()
  })
}

/**
 * Performs Git commit and push operations if enabled.
 * @param {boolean} changesOccurred - True if any files were downloaded, deleted, or metadata changed.
 */
const performGitCommitAndPush = function (changesOccurred) {
  if (applicationSettings.git_enable) {
    if (!changesOccurred) {
      console.log('Git integration enabled, but no changes detected. Skipping commit/push.')
      return executePostProcessingCommand()
    }
    console.log('Git integration enabled. Preparing to commit and push changes.')
    const commitMessage = `Automated Unsplash Asset Update - ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    const gitCommand = `cd ${pathResolver.resolve(applicationSettings.storage_path)} && git add -A . && git commit -m "${commitMessage}" && git push origin master`

    shellCommands(gitCommand, function (execError, stdout, stderr) {
      if (execError) {
        console.error('Git commit/push failed:', execError.message)
        console.error('Git stdout:', stdout)
        console.error('Git stderr:', stderr)
      } else {
        console.log('Git operations successful.')
        console.log(stdout)
      }
      executePostProcessingCommand() // Always run post command regardless of git success
    })
  } else {
    executePostProcessingCommand() // Run post command if git is not enabled
  }
}

/**
 * Executes a user-defined post-processing shell command.
 */
const executePostProcessingCommand = function () {
  if (applicationSettings.post_process_command) {
    console.log(`Executing post-processing command: "${applicationSettings.post_process_command}"`)
    shellCommands(applicationSettings.post_process_command, function (execError, stdout, stderr) {
      if (execError) {
        console.error('Post-processing command failed:', execError.message)
        console.error('Command stdout:', stdout)
        console.error('Command stderr:', stderr)
      } else {
        console.log('Post-processing command executed successfully.')
        console.log(stdout)
      }
      console.log('\n--- Unsplash Asset Acquisition Workflow Complete ---')
    })
  } else {
    console.log('\n--- Unsplash Asset Acquisition Workflow Complete ---')
  }
}

// Main execution block: Ensure the output directory exists before starting the workflow
fileSystem.mkdir(applicationSettings.storage_path, { recursive: true }, function (dirCreationError) {
  if (dirCreationError) {
    console.error(`Failed to create or access storage directory "${applicationSettings.storage_path}":`, dirCreationError.message)
    process.exit(1) // Exit if we can't ensure the directory exists
  }
  startAssetWorkflow() // Begin the process once the directory is ready
})