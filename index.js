const { Neo4jGraphQL } = require("@neo4j/graphql");
const { OGM } = require("@neo4j/graphql-ogm");
const { ApolloServer} = require("apollo-server");

const neo4j = require("neo4j-driver");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
require('dotenv').config();


const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
async function hashPassword(password, saltRounds = 10) {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash password
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.log(error);
    }

    // Return null if error
    return null;
}

async function comparePassword(password, hash) {
    try {
        // Compare password
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.log(error);
    }

    // Return false if error
    return false;
}

const typeDefs = `
    type User @exclude(operations: [CREATE, DELETE]) {
        id: ID @id
        username: String!
        password: String! @auth(rules: [{ allow: { id: "$jwt.sub" } }])
    }
 
    type Mutation {
        signUp(username: String!, password: String!): String! ### JWT
        signIn(username: String!, password: String!): String! ### JWT
    }
`;

const ogm = new OGM({ typeDefs, driver });
const User = ogm.model("User");

const resolvers = {
    Mutation: {
        signUp: async (_source, { username, password }) => {
            const [existing] = await User.find({
                where: {
                    username,
                },
            });

            if (existing) {
                throw new Error(`User with username ${username} already exists!`);
            }

            
             password = await hashPassword(password)
                const user = await User.create({
                    input: [
                        {
                            username,
                            password,
                        }
                    ]
                });
                return jwt.sign({ username: user.users[0].username, sub: user.users[0].id }, "secret");   
        },
        signIn: async (_source, { username, password }) => {
            const [user] = await User.find({
                where: {
                    username,
                },
            });

            if (!user) {
                throw new Error(`User with username ${username} not found!`);
            }
            let auth = await comparePassword(password, user.password);
            if (auth !== false || auth !== undefined || auth !== null) {
                return  jwt.sign({ username: user.username,  sub: user.id}, "secret");
            } else {
                throw new Error(`Incorrect password for user with username ${username}!`);
            }
         
        },
    },
};

const neoSchema = new Neo4jGraphQL({
    typeDefs,
    driver,
    resolvers,
    config: {
        jwt: {
            secret: "secret",
        },
    },
});

const server = new ApolloServer({
    schema: neoSchema.schema,
    context: ({ req }) => ({ req }),
});

server.listen({ port: process.env.GRAPHQL_SERVER_PORT}).then((service) => {
    console.log(`🚀 Server ready at ${JSON.stringify(service.url)}`);
});
