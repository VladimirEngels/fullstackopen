const mongoose = require('mongoose')

const url = 'mongodb://127.0.0.1:27017/phonebook'

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 2) {
  Person.find({}).then(persons => {
    console.log('phonebook:')
    persons.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 4) {
  const person = new Person({
    name: process.argv[2],
    number: process.argv[3]
  })

  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('usage: node mongo.js <name> <number>')
  console.log('or just node mongo.js to list all')
  mongoose.connection.close()
}
