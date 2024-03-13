const checkRole = (role) => {
    return (req, res, next) => {
      if (req.user.role && req.user.role !== role) {
        res.status(403).send('Access denied.');
        return;
      }
      // User has the required role, proceed to the next middleware or route handler
      next();
    };
  };
  
  // Middleware to authenticate user token
  const authenticateToken = (req, res, next) => {
    console.log(req)
    const token = req.cookies.token; // Assuming the token is stored in a cookie
    console.log(token)
    if (!token) {
      return res.status(401).send('Unauthorized: No token provided.');
    }
  
    jwt.verify(token, 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).send('Unauthorized: Invalid token.');
      }
      req.user = user;
      next();
    });
  };

  
  module.exports={
    checkRole, authenticateToken
  }