const express = require('express');
const app = express();
const multer = require('multer');

const userRoute = require('./routers/user');
const taskRoute = require('./routers/task');

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

module.exports = app;


   





 

