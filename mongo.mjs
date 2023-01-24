import pkg from 'mongoose';
const { Schema, model, connect, connection } = pkg;

//const password = process.argv[2]

const credentials = './X509-cert-5937728316090400738.pem'

const url = 'mongodb+srv://cluster0.l8og0gl.mongodb.net/Phonebook?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority'

const personSchema = new Schema({
    "name": String, 
    "number": String
  },)

const Person = model('Person', personSchema)

connect(url, {
    sslKey: credentials,
    sslCert: credentials,
  })
  .then((result) => {
    console.log('connected')

    if (process.argv.length < 3) {
        return Person
            .find({})
            .then(persons=> {
                console.log("phonebook:")
                persons.forEach(person => {
                    console.log(`${person.name} ${person.number}`)
                });
            })
    } else {
        const person = new Person({
            "name": process.argv[2], 
            "number": process.argv[3]
          })
      
          return person.save()
    }
  })
  .then(() => {
    console.log('closing connection')
    return connection.close()
  })
  .catch((err) => console.log(err))