// const express = require('express');
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');


// // Create a server:
// const app = express();

// // Create a schema and a root resolver:
// const schema = buildSchema(`
//     type Book {
//         title: String!
//         author: String!
//     }

//     type Query {
//         books: [Book]
//     }


// `);

// const rootValue = {
//     books: [
//         {
//             title: "The Name of the Wind",
//             author: "Patrick Rothfuss",
//         },
//         {
//             title: "Habbit of Mark",
//             author: "Mark Kajcsos",
//         },        
//         {
//             title: "The Wise Man's Fear",
//             author: "Patrick Rothfuss",
//         }
//     ]
// };

// // Handle incoming HTTP requests as before:
// app.use('/graphql', graphqlHTTP({
//     schema,
//     rootValue,
//     graphiql: true
// }));

// // Start the server:
// const server = app.listen(8000, () => console.log("Server started on port 8080"));
