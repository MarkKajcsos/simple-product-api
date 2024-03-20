# Simple Product Api

## Intro

Short description: Build a simple GraphQL product api in TypeScript, which can manage product and producer entities using MongoDB.

@Side note: Current repo made as an interview excercise.

## Requirements

- Git
- Docker

## Preparation

### Use Docker

##### Step1: Clone

```bash
git clone https://github.com/MarkKajcsos/simple-product-api.git
```

##### Step2: Build and start

- Go to root folder of the project
- Run the following command to build images and start containers

```bash
docker-compose up --build
```

##### Step3: Test queries and mutations

After both (mongodb and single_product_api) started and express server has been logged next `express_server  | Server is running at http://localhost:3000/graphql`.

Use [GraphQL plugin (VS Code)](https://marketplace.visualstudio.com/items?itemName=orsenkucher.vscode-graphql)

- After installig the plugin you need to set up the configurations

Use [GraphiQL](https://docs.spring.io/spring-graphql/reference/graphiql.html) IDE from browser

- Open [http://localhost/graphql](http://localhost/graphql) in your browser.

Both case you can find and try out some sample query and mutation from [resources](./resources/) folder.

##### Step4: Access MongoDB container

- Run the following command to access mongodb docker container.

```bash
docker exec -it mongodb mongosh
```

- Change the db to _public_

```bash
use public
```

There are two collections in _public_ db:

- _products_
- _producers_.

---

## List of considered improvements in further steps and know issues

#### Docker

- Change command in Docker file from 'npm run dev' to 'npm start'
  Currently the _single_product_api_ run by _nodemon_.
- Create an _.env_ file and set enviroment variable instead of store all settings in [configuration](./resources/configuration.yaml) file.

#### Express, NodeJs

- Advanced setup of Express server.
- Create custom Error interfaces and extend to be used at different places.
- Resourcer folder should not be part of the repo, especially the configuration file.
- Create next endpoints:
  - _/health_ : see the current status of service
  - _/root_ : return application info
- Change _express-graphql_ npm package to _graphql-http_.

#### MongoDb

- Find solution to load _producer_ doc into Product.producer field witout data duplication. The _polulate_ and _aggregate_ functions have been tried out without success.
- Prepare replicaset of mongodb instances (to be **able to use session and transactions** for more secure operations)
- Create new db user with password (invoveld configuration file and env variable modifications)

#### Logging

- Set middleware logging

#### GraphQl

- Make filter type and implement related changes for Product filtering (could replace 'product', 'productByProducerId' and any new filter oriented query)
- Solve 'productsByProducerId' query to return only with product items without producer field (currently solved by created new type (_ProductWithoutProducer_) in schema, but this is not nice)
