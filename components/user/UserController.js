const db = require('../../db/models/index')
const User = db.users;
const ClientUser = db.clientuser;
const crypto = require('crypto');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  successResponse,
  errorResponse,
} = require('../../responseService');
const jwt = require('jsonwebtoken');
module.exports = {

  async getAllUsers(req, res, next) {
    try {
      const response = await User.findAll({
        attributes: [
          'username',
        ],
      });
      res.status(200).send(response);
    } catch (error) {
      errorResponse(error, 'Could not Perform Operation! ', 400);
    }
  },

  async getSingleUserByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const response = await User.findOne({
        where: {
          username,
        }
      });
      res.status(200).send(response);
    } catch (error) {
      errorResponse(error, 'Could not Perform Operation! ', 400);
    }
  },

  async login(req, res, next) {
    try {
      const secret_key = process.env.JWT_SECRET_KEY;
      const { username } = req.body;
      const { password } = req.body;
      const response = await User.findOne({
        where: {
          username,
        },
      });
      if (response) {
        const isMatchedPassword = await bcrypt.compare(password,response.password);
        if (isMatchedPassword) {
          const payload = {
            username: response.username,
            level: response.level
          };
          const options = {
            expiresIn: '10h'
          };
          const accessToken = jwt.sign(payload, secret_key, options);
          successResponse(res, { level: response.level, username: response.username }, accessToken);
         }
         else {
          errorResponse(res, 'Wrong Password', 401);
        }
      } else {
        const response = await ClientUser.findOne({
          where: {
            username,
          },
        });
        if (response) {
          const isMatchedPassword = await bcrypt.compare(password,response.password);
          if (isMatchedPassword) {
            const payload = {
              username: response.username,
            };
            const options = {
              expiresIn: '1m'
            };
            const accessToken = jwt.sign(payload, secret_key, options);
            successResponse(res, { username: response.username }, accessToken);
          } else {
            errorResponse(res, 'Wrong password! ', 401);
          }
        }
        else {
          errorResponse(res, 'Wrong Username! ', 401);
        }
      }
    }
    catch (error) {
      errorResponse(error, 'Could not Perform Operation! ', 400);
    }
  },
  async editUser(req, res, next) {
    try {
      const { username, password, level } = req.body;
      const response = await User.update(
        {
          password,
          level,
        },
        {
          where: {
            username
          }
        }
      );
      if (response) {
        successResponse(res, response, "User Logged In Successfully!");
      }
      else {
        errorResponse(res, 'Could not Perform Operation! ', 400);
      }
    } catch (error) {
      errorResponse(error, 'Could not Perform Operation! ', 400);
    }
  },
  async createNewUser(req, res, next) {
    try {
      const { username } = req.body;
      const { password } = req.body;
      const { level } = req.body;
      const hashedPassword = await bcrypt.hash(password,10);
      const user = await User.findOne({
        where: {
          username,
        },
      });
      if (!user) {
        await User.create({ username, hashedPassword, level });
        successResponse(res, true, "User Inserted Successfully!");
      } else {
        errorResponse(res, 'Could not Perform Operation! ', 400);
      }
    }
    catch (error) {
      errorResponse(error, 'Could not Perform Operation! ', 400);
    }
  },
};