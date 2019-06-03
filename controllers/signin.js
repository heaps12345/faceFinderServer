const { check, validationResult } = require('express-validator/check');

const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!email || !password) {
    return res.status(400).json({ errors: [{ param: 'form', msg: 'Incorrect Form Submission' }] });
  }

  db.select('email', 'hash')
    .from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json({ errors: [{ param: 'email', msg: 'Invalid Credentials' }] }));
      } else {
        return res.status(400).json({ errors: [{ param: 'email', msg: 'Invalid Credentials' }] })
      }
    })
    .catch(err => res.status(400).json({ errors: [{ param: 'email', msg: 'Invalid Credentials' }] }));
};

module.exports = {
  handleSignin
};
