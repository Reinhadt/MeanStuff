var User	= require('../../app/models/user');
var jwt  = require('jsonwebtoken');
var config	= require('../../config');


var superSecret = config.secret;

module.exports = function(app, express){

  //Get an instance of the express router
  var apiRouter = express.Router();

  apiRouter.post('/authenticate', function(req, res){

    //find the user
    //select the name and username and password explicitly
    User.findOne({
      username: req.body.username
    }).select('name username password').exec(function(err, user){
      if(err){
        throw err;
      }

      //no user with that username was found
      if(!user){
        res.json({
          success: false,
          message: 'Authentication failed. User not found'
        });
      }
      else if(user){
        //check if password matches
        var validPassword = user.comparePassword(req.body.password);

        if(!validPassword){
          res.json({
            success: false,
            message: 'Authentication failed. Password not matches'
          });
        }
        else{
          //if user is found and password is right
          //create a token

          var token = jwt.sign({
            name: user.name,
            username: user.username
          }, superSecret,{
            expiresIn: 1440
          });

          //return the information including token as json
          res.json({
            success: true,
            message: 'Enjoy your token',
            token: token
          });
        }

      }

    });

  });

  //Route middleware
  apiRouter.use(function(req, res, next){
  	//logging
  	console.log('Somebody came to our api');

    //check the header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    //decode token
    if(token){

      //verifies secret and checks expiresIn
      jwt.verify(token, superSecret, function(err, decoded){
        if(err){
          return res.status(403).send({
            success: false,
            message: 'Failed to authenticate token.'
          });
        }
        else{
          //if everything is good, save to request for use in other routes
          req.decoded = decoded;

          next();
        }
      });
    }
    else{
      //if ther is no token
      //return an HTTP response of 403 (access forbidden) and an error message
      return res.status(403).send({
        success: false,
        message: 'No token provided'
      });
    }
  	//next(); used to be here
  });

  //test route to make sure everything is working
  //accessed  at GET http://localhost:3000/api
  apiRouter.get('/', function(req, res){
  	res.json({ message: 'HEY! Welcome to our api' });
  });


  apiRouter.route('/users')
  	//create a user (POST)
  	.post(function(req, res){

  		var user = new User();

  		//set the info from request

  		user.name = req.body.name;
  		user.username = req.body.username;
  		user.password = req.body.password;

  		//save the user and check for errors
  		user.save(function(err){
  			if(err){
  				//duplicate entry
  				if(err.code == 11000){
  					return res.json({ success: false, message:'A user with that username already exist' });
  				}

  				else{
  					return res.send(err);
  				}
  			}

  			res.json({ message:'User created!' });

  		});
  	})

  	.get(function(req, res){
  		User.find(function(err, users){
  			if(err) res.send(err);

  			//return all users
  			res.json( users );

  		})
  	});


  //Rutas para un sólo usuario!!!!
  apiRouter.route('/users/:user_id')
  	.get(function(req, res){

  		User.findById( req.params.user_id, function(err, user){
  			if(err){
  				res.send(err);
  			}
  			else{

  				res.json(user);

  			}
  		})
  	})

  	.put(function(req, res){
  		//use our model to find the user we want
  		User.findById( req.params.user_id, function(err, user){

  			if(err){
  				res.send(err);
  			}
  			//update the user's info only if its new
  			if(req.body.name){
  				user.name = req.body.name;
  			}
  			if(req.body.username){
  				user.username = req.body.username;
  			}
  			if(req.body.password){
  				user.password = req.body.password;
  			}

  			//save the user

  			user.save(function(err){
  				if(err){ res.send(err) }

  				res.json({ message: 'User updated!' });

  			})
  		})
  	})

    .delete(function(req, res){
      User.remove({
        _id : req.params.user_id
      }, function(err, user){
        if(err){ res.send(err) }

        res.json({ message: 'User deleted successfully' })

      });
    });

  return apiRouter;

};
