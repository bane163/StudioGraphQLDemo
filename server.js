var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const fs = require('fs');
const _ = require('lodash');

var schema = buildSchema(`
    type Query {
        getStudios: [Studio]
        getUsers: [User]
    }

    type Mutation {
        createUser(input: UserInput): User
    }

    type Studio {
        id: ID
        name: String
        region: String
        department: String
        users: [User]
    }

    type User {
        id: ID
        name: String
        title: String
        studio: Studio
    }

    input UserInput {
        name: String
        title: String
        studio: StudioInput
    }

    input StudioInput {
        name: String
        region: String
        department: String
        users: [UserInput]
    }
`)

getUsersFromFile = () => {
    let rawData = fs.readFileSync('user.json');
    let users = JSON.parse(rawData);
    return users;
}

class User {
    constructor(id, {name, title, studio}) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.studio = studio;
    }
}

var root = {
    getStudios: () => {
        let rawData = fs.readFileSync('studio.json');
        let studios = JSON.parse(rawData);
        return studios;
    },
    getUsers: () => {
        return getUsersFromFile();
    },
    createUser: ({input}) => {
        let existingUsers = getUsersFromFile();
        let count = existingUsers.length + 1;
        let newUser = new User(count,input);
        existingUsers.push(newUser);
        fs.writeFileSync('user.json', JSON.stringify(existingUsers,null,2));
        return newUser;
    }
};

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql:true,
}));
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");