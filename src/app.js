const express = require('express');
const app = express();

const dbConnection = require('./db/mongoose');
const userRoute = require('./routers/user');
const taskRoute = require('./routers/task');

const port = process.env.PORT;

const multer = require('multer');

const upload = multer({
    dest: 'test'
});

app.post('/upload', upload.single('upload'),
    (req, res) => {
        res.send();
});

app.use(express.json());
app.use('/users', userRoute);
app.use('/tasks', taskRoute);

app.use((req, res, next) => {
    console.log('Response sent');
    next();
})


dbConnection()
    .then(() => {
        app.listen(port, () => {
            console.log('Express initialized on port', port)
        });
    })
    .catch((err) => {
        console.log(err);
    });

   





 

