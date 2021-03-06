'use strict'

const { decodeHTML } = require('./index')

const logger = require('../logger')
const crypto = require('crypto')

const request = require('superagent')

let validContents = []

/**
 * Populates the `validContents` array with contents that can be rewarded
 */
module.exports.populateValidContents = async () => {
  if (!process.env.GROWTH_SERVER_URL) {
    logger.error(
      'GROWTH_SERVER_URL environmental vairable missing: Coould break social rewards'
    )
    return
  }

  const query = `{
    campaign(id:"active") {
      id
      startDate
      endDate
      status
      actions {
        type
        ... on SocialShareAction {
          content {
            post {
              tweet {
                default
                translations {
                  text
                }
              }
            }
            link
          }
        }
      }
    }
  }`

  try {
    const response = await request
      .post(process.env.GROWTH_SERVER_URL)
      .send({
        query
      })
      .set({
        'Content-Type': 'application/json',
        Accept: 'application/json'
      })

    if (!response.body.data) {
      throw new Error(response.body)
    }

    const { campaign } = response.body.data

    if (!campaign) {
      throw new Error('No active campaign found')
    }

    validContents = campaign.actions
      .filter(action => !!action.content)
      .map(action => action.content)

    logger.debug('Populated valid contents', validContents)
  } catch (err) {
    logger.error('Failed to populate valid contents', err)
  }
}

/**
 * @returns user profile data from the event
 */
module.exports.getUserProfileFromEvent = ({ event, socialNetwork, type }) => {
  switch (socialNetwork) {
    case 'TWITTER':
      return type === 'FOLLOW' ? event.target : event.user

    case 'TELEGRAM':
      return event
  }

  // TODO: As of now, only twitter and telegram are supported
  logger.error(`Trying to parse event of unknown network: ${socialNetwork}`)
  return null
}

/**
 * Returns the untranslated text content, for the given one
 */
module.exports.getUntranslatedContent = translatedContent => {
  if (process.env.NODE_ENV === 'test') {
    return translatedContent
  }

  const defaultTextMatch = validContents.find(
    content => content.post.tweet.default.trim() === translatedContent.trim()
  )

  if (defaultTextMatch) {
    // The given text is already untranslated
    return translatedContent
  }

  const contentObj = validContents.find(content => {
    // Check if it is translated text
    const translation = content.post.tweet.translations.find(
      content => content.text.trim() === translatedContent.trim()
    )

    if (translation) {
      return true
    }

    return false
  })

  return contentObj ? contentObj.post.tweet.default.trim() : translatedContent
}

/**
 * Resolves shortened URLs and returns the tweet content for `SHARE` type
 * @returns the content from the event
 */
const getEventContent = ({ type, event }) => {
  if (type !== 'SHARE') {
    return null
  }

  // Note: `event.text` is truncated to 140chars, use `event.extended_tweet.full_text`, if it exists, to get whole tweet content
  // Clone to avoid mutation
  let encodedContent =
    '' + (event.extended_tweet ? event.extended_tweet.full_text : event.text)

  logger.debug('content from network:', encodedContent)

  // IMPORTANT: Twitter shortens and replaces URLs
  // we have revert that back to get the original content and to get the hash
  // IMPORTANT: Twitter prepends 'http://' if it idenitifies a text as URL
  // It may result in a different content than expected, So always prepend URLs with `http://` in rule configs.
  const entities = (event.extended_tweet || event).entities
  entities.urls.forEach(entity => {
    encodedContent = encodedContent.replace(entity.url, entity.expanded_url)
  })

  // Invalid if tweet content is not same as expected
  // Note: Twitter sends HTML encoded contents
  const decodedContent = decodeHTML(encodedContent)

  logger.debug('resolved content:', decodedContent)

  return decodedContent
}
module.exports.getEventContent = getEventContent

/**
 * Checks if the event is of content that can be rewarded
 * @param {Object} args.event
 * @returns true if valid and can be rewarded, false otherwise
 */
module.exports.validateShareableContent = ({ event, type }) => {
  let sharedContent = getEventContent({ event, type })

  if (!sharedContent) {
    return false
  }

  if (process.env.NODE_ENV === 'test') {
    return true
  }

  sharedContent = sharedContent.trim()

  const entities = (event.extended_tweet || event).entities
  const expandedUrls = entities.urls.map(entityUrl => entityUrl.expanded_url)

  logger.debug('Links in tweet', expandedUrls)

  return expandedUrls.some(contentLink => {
    // Find all content that has the link
    const content = validContents.find(
      content => content.link.toLowerCase() === contentLink.toLowerCase()
    )

    if (!content) {
      // No rewardable content has that link
      logger.debug('No rewardable content has the link', contentLink)
      return false
    }

    logger.debug('Content with matching link', content)

    if (content.post.tweet.default.trim() === sharedContent) {
      // User has shared the untranslated text
      return true
    }

    logger.debug(
      'Could be a translated version of tweet',
      content.post.tweet.default
    )

    // Check if it is translated text
    const translation = content.post.tweet.translations.find(
      content => content.text.trim() === sharedContent
    )

    if (translation) {
      logger.debug('Matching translation', translation)
    } else {
      logger.debug('Just a random tweet with the link, drop this event')
    }

    return translation ? true : false
  })
}

/**
 * Hashes content for verification of the user's post.
 *
 * Important: Make sure to keep this hash function in sync with
 * the one used in the growth engine rules.
 * See infra/growth/resources/rules.js
 *
 * @param text
 * @returns {String} Hash of the text, hexadecimal encoded.
 * @private
 */
module.exports.hashContent = text => {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex')
}
