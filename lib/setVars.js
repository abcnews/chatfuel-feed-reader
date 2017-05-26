module.exports = state => ({
  feed_current: state.session.current,
  _feed_current_session: JSON.stringify(state.session),
  _feed_global_session: JSON.stringify(state.global),
});
