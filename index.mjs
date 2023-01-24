
import express, { json } from 'express'
import morgan from 'morgan'
import People from './models/People.mjs'
const app = express()
app.use(express.static('build'))
app.use(json())


morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  People.find({}).then(persons => {
    response.json(persons)
  })
})

/**
 * Get person based on id
 */

app.get('/api/persons/:id', (request, response, next) => {
  People.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

/**
 * Update person based on id
 */

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }


  People.findByIdAndUpdate(
    request.params.id,
    {
      number: body.number,
    },
    { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

/**
 * Delete person based on id
 */

app.delete('/api/persons/:id', (request, response, next) => {
  People.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/**
 * Create new person
 */

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  let person = new People({
    name: body.name,
    number: body.number,
  })

  person.save().then(person => {
    return response.json(person)
  }).catch(error => next(error))
})

app.get('/info', (request, response) => {
  let date = new Date().toLocaleString();
  People.find({}).then(persons => {
    response.send(`<p>Phonebook has info of ${persons.length}!</p> <p>${date}</p>`)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: `unknown endpoint ${request.path}` })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.name + ": " + error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


console.log(process.env.PORT)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
