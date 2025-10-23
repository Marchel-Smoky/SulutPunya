import bcrypt from 'bcryptjs';

const password = 'MarcTheStar-07';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hash password:', hash);
});
