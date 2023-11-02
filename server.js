const express = require("express");
const admin = require("firebase-admin");
const yelp = require("yelp-fusion");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const dotenv = require("dotenv");
dotenv.config();
const User = require('./db/Model');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

global.loggedUser;

//Jeff
const client = yelp.client(
  "OPMavrf9yZMFZEcG-pmFNnwFL6z9SXMJzxXhKfHUjiSQyEYBND1HrGUwCbSrBdfQpwDpVck3OZkpMgeyUrE3sIitQrSrc7W9zZhaxqi-CnukwZHaVNdHT1_TrpUrZHYx"
);

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const PORT = process.env.PORT || 8080;
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.engine(".html", require("ejs").renderFile);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "A sample API",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local server",
      },
    ],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /index:
 *   get:
 *     description: Renders the index page
 *     responses:
 *       200:
 *         description: Successfully rendered the index page
 */


app.get("/index", (req, res) => {
  if (global.loggedUser) {
    res.render("index");
  }
  else {
    res.redirect('/')
  }
});

/**
 * @swagger
 * /:
 *   get:
 *     description: Renders the signup page
 *     responses:
 *       200:
 *         description: Successfully rendered the signup page
 */

app.get("/", (req, res) => {
  res.render("signup");
});

/**
 * @swagger
 * /loc:
 *   get:
 *     description: Renders the location page
 *     responses:
 *       200:
 *         description: Successfully rendered the location page
 */
app.get("/loc", (req, res) => {
  res.render("location");
});

/**
 * @swagger
 * /profile:
 *   get:
 *     description: Renders the profile page
 *     responses:
 *       200:
 *         description: Successfully rendered the profile page
 */
app.get("/profile", (req, res) => {
  if (global.loggedUser) {
    res.render("profile");
  }
  else {
    res.redirect('/')
  }
});


/**
 * @swagger
 * /favorites/{food}:
 *   get:
 *     description: passes the food item to the list page
 *     responses:
 *       200:
 *         description: Successfully rendered the list page
 */

app.get("/favorites/:food", (req, res) => {
  let food = req.params.food;
  console.log(food);
  console.log("coming from favorites");
  res.render("list", { food: food });
});

/**
 * @swagger
 * /register:
 *  get:
 *   description: Renders the register page
 *  responses:
 *  200:
 *  description: Successfully rendered the register page
 * 
  */

app.get("/register", (req, res) => {
  res.render("register");
});

/**
 * @swagger
 * /search:
 *  get:
 *  description: Renders the search page
 * responses:
 * 200:
 * description: Successfully rendered the search page
 * 
 */

app.get("/search", (req, res) => {
  if (global.loggedUser) {
    res.render("search");
  }
  else {
     res.redirect('/');
  }
});

/**
 * @swagger
 * /favorites:
 * get:
 * description: Renders the favorites page
 * responses:
 * 200:
 * description: Successfully rendered the favorites page
 * 
  */

app.get("/favorites", (req, res) => {
  if (global.loggedUser) {
    res.render("favorites");
  }
  else {
    res.redirect('/')
  }
});


/**
 * @swagger
 * /
 * post:
 * description: API to login a user
 * responses:
 * 200:
 * description: Successfully logged in the user if the credentials are correct
 * 
  */

//APIs For Backend Logic
app.post("/", async (req, res) => {
  console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;

  try {
    const foundUser = await User.findOne({
      email: req.body.email
    })

    if (foundUser.password == req.body.password) {
      global.loggedUser = foundUser;


      console.log('login success');
      console.log(foundUser);
      res.render("index");
    } else{
      res.status(404).render("signup", { message: "User does not exist" });
    }

  }
  catch (ex) {
    console.log(ex);
    console.log('login error');

  }

 
});

/**
 * @swagger
 * /addfavorites:
 * post:
 * description: API to add a restaurant to favorites
 * responses:
 * 200:
 * description: Successfully added the restaurant to favorites
 * 
  */

app.post("/addfavorites",async  (req, res) => {
  let favs = [];
  let restaurant = req.body.restaurant;

  // favs.push(restaurant);
  console.log('here');

  console.log('This is my food placeL:\m', req.body)

  // res.render("favorites", { favs: favs });

  try {
    if(global.loggedUser){
    const loggedUserEmail = global.loggedUser.email; // assuming you have implemented authentication and have access to the user's email
    
    const user = await User.findOne({ email: loggedUserEmail });

    if (!user.businesses.some(business => business.alias === req.body.alias)) {
      const updatedUser = await User.findOneAndUpdate(
        { email: loggedUserEmail },
        { $push: { businesses: req.body } },
        { new: true }
      );
      console.log(req.body)
      console.log(updatedUser)
    }else{
      console.log("Duplicate - Businesses")
    }
      console.log("added fav")
  }
  } catch(ex) {
    console.log(ex)
    console.log('error');
  }

  res.send('Favorite restaurant added!');

});

/**
 * @swagger
 * /search:
 * post:
 * description: API to search for a restaurant
 * responses:
 * 200:
 * description: Successfully searched for a restaurant
  */

app.post("/search", (req, res) => {
  let food = req.body.food;


  res.redirect("/favorites/" + food);
});

