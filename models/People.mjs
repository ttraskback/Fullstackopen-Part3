import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import pkg from 'mongoose';
const { Schema, model, connect, connection } = pkg;

const url = process.env.MONGODB_URI
const credentials = process.env.MONGODB_CREDENTIALS
let connectionOptions = {}
if (credentials) {
  connectionOptions = {
    sslKey: credentials,
    sslCert: credentials,
  }
}
console.log('connecting to', url)

connect(url, connectionOptions)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new Schema({
  "name": {
    type: String,
    minLength: 3,
    required: true
  }, 
  "number": {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /^(\d{2,3}-\d*)|(\d{8,})/g.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  }
},)


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

export default model('Person', personSchema)