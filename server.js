const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const Users = require("./routes/apiss/users");
const Profile = require("./routes/apiss/profile");
const Posts = require("./routes/apiss/posts");
const bodyParser = require("body-parser");
const app = express();
//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//db config
const db = require("./config/key").mongoURI;
//connect to mongodb
// mongoose
//   .connect(db)
//   .then(() => console.log("MongoDB Connnected"))
//   .catch(err => console.log(err));
mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true }, function (err) {
  // mongoose.connect(`mongodb://localhost/adappt-dcb?authSource=admin`, { useUnifiedTopology: true }, function(err) {
  if (err)
    console.log("Failed to establish a connection to Mongo DB", err);
  else {
    console.log("Connection established to Mongo DataBase");
  }
});
//passport
app.use(passport.initialize());
require("./config/passport")(passport);
app.get("/", (req, res) => res.send("Hello Thejas"));
//use routes
app.use("/api/users", Users);
app.use("/api/profile", Profile);
app.use("/api/posts", Posts);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server runnig on port ${port}`));
