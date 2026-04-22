const flowControl = require('async')
const cliHandler = require('commander')
const domProcessor = require('cheerio')
const webFetcher = require('request')
const fileSystem = require('fs')
const processExecutor = require('child_process').exec
const humanReadableSize = require('prettysize')
const archiveManager = require('archiver')
const packageData = require('./package.json')
const pathUtil = require('path')

let configurationMissing = false

let metaDataModified = false

try {
  let appSettings = require('./config')
  
  if (!appSettings.parallel_downloads || !appSettings.output_folder || !appSettings.git_sync || !appSettings.fetch_all) {
    configurationMissing = true
  }
} catch (issue) {
  let appSettings = {}
  configurationMissing = true
}

const requestHeaders = {
  'User-Agent': 'Image-Acquisition-Tool'
}

if (configurationMissing) {
  cliHandler
    .appVersion(packageData.version)
    .addOption('-c, --parallel_downloads <quantity>', 'Number of simultaneous asset transfers permitted', 5)
    .addOption('-f, --output_folder <directory>', 'Destination directory for acquired images', 'photos')
    .addOption('-g, --git_sync', 'Automatically commit and push to Git repository in the output folder path')
    .addOption('-a, --fetch_all', 'Acquire all images from the front page instead of only featured ones')
    .addOption('-C, --check_for_removed', 'Verify if an image has been removed/re-added, and refresh its metadata.')
    .parseArguments(process.argv)
}

const parallelDownloads = !appSettings.parallel_downloads ? cliHandler.parallel_downloads : appSettings.parallel_downloads
const outputDirectory = !appSettings.output_folder ? cliHandler.output_folder : appSettings.output_folder
const gitSync = !appSettings.git_sync ? cliHandler.git_sync : appSettings.git_sync
const fetchAll = !appSettings.fetch_all ? cliHandler.fetch_all : appSettings.fetch_all
const checkForRemoved = !appSettings.check_for_removed ? cliHandler.check_for_removed : appSettings.check_for_removed

if (!parallelDownloads || !outputDirectory) {
  cliHandler.displayHelp()
}

let imageRecords;
try {
  imageRecords = require(pathUtil.join(outputDirectory, 'records.json'))
} catch (issue) {
  imageRecords = []
}

const initPageScanAndDownload = function () {
  retrievePageCount(function (totalCount) {
    flowControl.times(totalCount, function (pageNumber, proceed) {
      fetchImageDetails(pageNumber + 1, function (issue, details) {
        proceed(issue, details)
      })
    }, function (issue, details) {
      let assetsToAcquire = []
      
      details.forEach(function (detailList) {
        assetsToAcquire = assetsToAcquire.concat(detailList)
      })
      
      prepareForAssetAcquisition(assetsToAcquire)
    })
  })
}

const baseUrl = fetchAll ? 'https://unsplash.com/filter?scope[featured]=0' : 'https://unsplash.com/filter?scope[featured]=1'

const retrievePageCount = function (completion) {
  let maxPageNum = 0
  webFetcher(baseUrl, function (issue, responseObj, htmlBody) {
    if (!issue && responseObj.statusCode === 200) {
      const domElements = domProcessor.load(htmlBody)
      domElements('.pagination a').each(function (idx, item) {
        const linkContent = domElements(this).text()
        
        if (!Number.isNaN(Number.parseInt(linkContent)) && (Number.parseInt(linkContent) > maxPageNum)) {
          maxPageNum = Number.parseInt(linkContent)
        }
      })
      completion(maxPageNum)
    }
  })
}

const isAssetDuplicated = function (assetDetails) {
  const existingAssets = imageRecords.filter(function (asset) {
    return asset.image_link === assetDetails.image_link
  })

  if (existingAssets.length) {
    return existingAssets[0]
  }

  return false
}

const fetchImageDetails = function (pageNumber, completion) {
  let collectedDetails = []
  
  webFetcher(baseUrl + '&page=' + pageNumber, function (issue, resObj, htmlContent) {
    if (!issue && resObj.statusCode === 200) {
      const domElements = domProcessor.load(htmlContent)
      
      domElements('.photo-container').each(function (idx, item) {
        const resourcePath = domElements(this).find('.photo a').attr('href')
        const postPath = 'https://unsplash.com' + resourcePath.replace('/download', '')
        const assetData = {
          'source_post_link': postPath,
          'image_link': 'https://unsplash.com' + resourcePath,
          'unique_id': resourcePath.replace('/photos/', '').replace('/download', '')
        }

        domElements(this).find('.epsilon a').each(function (idx, item) {
          const anchorTxt = domElements(this).text()
          const targetUrl = domElements(this).attr('href')
          
          if (anchorTxt === 'Download') {
            assetData.image_link = assetData.image_link || targetUrl
          } else {
            assetData.creator_profile_link = 'https://unsplash.com' + targetUrl
            assetData.creator_name = anchorTxt
          }
        })

        if (!assetData.creator_name) {
          const creatorText = domElements(this).find('.epsilon p').text().split('/')[1]
          assetData.creator_name = creatorText ? trimWhitespace(creatorText.replace('By', '')) : 'Unknown'
        }
        if (!assetData.image_link) {
          console.warn('Unable to locate asset URL for ' + postPath)
        } else {
          const itemFound = isAssetDuplicated(assetData)

          if (itemFound) {
            const currentAssetRecord = imageRecords[imageRecords.indexOf(itemFound)]

            if (currentAssetRecord.source_post_link !== assetData.source_post_link || currentAssetRecord.creator_name !== assetData.creator_name || currentAssetRecord.creator_profile_link !== assetData.creator_profile_link) {
              metaDataModified = true

              imageRecords[imageRecords.indexOf(itemFound)].source_post_link = assetData.source_post_link
              imageRecords[imageRecords.indexOf(itemFound)].creator_name = assetData.creator_name
              imageRecords[imageRecords.indexOf(itemFound)].creator_profile_link = assetData.creator_profile_link
            }
          } else {
            collectedDetails.push(assetData)
          }
        }
      })

      completion(null, collectedDetails)
    } else {
      console.error('Failed to retrieve asset details for page %s', pageNumber)
      completion(true)
    }
  })
}

