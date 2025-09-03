const mongoose = require('mongoose');

const ConnectionString = process.env.MONGO_URI;


async function connecttodatabase(){
  await mongoose.connect(ConnectionString)
  console.log("Connect to mangoDB");
}
module.exports = connectToDatadase;