/* eslint-env node, mocha */
const assert = require('assert');
const parseEvent = require('../lib/parseEvent');

describe('parseEvent', () => {
  it('should parse valid object', (done) => {
    const data = {
      body: 'feed_current=51120&_feed_current_session=%7B%7D&_feed_global_session=%7B%7D',
    };
    parseEvent(data, (error, response) => {
      assert.ifError(error);
      assert.deepEqual(response, { current: 51120, session: {}, global: {} });
      done();
    });
  });
  it('should parse invalid object using default values', (done) => {
    const data = {
      body: 'feed_current=51120',
    };
    parseEvent(data, (error, response) => {
      assert.ifError(error);
      assert.deepEqual(response, { current: 51120, session: {}, global: {} });
      done();
    });
  });
});
