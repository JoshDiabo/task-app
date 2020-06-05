const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function auth(req, res, next) {
    console.log('Authenticating...');

    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
    
        const user = await User.findOne({
            _id: tokenPayload._id,
            'tokens.token': token
        });

        if (!user) {
           throw new Error();
        }

        req.user = user;
        req.activeToken = token;
        next();
    } catch (err) {
        console.log(err)
        if (err.name ==='MongooseServerSelectionError') {
            return res.status(500).send({
                error: err
            });
        }

        return res.status(401).send({
            error: 'Please authenticate'
        });
    }
}

module.exports = auth;