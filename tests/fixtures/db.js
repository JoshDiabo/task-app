const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userId1 = new mongoose.Types.ObjectId();
const userId2 = new mongoose.Types.ObjectId();

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Eat the poopoo',
    completed: true,
    user: userId1
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Eat the poopoo 2',
    completed: false,
    user: userId1
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Eat the poopoo 3',
    completed: false,
    user: userId2
}

const testUser1 = {
    _id: userId1,
    name: 'Johnson',
    email: 'joshudiabo@gmail.com',
    password: 'johnsonBoys',
    tokens: [{
        token: jwt.sign({ _id: userId1 }, process.env.JWT_SECRET)
    }]
}

const testUser2 = {
    _id: userId2,
    name: 'Johnson',
    email: 'diabo@gmail.com',
    password: 'johnsonBoys1!',
    tokens: [{
        token: jwt.sign({ _id: userId2 }, process.env.JWT_SECRET)
    }]
}

async function setupDb(){
    await User.deleteMany({});
    await new User(testUser1).save();
    await new User(testUser2).save();

    await Task.deleteMany();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    testUser1,
    testUser2,
    setupDb,
    userId1,
    userId2
}