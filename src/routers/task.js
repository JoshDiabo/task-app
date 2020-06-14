const express = require('express');

const Task = require('../models/task');

const router = express.Router();

const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const match = {
            user: req.user._id
        }

        switch(req.query.completed) {
            case 'true': 
                match.completed = true
                break;
            case 'false':
                match.completed = false
                break;
        }

        const sort = {};
        let sortOrder = '';
        let sortValue = 0;

        if (req.query.sort) {
            console.log('fuck')
            const sortValue = req.query.sort.split('_')[0];
            sortOrder = req.query.sort.split('_')[1];
        }


        sortOrder = sortOrder === 'desc' ? -1 : 1;
        
        if (req.query.sort) {
            sort[sortValue] = sortOrder;
        }


        sort.updatedAt = -1;
        sort.createdAt = -1;

        console.log(sort)

        const tasks = await Task.find(match)
        .sort(sort)
        .limit(parseInt(req.query.limit))
        .skip(parseInt(req.query.skip))
        res.send(tasks);
    } catch(err) {
        res.status(500).send({
            error: err.message
        });
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch(err) {
        if (err.name === 'CastError') {
                return res.status(422).send({
                error: err.message
            });
        }

        res.status(500).send({
            error: err.name
        });
    }
});


router.post('/', auth, async (req, res) => {
    req.body.user = req.user._id;
    const task = new Task(req.body);

    try {
        const savedTask = await task.save();

        res.status(201).send(savedTask);
    } catch(err) {
        console.log(err)

        if (err.name === 'ValidationError') {
            return res.status(422).send({
                error: err.message
            });
        }

            res.status(500).send({
                error: err.name
            })
    }
});

router.patch('/:id', auth, async (req, res) => {
    const validFields = Object.keys(Task.schema.tree);
    const fieldsToUpdate = Object.keys(req.body);

    const invalidFields = fieldsToUpdate.filter((field) => {
        if (!validFields.includes(field)) {
            return field;
        }
    });

    if (invalidFields.length !== 0) return res.status(422).send({
        error: `The following fields are invalid: ${invalidFields}`
    });

    try {
        const taskToUpdate = await Task.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!taskToUpdate) {
            return res.status(404).send();
        }

        fieldsToUpdate.forEach((field) => {
            taskToUpdate[field] = req.body[field];
        });

        const updatedTask = await taskToUpdate.save();

        res.send(updatedTask);
    } catch (err) {
        console.log(err)
        if (err.name === 'CastError' || err.name === 'ValidationError') {
            return res.status(422).send({
                error: err.message
            });
        }

        res.status(500).send({
            error: err.name
        });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!deletedTask) {
            return res.status(404).send();
        }

        res.send(deletedTask);
    } catch (err) {
        if (err.name === 'CastError') {
                return res.status(422).send({
                error: err.message
            });
        }

        res.status(500).send({
            error: err.name
        });
    }
});



module.exports = router;

