const bcrypt = require('bcryptjs');

// Plain password to be hashed
const password = 'safniya';  // Replace with the plain password you want to hash
const saltRounds = 10;

// Hash the password
bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }

    console.log('Hashed password:', hashedPassword);
    // Now you can manually insert this hashed password into the database
});
