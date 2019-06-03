const { check, validationResult } = require('express-validator/check');

const handleRegister = (req, res, db, bcrypt) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ errors: [{ param: 'form', msg: 'Incorrect Form Submission' }] });
  }
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
  .catch(err => res.status(400).json({ errors: [{ param: 'email', msg: 'Email already exists' }] }));
};

module.exports = {
  handleRegister
};
