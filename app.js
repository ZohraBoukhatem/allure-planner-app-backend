const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const Wedding = require("./models/Wedding.model");
const User = require("./models/User.model");
const Query = require("./models/Query.model");
const cors = require("cors");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error-handling");
const { isAuthenticated } = require("./middleware/authentication");
const PORT = 5005;

const app = express();

const MONGO_URI = "mongodb://127.0.0.1:27017/allure"

mongoose
  .connect(MONGO_URI)
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//WEDDINGS
app.get("/weddings", isAuthenticated, (req, res) => {
  Wedding.find()
    .then((weddings) => {
      res.json(weddings);
      console.log("server side");
    })
    .catch((error) => {
      console.log("Unable to get weddings -> " + err);
      next({ ...err, message: "Unable to get weddings" });
    });
});

app.post("/weddings", isAuthenticated, (req, res, next) => {
  console.log("app.post: ", req.body);
  const { bride, groom, date, venues, budget, vendors, schedule, guestList } =
    req.body;

  const newWedding = {
    bride,
    groom,
    date,
    venues,
    budget,
    vendors,
    schedule,
    guestList,
  };

  Wedding.create(newWedding)
    .then((wedding) => {
      res.status(201).json(wedding);
    })
    .catch((err) => {
      console.log("Failed to create wedding -> " + err);
      next({ ...err, message: "Failed to create wedding" });
    });
});

//WEDDING
app.get("/weddings/:weddingId", isAuthenticated, (req, res, next) => {
    const weddingId = req.params.weddingId;
    Wedding.findById(weddingId)
      .then((wedding) => {
        res.status(200).json(wedding);
      })
      .catch((err) => {
        console.log("Unable to get wedding -> " + err);
        next({ ...err, message: "Unable to get wedding" });
      });
  });

app.put("/weddings/:weddingId", isAuthenticated, (req, res, next) => {
  const weddingId = req.params.weddingId;

  const { bride, groom, date, venues, budget, vendors, schedule, guestList } =
    req.body;

  const newWedding = {
    bride,
    groom,
    date,
    venues,
    budget,
    vendors,
    schedule,
    guestList,
  };

  Wedding.findByIdAndUpdate(weddingId, newWedding, { new: true })
    .then((wedding) => {
      res.status(201).json(wedding);
    })
    .catch((err) => {
      console.log("Failed to update wedding -> " + err);
      next({ ...err, message: "Failed to update wedding" });
    });
});

app.delete("/weddings/:weddingId", isAuthenticated, (req, res, next) => {
  const weddingId = req.params.weddingId;
  Wedding.findByIdAndDelete(weddingId)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      console.log("Failed to delete wedding -> " + err);
      next({ ...err, message: "Failed to delete wedding" });
    });
});


//USERS
app.post("/users", (req, res, next) => {
  const { email, password } = req.body;

  const newUser = {
    email,
    password,
  };
  User.create(newUser)
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.log("Failed to create user -> " + err);
      next({ ...err, message: "Failed to create user" });
    });
});

//QUERY
app.get("/queries", isAuthenticated, (req, res, next) => {
  Query.find()
    .then((queries) => {
      res.status(201).json(queries);
    })
    .catch((err) => {
      console.log("Failed to get queries -> " + err);
      next({ ...err, message: "Failed to get queries" });
    });
});

app.use("/user/:id", isAuthenticated);
app.use("/auth", require("./routes/auth.routes"));

app.use(notFoundHandler);
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
