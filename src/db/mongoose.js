const mongoose = require('mongoose');

// const port = 27017;
// const dbName = 'task-app';
// const url = `mongodb://127.0.0.1:${port}/${dbName}`;

function connect() {
    const connect = mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 2000,
        useFindAndModify: false,
        useCreateIndex: true
    });
    
    return new Promise((resolve, reject) => {
        connect.then(() => {
            resolve(connect);
        }).catch((err) => {
            reject(err);
        })
    })
}

module.exports = connect;



