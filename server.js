// #############################################################################
// ## START SERVER
// ##########################
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception\n${err.name} ${err.message}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connected');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection\n${err.name} ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
