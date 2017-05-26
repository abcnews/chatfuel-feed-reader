const stateModule = module.exports = {
  getNext(results, callback) {
    const { parsedEvent, feed } = results;
    const { current, session, global } = parsedEvent;
    const feedIndex = feed.map(item => item.id);

    // seen includes cmids of items that have been seen already.
    if (!session.seen) session.seen = [];

    if (!feed.length) return callback(new Error('There are no stories at this time'));

    // If we have a seen marker in the global config, remove all items older
    // than that one.
    const filteredFeed = Array.from(feed);
    if (global[current] && global[current].seen) {
      const lastSeenPosition = feedIndex.indexOf(global[current].seen);
      if (lastSeenPosition !== -1) filteredFeed.splice(lastSeenPosition);
    }

    // Find the next item in the feed the user hasn't read
    let nextIndex;
    filteredFeed.every((item, index) => {
      if (session.seen.includes(item.id)) {
        return true;
      }
      nextIndex = index;
      return false;
    });

    // There is no item here
    if (typeof nextIndex === 'undefined') {
      return callback(new Error('You\'re all caught up'));
    }

    const hasThis = !!filteredFeed[nextIndex];
    const hasNext = !!filteredFeed[nextIndex + 1];

    return callback(null, Object.assign({
      hasThis,
      hasNext,
    }, filteredFeed[nextIndex]));
  },
  initial(state, callback) {
    const { current, session, global } = state;
    if (current !== session.id) {
      return stateModule.reset(current, session, global, callback);
    }

    return callback(null, {
      session,
      global,
    });
  },
  reset(newId, session, global, callback) {
    const { current, seen } = session;
    const seenItem = seen && seen[0];
    let newGlobal = global;
    if (typeof current !== 'undefined' && seenItem) {
      newGlobal = Object.assign({}, global, { [current]: { seen: seenItem } });
    }
    return callback(null, {
      session: { current: newId },
      global: newGlobal,
    });
  },
  update(state, nextPost, callback) {
    const { session, global } = state;
    const seenItems = Array.from(session.seen || []);
    if (nextPost.hasThis) {
      seenItems.push(nextPost.id);
    }

    // If we have a post after this, update our session to record that we've
    // seen this post.
    if (nextPost.hasNext) {
      return callback(null, {
        global,
        session: {
          seenItems,
          current: session.current,
        },
      });
    }

    // If we don't have a next post, update our global state and reset our
    // session.
    if (!nextPost.hasNext || !nextPost.hasThis) {
      return stateModule.reset(session.current, {
        current: session.current,
        seen: seenItems,
      }, global, callback);
    }

    return null;
  },
};
