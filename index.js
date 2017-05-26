const async = require('async');
const parseEvent = require('./lib/parseEvent');
const feed = require('./lib/feed');
const state = require('./lib/state');
const setVars = require('./lib/setVars');
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
    const requiredVars = [
      'CONTENT_READ_THE_STORY',
      'CONTENT_NEXT_STORY',
      'READER_BLOCK_NAME',
      'CONTENT_IM_DONE',
      'READER_BLOCK_NAME',
      'CHATFEED_BASEURL',
    ];
    const errors = [];
    requiredVars.forEach((key) => {
      if (!process.env[key]) errors.push(`Missing ${key}`);
    });
    if (errors.length) return callback(new Error(errors.join()));

    async.auto({
      parsedEvent: done => parseEvent(event, done),
      config: ['parsedEvent', (results, done) => state.initial(results.parsedEvent, done)],
      feed: ['parsedEvent', (results, done) => feed.load(results.parsedEvent.current, done)],
      nextPost: ['feed', 'parsedEvent', (results, done) => state.getNext(results, done)],
      message: ['nextPost', (results, done) => done(null, chatfuelTemplateItem(results.nextPost, results.nextPost.hasNext))],
      finalConfig: ['config', 'nextPost', (results, done) => state.update(results.config, results.nextPost, done)],
    }, (error, results) => {
      if (error) {
        return callback(null, {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { text: error.message },
            ],
          }),
        });
      }

      const message = results.message;
      message.set_attributes = setVars(results.finalConfig);
      return callback(null, {
        statusCode: '200',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    });
  },
};
