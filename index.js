const async = require('async');
const parseEvent = require('./lib/parseEvent');
const feed = require('./lib/feed');
const state = require('./lib/state');
const chatfuelTemplateItem = require('./lib/chatfuelTemplate/item');

// development only
process.env.CONTENT_READ_THE_STORY = 'Read the story 🔗';
process.env.CONTENT_NEXT_STORY = 'Next story';
process.env.CONTENT_IM_DONE = 'Thanks, I\'m done';
process.env.BLOCK_IM_DONE = 'back in touch (gif)';
process.env.READER_BLOCK_NAME = 'Feed Reader';

module.exports = {
  handler(event, context, callback) {
    // these env vars are required
    const required = [
      'CONTENT_READ_THE_STORY',
      'CONTENT_NEXT_STORY',
      'READER_BLOCK_NAME',
      'CONTENT_IM_DONE',
      'READER_BLOCK_NAME',
      'CHATFEED_BASEURL',
    ];
    required.forEach((key) => {
      if (!process.env[key]) callback(new Error(`Missing ${key}`));
    });

    async.auto({
      parsedEvent: done => parseEvent(event, done),
      config: ['parsedEvent', (results, done) => state.initial(results.parsedEvent, done)],
      feed: ['parsedEvent', (results, done) => feed.load(results.parsedEvent.current, done)],
      nextPost: ['feed', 'parsedEvent', (results, done) => state.getNext(results, done)],
      message: ['nextPost', (results, done) => done(null, chatfuelTemplateItem(results.nextPost, results.nextPost.hasNext))],
      finalConfig: ['config', 'nextPost', (results, done) => state.update(results.config, results.nextPost, done)],
    }, (error, response) => {
      if (error) {
        return callback(null, {
          messages: [
            { text: error.message },
          ],
        });
      }

      const message = response.message;
      message.set_attributes = response.finalConfig;
      return callback(null, message);
    });
  },
};
