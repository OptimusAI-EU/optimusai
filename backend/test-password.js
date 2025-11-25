const bcrypt = require('bcryptjs');

const hash = '$2a$10$c6w7zuZcHSQEPryZpIltBuQ3LGzP0liAEPz78yQO1edO7WDZR0BzW';
const password = 'Test1234!';

bcrypt.compare(password, hash).then(res => {
  console.log('Password match:', res);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
