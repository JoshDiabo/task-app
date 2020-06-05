const { ObjectID, MongoClient } = require('mongodb');


const url = 'mongodb://127.0.0.1:27017';
const dbName = 'task-app';


MongoClient.connect(url, { 
    useNewUrlParser: true 
}, (error, client) => {
    if (error) return new Error('Connection failed');

    const db = client.db(dbName);

    const collection = db.collection('tasks');

    // collection.findOne({
    //     _id: new ObjectID('5ec0b759d8164495e45a766b')
    // }, (error, task) => {
    //     console.log(task);
    // });

    // collection.find({
    //     completed: false
    // }).toArray((error, tasks) => {
    //     console.log(tasks);
    // });

    collection.deleteOne({
        description: 'bank'
    }).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);
    });

    client.close();
});
