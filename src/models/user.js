const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const userSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            validate: {
                validator: (val) => {
                    return val >= 0;
                },
                message: 'Age must be postive'
            },
            default: 0
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate: {
                validator: (val) => {
                    return validator.isEmail(val);
                },
                message: 'Invalid email address'
            },
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 7,
            trim: true,
            validate: {
                validator: (val) => {
                    return !validator.contains(val.toLowerCase(), 'password')
                },
                message: 'Password contains the word password'
            },
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avatar: {
            type: Buffer
        }
    },
    {
        timestamps: true
    }
)

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'user'
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    
    next();
});

userSchema.methods.toJSON = function() {
    const user = this.toObject();

    delete user.tokens;
    delete user.password;
    delete user.avatar;

    return user;
}

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({
        _id: this._id.toString()
    }, process.env.JWT_SECRET, {
        expiresIn: '1 day'
    });

    this.tokens.push({token});
    await this.save();

    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const userToLogin = await User.findOne({
        email
    });

    if (!userToLogin) {
        throw new Error('Login failed');
    }

    const validPassword = await bcrypt.compare(password, userToLogin.password);

    if (!validPassword) {
        throw new Error('Login failed');
    }

    return userToLogin;
}

userSchema.pre('remove', async function(next) {
    const deletedTasks = await Task.deleteMany({
        user: this._id
    });
});



const User = mongoose.model('User', userSchema);

module.exports = User;