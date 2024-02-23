const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const Event = require("./models/Event.model");
const User = require("./models/User.model");
const Query = require("./models/Query.model")
const cors = require("cors");
const { errorHandler, notFoundHandler } = require("./middleware/error-handling");
const { isAuthenticated } = require("./middleware/authentication");
const PORT = 5005;

const app = express();

mongoose
    .connect("mongodb://127.0.0.1:27017/allure")
    .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
    .catch((err) => console.error("Error connecting to MongoDB", err));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//EVENTS
app.get("/events", (req, res) => {
    Event.find()
        .then((events) => {
            res.json(events);
            console.log("server side")
        })
        .catch((error) => {
            console.log("Unable to get events -> " + err);
            next({...err, message: "Unable to get events"});
        });
});
app.post("/events", (req, res, next) => {

    console.log("app.post: ", req.body)
    const {
        bride,
        groom,
        date,
        venues,
        budget,
        vendors,
        schedule,
        guestList
      } = req.body

    const newEvent = {
        bride,
        groom,
        date,
        venues,
        budget,
        vendors,
        schedule,
        guestList
      }

    Event.create(newEvent)
        .then((event) => {
            res.status(201).json(event);
        })
        .catch((err) => {
            console.log("Failed to create event -> " + err);
            next({...err, message: "Failed to create event"});
        });
});


//EVENT
app.put("/events/:eventId", (req, res, next) => {
    const eventId = req.params.eventId;

    const {
        bride,
        groom,
        date,
        venues,
        budget,
        vendors,
        schedule,
        guestList
      } = req.body

   const newEvent = {
        bride,
        groom,
        date,
        venues,
        budget,
        vendors,
        schedule,
        guestList
      }

    Event.findByIdAndUpdate(eventId, newEvent, { new: true })
        .then((event) => {
            res.status(201).json(event);
        })
        .catch((err) => {
            console.log("Failed to update event -> " + err);
            next({...err, message: "Failed to update event"});
        });
});
app.delete("/events/:eventId", (req, res, next) => {
    const eventId = req.params.eventId;
    Event.findByIdAndDelete(eventId)
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            console.log("Failed to delete event -> " + err);
            next({...err, message: "Failed to delete event"});
        });
});
app.get("/events/:eventId", (req, res, next) => {
    const eventId = req.params.eventId;
    Event.findById(eventId)
        .then((event) => {
            res.status(200).json(event);
        })
        .catch((err) => {
            console.log("Unable to get event -> " + err);
            next({...err, message: "Unable to get event"});
        });
});


//USERS
app.get("/users", (req, res) => {
    User.find()
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.error("Unable to retrieve users -> ", err);
            next({...err, message: "Unable to retrieve users"});
        });
});
app.post("/users", (req, res, next) => {
    const { email, password } = req.body;

    const newUser = {
        email,
        password
    };
    User.create(newUser)
        .then((user) => {
            res.status(201).json(user);
        })
        .catch((err) => {
            console.log("Failed to create user -> " + err);
            next({...err, message: "Failed to create user"});
        });
});


//USER
app.get("/users/:userId", (req, res, next) => {
    const userId = req.params.userId;
    User.findById(userId)
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.log("Unable to retrieve user -> " + err);
            next({...err, message: "Unable to retrieve user"});
        });
});


//QUERY
app.post("/queries", (req, res, next) => {
    const {name, email, subject} = req.body
    const newQuery = {
        name,
        email,
        subject
    }
    Query.create(newQuery)
    .then((query) => {
        res.status(201).json(query);
    })
    .catch((err) => {
        console.log("Failed to create query -> " + err);
        next({...err, message: "Failed to create query"});
    });
})
app.get("/queries", (req, res, next) => {
    Query.find()
    .then((queries) =>{
        res.status(201).json(queries)
    })
    .catch((err) => {
        console.log("Failed to get queries -> " + err);
        next({...err, message: "Failed to get queries"});
    });
})
app.put("/queries", (req, res, next) => {
    console.log("this is server")
    const {
        queryId,
        read
        } = req.body

        const updatedQuery = {
            queryId, 
            read
        }
    Query.findByIdAndUpdate(queryId, updatedQuery, {new:true})
    .then(() =>{
        console.log("Query updated in server")
        console.log(queryId)
        console.log(updatedQuery)
    })
    .catch((err) => {
        console.log("Failed to mark as read -> " + err);
        next({...err, message: "Failed to mark as read"});
    });
})

app.use("/user/:id", isAuthenticated)
app.use('/auth', require('./routes/auth.routes'))

app.use(notFoundHandler);
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