const trimWhitespace = function (inputString) {
  return inputString.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
}

const prepareForAssetAcquisition = function (assetsToAcquire) {
    let nextRecordIdentifier = imageRecords.length

    if (!assetsToAcquire.length) {
      console.info('No new assets to download!')
 
      if (checkForRemoved) {
        identifyRemovedAssets()
      } else {
        if (metaDataModified) {
          executePostDownloadActions()
        }
      }

      return
    }

    assetsToAcquire.reverse()

    flowControl.mapSeries(assetsToAcquire, function (asset, proceed) {
      asset.record_id = nextRecordIdentifier++
      proceed(null, asset)
    }, function (issue, assetsWithIdentifiers) {
      beginAssetAcquisition(assetsWithIdentifiers)
    })
}

const beginAssetAcquisition = function (assetsToAcquire) {
  let currentAssetIndex = 0
  flowControl.eachLimit(assetsToAcquire, parallelDownloads, function (assetToFetch, proceed) {
    console.info('Acquiring asset ' + (currentAssetIndex++ + 1) + ' of ' + assetsToAcquire.length + ' (' + assetToFetch.source_post_link + ')')

    fetchSingleImage(assetToFetch, function (acquiredDetails) {
      imageRecords.push(acquiredDetails)
      proceed()
    })
  }, function (issue) {
    console.info('Asset acquisition complete!')

    imageRecords.sort(function (itemA, itemB) { 
      return itemA.record_id - itemB.record_id
    })

    if (checkForRemoved) {
      identifyRemovedAssets(true)
    } else {
      executePostDownloadActions()
    }
  })
}

const identifyRemovedAssets = function (downloadsCompleted) {
  console.info('Scanning for assets that have been removed!')

  let removedAssets = []

  flowControl.eachLimit(imageRecords, parallelDownloads, function (asset, proceed) {
    if (asset.is_removed) {
      return proceed()
    }

    webFetcher.head({ url: asset.image_link, headers: requestHeaders }, function (problem, resObject, content) {
      if (resObject && resObject.statusCode === 404) {
        console.warn('Asset %s appears to have been removed!', asset.image_link)
        removedAssets.push(asset)

        const localFilePath = pathUtil.resolve(outputDirectory, asset.file_name)

        fileSystem.unlink(localFilePath, function (issue) {
          if (issue) { 
            console.error('Problem deleting file %s!', localFilePath)
          }

          proceed()
        })
      } else {
        proceed()
      }
    })
  }, function (issue) {
    removedAssets.forEach(function (asset) {
      imageRecords[imageRecords.indexOf(asset)] = { record_id: asset.record_id, is_removed: true }
    })

    if (removedAssets.length || metaDataModified || downloadsCompleted) {
      executePostDownloadActions()
    }
  })
}

const executePostDownloadActions = function () {
  fileSystem.writeFile(pathUtil.resolve(outputDirectory, 'records.json'), JSON.stringify(imageRecords, null, 4), 'utf8', function (issue) {
    if (issue) {
      console.error('Failed to write record data!')
      return console.error(issue)
    }

    if (appSettings.create_archive) {
      console.info('Generating archive file')
      
      fileSystem.unlink(appSettings.create_archive, function (issue) {
        const assetArchive = archiveManager('zip')
        const outputStream = fileSystem.createWriteStream(appSettings.create_archive)

        outputStream.on('finish', function () {
          console.info('Archive creation complete, total size: %s bytes', humanReadableSize(assetArchive.pointer()))
          
          performGitOperations()
          
          if (!gitSync) {
            executePostProcessCmd()
          }
        })

        assetArchive.on('error', function (issue) {
          console.error('Problem creating archive: ')
          throw issue
        })

        assetArchive.pipe(outputStream)

        assetArchive.bulk([
          { expand: true, cwd: outputDirectory, src: ['*.jpeg', 'records.json'] }
        ])

        assetArchive.finalize()
      })
    } else {
      performGitOperations()

      if (!gitSync) {
        executePostProcessCmd()
      }
    }
  })
}

const fetchSingleImage = function (assetData, completion) {
  const localFileName = String('0000' + assetData.record_id).slice(-4) + '_' + assetData.unique_id + '.jpeg'
  assetData.file_name = localFileName
  const fileWriter = fileSystem.createWriteStream(pathUtil.resolve(outputDirectory, localFileName))
 
  fileWriter.on('finish', function () {
    fileWriter.close(function () {
      completion(assetData)
    })
  })

  webFetcher.get({ url: assetData.image_link, headers: requestHeaders }).pipe(fileWriter)
}

const performGitOperations = function () {
  if (gitSync) {
    console.info('Initiating Git synchronization!')
    processExecutor('cd ' + outputDirectory + ' && git add -A . && git commit -am \'Asset Refresh - ' + new Date().toLocaleDateString() + '\' && git push origin master', function (issue, stdOut, stdErr) {
      console.info(stdOut)
      executePostProcessCmd()
    })
  }
}

const executePostProcessCmd = function () {    
  if (appSettings.after_process_command) {
    console.info('Executing post-processing command')
    processExecutor(appSettings.after_process_command, function (issue, stdOut, stdErr) {
      console.info(stdOut)
    })
  }
}

fileSystem.mkdir(outputDirectory, { recursive: true }, function (issue) {
  initPageScanAndDownload()
})