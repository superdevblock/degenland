const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('../../config/default.json');

const Account = require('../../models/Account');

exports.loadUser = async (req, res) => {
  console.log("----------loadUser------------");
  try {
    console.log("========try============");
    const user = await Account.findById(req.query.id);
    console.log(user);
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
}

exports.login = async (req, res) => {
  try {
    if (!req.body.accountId) {
      res.send({
        status: false,
        message: 'failed'
      });
    } else {
      const accountId = req.body.accountId;

      let user = await Account.findOne({ accountId: accountId });
      if (!user)
        res.status(400).send({ status: false, message: 'Invalid credentials' });

      console.log(user);
      // Return JWT
      const payload = {
        user: {
          id: user.accountId
        }
      };
      console.log(payload);
      console.log(config);

      console.log(config.jwtSecret);
      console.log(config.tokenExpiration);

      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: config.tokenExpiration },
        (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token });
        }
      );
    }
  } catch (err) {
    res.status(500).send(err);
  }
}