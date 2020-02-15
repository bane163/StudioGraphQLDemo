var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const fs = require('fs');

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

getFromFile = (jsonFile) => {
    let rawData = fs.readFileSync('user.json');
    let parsedData = JSON.parse(rawData);
    return parsedData;
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
        return getFromFile('studio.json');
    },
    getUsers: () => {
        return getFromFile('user.json');
    },
    createUser: ({input}) => {
        let existingUsers = getFromFile('user.json');
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