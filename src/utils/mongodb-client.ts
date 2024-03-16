
import mongoose from 'mongoose';

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/mydb');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

export default db