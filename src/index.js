const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).send({error: 'User not found'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const id = uuidv4()

  const userExists = users.some(user => user.username === username)

  if(userExists) {
    return response.status(400).send({error: "User already exists"})
  } 

  const user = {
    id,
    name,
    username,
    todos:[]
  }

  users.push(user)

  return response.status(201).json(user)  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const idTodo = uuidv4()

  const todo = {
    id: idTodo,
    title,
    done: false, 
    deadline:new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)

  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const {id} = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0){
    return response.status(404).send({error: 'Todo não encontrado'})
  }

  const todo = user.todos[todoIndex]

  todo.title = title
  todo.deadline = deadline

  user.todos[todoIndex] = todo

  response.status(201).send(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0){
    return response.status(404).send({error: 'Todo não encontrado'})
  }

  const todo = user.todos[todoIndex]

  todo.done = true

  user.todos[todoIndex] = todo

  response.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex < 0){
    return response.status(404).send({error: 'Todo não encontrado'})
  }

  user.todos.splice(todoIndex, 1)

  response.status(204).send(user.todos)
});

module.exports = app;