/**
 * @swagger
 * /register:
 * post:
 * description: API to register a user
 * responses:
 * 200:
 * description: Successfully registers a user if password and password2 match
 * 
  */

app.post("/register", async (req, res) => {
  const newUser = new User({
    password: req.body.password,
    password2: req.body.password2,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email
  })
  try {
    const result = await newUser.save();
    res.render("signup");
  }
  catch (ex) {
    console.log("Signup Failed")
    console.log(ex)
    res.status(400)
  }
});

/**
 * @swagger
 * /profile/update:
 * put:
 * description: API to update a user's profile
 * responses:
 * 200:
 * description: Successfully updates a user's profile
 * 
 */

app.put("/profile/update", async (req, res) => {
  console.log(req.body)

  try {
    const loggedUserEmail = req.body.email; // assuming you have implemented authentication and have access to the user's email
    const updatedUser = await User.findOneAndUpdate(
      { email: loggedUserEmail },
      {
        $push: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          password: req.body.password,
          DOB: req.body.dob,
          phone: req.body.number,
          address: req.body.address,
        },
      },
      { new: true }
    );

    global.loggedUser = updatedUser; // update the global.loggedUser object with the updated user

    res.status(200).render('profile');
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating user profile");
  }
});

/**
 * @swagger
 * /review:
 * get:
 * description: Retrieves review from OpenAI API
 * responses:
 * 200:
 * description: Successfully retrieves review from OpenAI API
 * 
  */

app.post("/review", async (req, res) => {
  var final = [];

  var business;
  var test;
  client
    .search({
      term: req.body.food,
      location: req.body.city,
    })
    .then((response) => {
      business = response.jsonBody.businesses;
      temp = business.slice(0, 5);
    })
    .then(async () => {
      const promises = temp.map((getreview) => {
        return new Promise(async (resolve) => {
          var id = getreview.id;

          setTimeout(async () => {
            console.log("Called");

            client.reviews(id).then(async (response) => {
              console.log(id);
              console.log(response);
              getreview.reviews = response.jsonBody.reviews;
              final.push(getreview);
              resolve();
            });
          }, 1000);
        });
      });
      await Promise.all(promises);
    }).then(async () => {

      //   const message = `Which restaurant is better? ${reviews[0].text} ${reviews[1].text}`;
      //   await chatCompletion(message);
      const setSavoirBot = "Behave like you are a resturant expert"
      //var suggestion = await chatCompletion(setSavoirBot);


      var counter = 0;
      let nameReview = '';
      final.forEach(item => {
        counter++
        if (item.hasOwnProperty('alias') && item.hasOwnProperty('reviews')) {
          nameReview += `Resturent ${counter}\n`
          item.reviews.forEach(review => {
            nameReview += `${item.alias}: ${review.text}\n`;
          });
        }
      });


      console.log(nameReview)



      const message = `${setSavoirBot} \nSelect One Resturants based on Reviews?\n` + nameReview;

      var suggestion = await chatCompletion(message);
      //res.send({SaviorAi: suggestion})
      test = { "suggestion": suggestion.data.choices[0].message.content }

      final.push({ "suggestion": suggestion.data.choices[0].message.content });
      res.send(final);
      //res.send(final);
    }).catch((e) => {
      console.log(e);
    });
});


/**
 * @swagger
 * /getfavlist:
 * 
 * get:
 * description: API to get a user's favorite restaurants
 * responses:
 * 200:
 * description: Successfully gets a user's favorite restaurants from db
  */

app.get("/getfavlist", async (req, res) => {
  try {
    if (global.loggedUser) {
      const loggedUserEmail = global.loggedUser.email; // assuming you have implemented authentication and have access to the user's email

      const user = await User.findOne({ email: loggedUserEmail });

      if (user) {
        res.status(200).send(user.businesses);
      } else {
        res.status(404).send("User not found");
      }
    } else {
      res.status(401).send("User not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting favorite businesses");
  }
});

/**
 * @swagger
 * /logout:
 * get:
 * description: API to logout a user
 * responses:
 * 200:
 * description: Successfully logs out a user
 * 
  */
app.get('/logout', (req, res) => {
  global.loggedUser = null;
  res.status(200).json({ message: 'Logged out successfully' });
});


/**
 * @swagger
 * /deletefav:
 * post:
 * description: API to delete a user's favorite restaurant
 * responses:
 * 200:
 * description: Successfully deletes a user's favorite restaurant from db
  */

app.post("/deletefav", async (req, res) => {
  try {
    if (global.loggedUser) {
      const loggedUserEmail = global.loggedUser.email; // assuming you have implemented authentication and have access to the user's email
      const aliasToDelete = req.body.alias;

      const updatedUser = await User.findOneAndUpdate(
        { email: loggedUserEmail },
        { $pull: { businesses: { alias: aliasToDelete } } },
        { new: true }
      );

      if (updatedUser) {
        res.status(200).send("Favorite business deleted");
      } else {
        res.status(404).send("User not found");
      }
    } else {
      res.status(401).send("User not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting favorite business");
  }
});




//Functions
async function chatCompletion(message) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.7,
  });

  console.log(response.data.choices[0].message.content);
  return response
}


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
