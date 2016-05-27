/////////////////////
// DB MODEL : USER //
/////////////////////


/*
    Calling necessary modules
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/*
    Set up the new shema TicketShema
 */
var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    username: {
        type: String,
        trim: true
    },
    address: [{
        street: String,
        zipCode: String,
        city: String
    }],
    tel: String,
    password: String,
    provider: String, //the strategy used to register the user (local)
    created_at: Date,
    updated_at: Date
});

// THIS OPERATIONS HAPPEN BEFORE SAVING 

UserSchema.pre('save',
    function(next) {
        console.log("hash");
        // Hash the password before sending it to the database
        if (this.password) {
            var md5 = crypto.createHash('md5');
            this.password = md5.update(this.password).digest('hex');
        }
        // Save the Date of creation and updates
        var currentDate = new Date();
        this.updated_at = currentDate;
        if (!this.created_at)
            this.created_at = currentDate;

        next();
    }


);


/*
    Static method : findUniqueUsername -> return a possibleusername if this username
    doesn't already exist (return nothing if no parameters)
    propose a suffixe if the username already exists
 */


/*
    Save This schema as the model : User
 */
mongoose.model('User', UserSchema);