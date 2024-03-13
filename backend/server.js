const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const knex = require("knex");
const { comparePasswords } = require("./utils/passwordUtils");
const { v4: uuidv4 } = require("uuid");
// const { checkRole, authenticateToken } = require("./middlewares/roleAuth.js");
const { async } = require("rxjs");
const cookieParser = require("cookie-parser");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(checkAuth)

const db = knex({
  client: process.env.CLIENT,
  connection: {
    host: process.env.HOST,
    user: process.env.USER,
    password: "",
    database: process.env.DATABASE,
  },
});

function getCurrentMonth(){
  const currentDate=new Date()
  const currentMonth=currentDate.getMonth()+1
  return currentMonth
}

const verifyJWT=(userJWT)=>{
  try{
    return Promise.resolve(jwt.verify(userJWT, 'your-secret-key'))
  }catch(error){
    return Promise.resolve(error)
  }
}

const checkRole = (role) => {
  return async (req, res, next) => {
    const authorizationHeader=req.headers.authorization
    const decoded=await verifyJWT(authorizationHeader)
    if(decoded && decoded.role){
      const user=decoded
      const userRole=user.role
      if(userRole==='admin'){
        req.user=user
        return next()
      }
    }
    return res.status(403).json({message: 'Unauthorised'})
  };
};

// Middleware to authenticate user token
const authenticateToken = async (req, res, next) => {

  const {authorization}=req.headers
  console.log(authorization)

  const decoded=await verifyJWT(authorization)  
  console.log(decoded)

  if(decoded.id){
    const userid=await decoded.id
    if(!userid){
      return res.status(403).json({message: "Forbidden"})
    }
    req.userid=userid
    return next()
  }
  return res.status(403).json({message: "Forbidden"})
};


app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    // Check if the user with the provided email already exists
    const existingUser = await db("users")
      .select("email")
      .where("email", email)
      .first();
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    await db("users").insert({
      id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });
    ////

    //roles=['admin', 'onboardingstaff','superadmin','fresher']

    //////

    const currentMonth=getCurrentMonth()

    const existingMonth=await db('analysis')
    .select('adduser')
    .where('month', currentMonth)
    .first()

    if(existingMonth){
      await db('analysis')
      .where("month", currentMonth)
      .increment('adduser', 1)
    }else{
      await db('analysis').insert({
        month: currentMonth,
        adduser: 1
      })
    }


    console.log("User created successfully");
    res.status(200).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error while inserting user:", error);
    res
      .status(500)
      .json({ message: "Error occurred while creating the user." });
  }
});
/*
if (role === "admin") page = "All";
// if (role === "onboardingstaff") page = "User";
 if (role === "onboardingstaff") page = "User, Permissions";
 if (role === "newonboardingstaff") page = "Only see";
 if (role === "superadmin") page = "All";
 //if (role === "fresher") page = "User";
 if (role === "fresher") page = "User, Permisions";

 await db("perms").insert({
   id,
   role,
   page,
 });
*/
app.post("/permission",authenticateToken,checkRole('admin'), async (req, res) => {
  const { role, page } = req.body;

  try {
    await db("perms").insert({
      role,
      page,
    });
    console.log("Permission added successfully");
    res.status(200).json({ message: "Permission added successfully." });
  } catch (error) {
    console.error("Error while Permission adding:", error);
    res.status(500).json({ message: "Error occurred while Permission ." });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db("users").select("*").where("email", email).first();

    if (user) {
      const passwordMatch = await comparePasswords(password, user.password);

      if (passwordMatch) {
        const payload = {
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          id: user.id
        };
        const token = jwt.sign(payload, "your-secret-key", { expiresIn: "1h" });
        console.log("login token here: ", token)

        // Update the user record with the JWT token
        await db("users").where("email", email).update({ jwttoken: token });

        res.cookie("token", token, { httpOnly: true });

        res.status(200).json({ token, payload });
        console.log(payload);
      } else {
        res.status(401).json({ message: "Incorrect password." });
      }
    } else {
      res.status(404).json({ message: "Incorrect email entered." });
    }
  } catch (error) {
    console.error("Error while fetching user:", error);
    res
      .status(500)
      .json({ message: "Error occurred while fetching the user." });
  }
});

