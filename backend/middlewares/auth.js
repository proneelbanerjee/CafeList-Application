const jwt = require('jsonwebtoken');

require("dotenv").config();
const knex = require("knex");

const db = knex({
    client: process.env.CLIENT,
    connection: {
      host: process.env.HOST,
      user: process.env.USER,
      password: "",
      database: process.env.DATABASE,
    },
  });
// Function to fetch the JWT token from the database

async function getUserToken(email) {
    try {
      const user = await db("users")
        .select("email", "jwttoken")
        .where({ email: email })
        .first();
      return user ? user.jwttoken : null;
    } catch (error) {
      console.error("Error while fetching user token:", error);
      return null;
    }
  }
  
  
// Authentication middleware
function authenticateToken(req, res, next) {
  const { email } = req.body; // Assuming email is part of the login request

  getUserToken(email)
    .then((token) => {
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token found" });
      }

      jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        req.user = user; // Set the user in the request object
        console.log(req.user);
        next();
      });
    })
    .catch((error) => {
      console.error("Error during authentication:", error);
      res.status(500).json({ message: "Internal Server Error" });
    });
}

// Restrict to middleware
function restrictTo(role = []) {
  return function (req, res, next) {
    if (!req.user) return res.redirect('/login');

    console.log(req.user);

    if (!role.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Unauthorized access" });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  restrictTo,
};
