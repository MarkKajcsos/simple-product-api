
import mongoose from 'mongoose';

export const connecToMongoDb = async () => {
  mongoose.connect('mongodb://mongodb:27017/public');
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  db.once('open', function() {
    console.log('Connected to MongoDB');
  });
}