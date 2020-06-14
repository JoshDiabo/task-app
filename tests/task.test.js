const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const dbConnection = require('../src/db/mongoose');
const mongoose = require('mongoose');
const Task = require('../src/models/task');
const User = require('../src/models/user');
const {setupDb, testUser1, userId1} = require('./fixtures/db');

const taskApi = request(app);


const testTask = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Finish Unit Test',
    completed: false,
    user: testUser1._id
}

beforeAll(async () => {
    await dbConnection();
})

beforeEach(setupDb);

test('Create a New Task Successfully', async () => {
    const response = await taskApi.post('/tasks')
        .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
        .send(testTask)
        .expect(201);

    const taskInDb = await Task.findById(testTask._id);

    expect(taskInDb).not.toBeNull();
    expect(taskInDb.completed).toBe(testTask.completed);
})

test('Get all Tasks Succesfully', async () => {
    const response = await taskApi.get('/tasks')
    .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
    .expect(200);
})

afterAll(async () => {
    mongoose.connection.close()
})