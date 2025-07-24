const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('params', function (req, res) { return JSON.stringify(req.body) })

let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "phone": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "phone": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "phone": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "phone": "39-23-6423122"
    }
]

const randomID = () => {
    const random = Math.floor(Math.random() * 100000)
    return random
}

const logger = morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.params(req)
  ].join(' ')
})

app.use(logger)

app.get('/info', (request, response) => {
    response.send(`Phonebook has info for ${contacts.length} people.
        <br/>
        ${new Date()}
    `)
})

app.get('/api/persons', (request, response) => {
    response.json(contacts)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = contacts.find(p => p.id === id)

    person ? response.json(person) : response.status(404).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    
    if (!body.name || !body.phone) {
        return response.status(400).json({ 
            error: 'content missing' 
        })
    }
    
    const duplicate = contacts.find(contact => contact.name === body.name)

    if(duplicate){
        return response.status(400).json({ 
            error: 'Name must be unique.' 
        })
    }

    const contact = {
        id: randomID(),
        name: body.name,
        phone: body.phone
    }

    contacts = contacts.concat(contact)

    response.json(contact)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    contacts = contacts.filter(contact => contact.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
