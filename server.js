const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
dotenv.config({ path: './config.env' });

const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connected successfully!'));

// Socket IO
// const io = new Server({
//   /* options */
// });

// io.on('connection', (socket) => {
//   // ...
// });

// io.listen(4000);

// START SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
