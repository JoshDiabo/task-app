const { sendGreeting, sendAccountDeleteEmail } = require('../emails/account');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        console.log(file)

        if (!file.originalname.match(/.(jpg|png|jpeg)$/)) {
            return cb(new Error('Must be a valid image'));
        }

        cb(undefined, true);
    }
});

const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/logout', auth, async (req, res) => {
    const user = req.user;
    const activeToken = req.activeToken;

    user.tokens = user.tokens.filter((token) => {
        return token.token !== activeToken;
    });

    try {
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send({
            error: err
        });
    }
});

router.post('/logoutAll', auth, async (req, res) => {
    const user = req.user;
    user.tokens = [];

    try {
        await user.save();
        res.send(user);
    } catch(err) {
        res.status(500).send({
            error: err
        });
    }
});



router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email,
             req.body.password);

        const token = await user.generateAuthToken();

        res.send({user, token});
    } catch (err) {
        if (err.message === 'Login failed') {
            return res.status(401).send({
                error: err.message
            });
        }
   
        return res.status(500).send({
            error: err
        });
    }
});

router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/me', auth, async (req, res) => {
    const fieldsToUpdate = Object.keys(req.body);
    const validFields = Object.keys(User.schema.tree);

    const invalidFields = fieldsToUpdate.filter((field) => {
        if (!validFields.includes(field)) {
            return field;
        }
    });

    if (invalidFields.length !== 0) return res.status(422).send({
        error: `The following fields are invalid: ${invalidFields}`
    });

    try {
        fieldsToUpdate.forEach((field) => {
            req.user[field] = req.body[field];
        });

        const updatedUser = await req.user.save();
    
        res.status(200).send(updatedUser);
    } catch (err) {
        if (err.name === 'CastError' || err.name === 'ValidationError') {
            return res.status(422).send({
                error: err.message
            });
        }

        res.status(500).send({
            error: err.message
        });
    }
});

router.post('/', async (req, res, next) => {
    const user = new User(req.body);

    try {
        const savedUser = await user.save();
        const token = await user.generateAuthToken();
        sendGreeting(user.email, user.name);

        res.status(201).send({savedUser, token});
    } catch(err) {
        console.log(err)
        if (err.name === 'ValidationError' || err.code ===  11000) {
            return res.status(422).send({
                error: err.message
            });
        }

        res.status(500).send({
            error: err
        })
    }

    next();
});

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();

        sendAccountDeleteEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (err) {
        if (err.name === 'CastError') {
                return res.status(422).send({
                error: err.message
            });
        }

        console.log(err)
        res.status(500).send({
            error: err.message
        });
    }
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const resziedAvatar = await sharp(req.file.buffer)
            .resize(250, 250).
            png()
            .toBuffer();

        //req.user.avatar = req.file.buffer;
        req.user.avatar = resziedAvatar;
        const updatedUser = await req.user.save();

        res.send(updatedUser);
    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: err
        });
    }
}, (err, req, res, next) => {
    if (err.message === 'File too large')
    return res.status(413).send({
        error: err
    });

    res.status(422).send({
        error: err.message
    });
});

router.delete('/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
  
        res.send();
    } catch(err) {
        res.status(500).send({
            error: err
        });
    }
});

router.get('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) return res.status(404).send();

        res.set('Content-Type', 'image/jpg');

        res.send(user.avatar);
    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: err
        });
    }
});


module.exports = router;