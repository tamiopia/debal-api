const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['match', 'message', 'listing', 'system'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object, default: {} }
  }, { timestamps: true });