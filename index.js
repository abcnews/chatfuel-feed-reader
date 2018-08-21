const async = require("async");
const parseEvent = require("./lib/parseEvent");
const feed = require("./lib/feed");
const state = require("./lib/state");
const setVars = require("./lib/setVars");
const chatfuelTemplateItem = require("./lib/chatfuelTemplate/item");
const config = require("./config");

function handler(event, context, callback) {
  // these env vars are required
  const requiredVars = [
    "CONTENT_READ_THE_STORY",
    "CONTENT_NEXT_STORY",
    "READER_BLOCK_NAME",
    "CONTENT_IM_DONE",
    "BLOCK_IM_DONE",
    "CHATFEED_BASEURL"
  ];
  const errors = [];
  requiredVars.forEach(key => {
    if (!config[key]) errors.push(`Missing ${key}`);
  });
  if (errors.length) return callback(new Error(errors.join()));

  return async.auto(
    {
      parsedEvent: done => parseEvent(event, done),
      config: [
        "parsedEvent",
        (results, done) => state.initial(results.parsedEvent, done)
      ],
      feed: [
        "parsedEvent",
        (results, done) => feed.load(results.parsedEvent.current, config, done)
      ],
      nextPost: [
        "feed",
        "parsedEvent",
        (results, done) => state.getNext(results, done)
      ],
      message: [
        "nextPost",
        (results, done) =>
          done(
            null,
            chatfuelTemplateItem(
              results.nextPost,
              results.nextPost.hasNext,
              config
            )
          )
      ],
      finalConfig: [
        "config",
        "nextPost",
        (results, done) => state.update(results.config, results.nextPost, done)
      ]
    },
    (error, results) => {
      if (error) {
        return callback(null, {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ text: error.message }]
          })
        });
      }

      const message = results.message;
      message.set_attributes = setVars(results.finalConfig);
      return callback(null, {
        statusCode: "200",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });
    }
  );
}

/*
 * Google Cloud Functions calls this function.
 */
exports.endpoint = (request, response) => {
  handler(
    {
      body: `feed_current=${request.body.feed_current}&_feed_current_session=${
        request.body._feed_current_session
      }&_feed_global_session=${request.body._feed_global_session}`
    },
    {},
    (error, res) => {
      if (error) console.log(error);
      else response.send(res.body);
    }
  );
};
