# create a symlink to ourself so we can point fliteral to our app
ln -s `pwd` test/literals/chatfuel-feed-reader

# launch fliteral with the previously created path
export CONTENT_READ_THE_STORY="Read the story 🔗"
export CONTENT_NEXT_STORY="Next story"
export CONTENT_IM_DONE="Thanks, I'm done"
export BLOCK_IM_DONE="back in touch (gif)"
export READER_BLOCK_NAME="Feed Reader"
export CHATFEED_BASEURL="http://www.cdn.abc.net.au/"
export LITERAL_PATH=`pwd`/test/literals/
export LITERAL_TIMEOUT=60000;

# debug by swapping the commented lines
# node --debug-brk --inspect node_modules/fliteral
node node_modules/fliteral