// Endpoint for fetching users
app.get("/users",authenticateToken, async (req, res) => {
  try {
    const users = await db("users").select(
      "firstName",
      "lastName",
      "email",
      "role"
    );


    const currentMonth=getCurrentMonth()

    const existingMonth=await db('analysis')
    .select('userview')
    .where('month', currentMonth)
    .first()

    if(existingMonth){
      await db('analysis')
      .where("month", currentMonth)
      .increment('userview', 1)
    }else{
      await db('analysis').insert({
        month: currentMonth,
        userview: 1
      })
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Error while fetching users:", error);
    res.status(500).json({ message: "Error occurred while fetching users." });
  }
});

app.get("/permission",authenticateToken, async (req, res) => {
  try {
    const users = await db("perms").select("page", "role");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error while fetching users:", error);
    res.status(500).json({ message: "Error occurred while fetching users." });
  }
});

app.delete(
  "/permission/:role",authenticateToken,checkRole('admin'),
  async (req, res) => {
    const roleToDelete = req.params.role;
    try {
      const deletedpermission = await db("perms")
        .where({ role: roleToDelete })
        .del();

      if (deletedpermission) {
        res.status(200).json({ message: "Permission deleted successfully." });
      } else {
        res.status(404).json({ message: "Permission not found." });
      }
    } catch (error) {
      console.error("Error occurred while deleting Permission:", error);
      res.status(500).json({
        message: "Error occurred while deleting Permission. Please try again.",
      });
    }
  }
);

// Update permission  details endpoint
app.put(
  "/permission/:role",authenticateToken,checkRole('admin'),
  async (req, res) => {
    const roleToUpdate = req.params.role;
    const { role, page } = req.body;
    console.log(req.body);

    try {
      // Update user details
      const updatedPermission = await db("perms")
        .where({ role: roleToUpdate })
        .update({ role, page });
      if (updatedPermission) {
        res
          .status(200)
          .json({
            status: "success",
            message: "Permission updated successfully.",
          });
      } else {
        res
          .status(404)
          .json({ status: "error", message: "Permission not found." });
      }
    } catch (error) {
      console.error("Error occurred while updating Permission:", error);
      res.status(500).json({
        message: "Error occurred while updating Permission. Please try again.",
      });
    }
  }
);

// Endpoint for deleting a user
app.delete(
  "/users/:email",authenticateToken,checkRole('admin'),
  async (req, res) => {
    const emailToDelete = req.params.email;
    try {
      const deletedUser = await db("users")
        .where({ email: emailToDelete })
        .del();


    const currentMonth=getCurrentMonth()

    const existingMonth=await db('analysis')
    .select('deleteuser')
    .where('month', currentMonth)
    .first()

    if(existingMonth){
      await db('analysis')
      .where("month", currentMonth)
      .increment('deleteuser', 1)
    }else{
      await db('analysis').insert({
        month: currentMonth,
        deleteduser: 1
      })
    }

      if (deletedUser) {
        res.status(200).json({ message: "User deleted successfully." });
      } else {
        res.status(404).json({ message: "User not found." });
      }
    } catch (error) {
      console.error("Error occurred while deleting user:", error);
      res.status(500).json({
        message: "Error occurred while deleting user. Please try again.",
      });
    }
  }
);

// Update user details endpoint
app.put(
  "/users/:email",authenticateToken,checkRole('admin'),
  async (req, res) => {
    const emailToUpdate = req.params.email;
    const { firstName, lastName, email, password, role } = req.body;
    console.log(req.body);

    try {
      const userToUpdate = await db("users")
        .select("password")
        .where({ email: emailToUpdate })
        .first();

      if (!userToUpdate) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found." });
      }

      const passwordMatch = await comparePasswords(
        password,
        userToUpdate.password
      );

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ status: "error", message: "Incorrect password." });
      }

      // Update user details
      const updatedUser = await db("users")
        .where({ email: emailToUpdate })
        .update({ firstName, lastName, email, role });


    const currentMonth=getCurrentMonth()

    const existingMonth=await db('analysis')
    .select('updateuser')
    .where('month', currentMonth)
    .first()

    if(existingMonth){
      await db('analysis')
      .where("month", currentMonth)
      .increment('updateuser', 1)
    }else{
      await db('analysis').insert({
        month: currentMonth,
        updateuser: 1
      })
    }

      if (updatedUser) {
        res
          .status(200)
          .json({ status: "success", message: "User updated successfully." });
      } else {
        res.status(404).json({ status: "error", message: "User not found." });
      }
    } catch (error) {
      console.error("Error occurred while updating user:", error);
      res.status(500).json({
        message: "Error occurred while updating user. Please try again.",
      });
    }
  }
);

app.post("/verify-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db("users").select("*").where("email", email).first();

    if (user) {
      const passwordMatch = await comparePasswords(password, user.password);

      if (passwordMatch) {
        res.status(200).json({ success: true });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Incorrect password." });
      }
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error while verifying password:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while verifying the password.",
    });
  }
});

app.get("/data",authenticateToken, async (req, res) => {
  try {
    const users = await db("users").select(
      "firstName",
      "lastName",
      "email",
      "role"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error while fetching users:", error);
    res.status(500).json({ message: "Error occurred while fetching users." });
  }
});

//Cafe Analysis endpoint
app.get("/analysis",authenticateToken, async (req, res) => {
  try {
    const analysisData = await db("analysis").select(
      "month",
      "adduser",
      "updateuser",
      "userview",
      "deleteuser"
    );

    res.status(200).json(analysisData);
  } catch (error) {
    console.error("Error while fetching analysis data:", error);
    res.status(500).json({ message: "Error occurred while fetching analysis data." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

