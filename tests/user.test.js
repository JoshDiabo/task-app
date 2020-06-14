const request = require('supertest');
const app = require('../src/app');

const dbConnection = require('../src/db/mongoose');
const User = require('../src/models/user');

const mongoose = require('mongoose');
const taskApi = request(app);
const {setupDb, testUser1, userId1} = require('./fixtures/db');

beforeAll(async () => {
    await dbConnection();
})

beforeEach(setupDb);

test('Sign-up a new User Successfully', async () => {
    const newUser = {
        name: 'Test',
        age: 18,
        email: 'testy@test.com',
        password: 'testbois'
    }

    const response = await taskApi.post('/users')
        .send(newUser)
        .expect(201);

    const userInDb = await User.findById(response.body.savedUser._id);
    expect(userInDb).toBeTruthy();
    expect(response.body).toMatchObject({
        savedUser: {
            name: newUser.name,
            age: newUser.age,
            email: newUser.email
        },
        token: userInDb.tokens[0].token
    });

    expect(userInDb.password).not.toBe(newUser.password);
});

test('Can not Get User Information without Authentication', async () => {
    await taskApi.get('/users/me').send()
        .expect(401);
});

test('Get Profile with Authentication', async () => {
    await taskApi.get('/users/me')
        .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Login with correct credentials', async () => {
    const response = await taskApi.post('/users/login')
        .send({
            email: testUser1.email,
            password: testUser1.password
        })
        .expect(200);

    const userInDb = await User.findById(userId1);

    expect(userInDb.tokens[1].token).toBe(response.body.token);
});

test('Login with incorrect credentials', async () => {
    await taskApi.post('/users/login')
        .send({
            email: 'bad@bad.com',
            password: 'Neiger'
        })
        .expect(401);
});

test('Delete Account Successfully', async () => {
    await taskApi.delete('/users/me')
        .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
        .expect(200);

    const userNotInDb = await User.findById(testUser1._id);

    expect(userNotInDb).toBeNull();
});

test('Delete Account Failed', async () => {
    await taskApi.delete('/users/me')
        .expect(401);
});

test('Should Upload Avatar Image', async () => {
    await taskApi.post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const userInDb = await User.findById(testUser1._id);

    expect(userInDb.avatar).toEqual(expect.any(Buffer));
})

test('Should Update Valid User Fields', async () => {
    await taskApi.patch('/users/me')
        .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
        .send({
            name: 'Josh-o'
        })
        .expect(200);

    const userInDb = await User.findById(testUser1._id);

    expect(userInDb.name).toBe('Josh-o')
})

test('Should Not Update Invalid User Field', async () => {
    await taskApi.patch('/users/me')
        .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
        .send({
            location: 'New York'
        })
        .expect(422)
})

afterAll(async () => {
    mongoose.connection.close()
})