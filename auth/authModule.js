const jwt = require("jsonwebtoken");

function signToken({ _id, permission, secret, expireTime }) {
    return jwt.sign({ id: _id, permission }, secret, { expiresIn: expireTime });
}

function isAdmin(user) {
    return user?.permission === "admin";
}

module.exports = { signToken, isAdmin };