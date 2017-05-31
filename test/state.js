/* eslint-env node, mocha */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const feed = require('../lib/feed');
const state = require('../lib/state');

describe('state', () => {
  describe('getNext', () => {
    const current = 123;
    let parsed;

    before(() => {
      const xml = fs.readFileSync(path.join(__dirname, './assets/justin.xml'), 'utf8');
      parsed = feed.parse(xml);
    });

    it('should read first article with no session/global', (done) => {
      state.getNext({
        parsedEvent: { current, session: { seen: [] }, global: {} },
        feed: parsed,
      }, (error, next) => {
        assert.deepEqual(next.title, parsed[0].title);
        assert.deepEqual(next.hasThis, true);
        done();
      });
    });

    describe('session', () => {
      it('should read second article when session has seen the first', (done) => {
        state.getNext({
          parsedEvent: { current, session: { seen: [parsed[0].id] }, global: {} },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.title, parsed[1].title);
          assert.deepEqual(next.hasThis, true);
          done();
        });
      });

      it('should read third article when session has seen the first two', (done) => {
        state.getNext({
          parsedEvent: { current, session: { seen: [parsed[0].id, parsed[1].id] }, global: {} },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.title, parsed[2].title);
          assert.deepEqual(next.hasThis, true);
          done();
        });
      });

      it('should read article 3 when session has seen articles 1, 2 & 4', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [parsed[0].id, parsed[1].id, parsed[3].id] },
            global: {},
          },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.title, parsed[2].title);
          assert.deepEqual(next.hasThis, true);
          done();
        });
      });
    });

    describe('global', () => {
      it('should read first article when global has seen the second', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [] },
            global: { [current]: { seen: parsed[1].id } },
          },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.title, parsed[0].title);
          assert.deepEqual(next.hasThis, true);
          done();
        });
      });
      it('should return no articles when global has seen the first', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [] },
            global: { [current]: { seen: parsed[0].id } },
          },
          feed: parsed,
        }, (error) => {
          assert.deepEqual(error.message, 'You\'re all caught up');
          done();
        });
      });
      it('should read first article when global has seen an article that doesn\'t exist', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [] },
            global: { [current]: { seen: 6 } },
          },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.title, parsed[0].title);
          assert.deepEqual(next.hasThis, true);
          done();
        });
      });
    });

    describe('session + global', () => {
      it('should read second article when session has seen the first and global has seen the third', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [parsed[0].id] },
            global: { [current]: { seen: parsed[2].id } } },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.title, parsed[1].title);
          assert.deepEqual(next.hasThis, true);
          done();
        });
      });
      it('should return no articles when session has seen the first and global has seen the second', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [parsed[0].id] },
            global: { [current]: { seen: parsed[1].id } },
          },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(error.message, 'You\'re all caught up');
          done();
        });
      });
    });

    describe('hasNext', () => {
      it('should have next when on the first of two articles', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [] },
            global: { [current]: { seen: parsed[2].id } },
          },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.hasNext, true);
          done();
        });
      });
      it('should not have next when on the second of two articles', (done) => {
        state.getNext({
          parsedEvent: {
            current,
            session: { seen: [parsed[0].id] },
            global: { [current]: { seen: parsed[2].id } },
          },
          feed: parsed,
        }, (error, next) => {
          assert.deepEqual(next.hasNext, false);
          done();
        });
      });
    });
  });

  describe('initial', () => {
    describe('before the list is finished', () => {
      it('should pass through when ids match (viewing the same feed as before)', (done) => {
        const parsedEvent = {
          current: 333,
          session: { current: 333 },
          global: {},
        };
        state.initial(parsedEvent, (error, settings) => {
          assert.deepEqual(settings, { session: parsedEvent.session, global: parsedEvent.global });
          done();
        });
      });

      it('should pass through on id mismatch when no seen items (viewing a new feed, but hadn\'t seen any items previously)', (done) => {
        const parsedEvent = {
          current: 333,
          session: { current: 333 },
          global: {},
        };
        state.initial(parsedEvent, (error, settings) => {
          assert.deepEqual(settings, { session: parsedEvent.session, global: parsedEvent.global });
          done();
        });
      });

      it('should reset on id mismatch with previously seen items (viewing a new feed, save old feed position)', (done) => {
        const parsedEvent = {
          current: 222,
          session: { current: 333, seen: [222] },
          global: {},
        };
        state.initial(parsedEvent, (error, settings) => {
          assert.deepEqual(settings, {
            session: { current: 222 },
            global: { 333: { seen: 222 } },
          });
          done();
        });
      });
    });
  });

  describe('update', () => {
    describe('before the list is finished', () => {
      it('should update the session with the current article', (done) => {
        const nextPost = {
          hasThis: true,
          hasNext: true,
          id: 123,
        };
        const parsedEvent = {
          current: 0,
          session: { current: 0 },
          global: {},
        };
        state.update(parsedEvent, nextPost, (error, settings) => {
          assert.deepEqual(settings, { session: { seen: [123], current: 0 }, global: {} });
          done();
        });
      });
    });

    describe('when on the last item in a feed', () => {
      it('should clear the session and set the global feed marker', (done) => {
        const nextPost = {
          hasThis: true,
          hasNext: false,
          id: 123,
        };
        const parsedEvent = {
          current: 0,
          session: { current: 0, seen: [] },
          global: {},
        };
        state.update(parsedEvent, nextPost, (error, settings) => {
          assert.deepEqual(settings, {
            session: { current: 0 },
            global: { 0: { seen: 123 } },
          });
          done();
        });
      });
    });
  });
});
