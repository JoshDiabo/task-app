const dbConnection = require('./db/mongoose');
const app = require('./app');

const port = process.env.PORT;

dbConnection()
    .then(() => {
        app.listen(port, () => {
            console.log('Express initialized on port', port)
        });
    })
    .catch((err) => {
        console.log(err);
    });