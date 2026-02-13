const mongoose = require('mongoose');

const discussionReplySchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.ObjectId,
    ref: 'DiscussionThread',
    required: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  parentReply: {
    type: mongoose.Schema.ObjectId,
    ref: 'DiscussionReply'
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  isSolution: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update thread replies count
discussionReplySchema.post('save', async function() {
  const thread = await this.model('DiscussionThread').findById(this.thread);
  const count = await this.model('DiscussionReply').countDocuments({ thread: this.thread });
  thread.repliesCount = count;
  await thread.save();
});

module.exports = mongoose.model('DiscussionReply', discussionReplySchema);
