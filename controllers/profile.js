const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({
      id: id
    })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      }
      res.status(400).json('error getting user');
    });
};

const changePassword = (newPassword, userEmail, db, bcrypt) => {
  const newHash = bcrypt.hashSync(newPassword);
  db('login')
    .where({ email: userEmail })
    .update({ hash: newHash })
    .returning('email')
    .then(email => console.log(email[0]))
    .catch(err => 'error');
};

const handlePasswordChange = (req, res, db, bcrypt) => {
  const { currentPassword, newPassword, userEmail } = req.body;
  db.select('hash')
    .from('login')
    .where({ email: userEmail })
    .then(data => {
      const isValid = bcrypt.compareSync(currentPassword, data[0].hash);
      if (isValid) {
        changePassword(newPassword, userEmail, db, bcrypt);
        return res.json('success');
      } else {
        return res.status(400).json('error changing password');
      }
    })
    .catch(err => res.status(400).json('error changing password'));
};

const deleteProfile = (req, res, db, bcrypt) => {
  const { userEmail } = req.body;
  db.transaction(trx => {
    trx('login')
      .where({ email: userEmail })
      .del()
      .then(() => {
        trx.commit();
        res.json('account deleted');
      })
      .catch(() => {
        trx.rollback();
        res.json('fail');
      });
  });
};

module.exports = {
  handleProfileGet,
  handlePasswordChange,
  deleteProfile
};
