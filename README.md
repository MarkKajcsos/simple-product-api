# Simple Product Api

# Intro

Short description: Build a simple GraphQL product api in TypeScript, which can manage product and producer entities using MongoDB.

@Side note: Current repo made as an interview excercise.

## Preparation

- Download current repo

```bash
git clone https://github.com/MarkKajcsos/simple-product-api.git
```

## Run

#### Build and start

- Go to root folder of the project
- Run the following command to build images and start containers

```bash
docker-compose up --build
```

#### Open Graphql viewer

- After both (mongodb and single_product_api) started, open [http://localhost/graphql](http://localhost/graphql)
- You can find and try out some sample query and mutation from [resources](./resources/) folder.

#### MongoDB inspection

- Run the following command to access mongodb docker container.

```bash
docker exec -it mongodb mongosh
```

- Change the db to _public_

```bash
use public
```

- There are two collection in _public_ collection: _products_ and _producers_

---

## Thinks that could be improved

#### Docker

- Change command in Docker file from 'npm run dev' to 'npm start'
  Currently the _single_product_api_ run by _nodemon_.
- Set enviroment variable instead of store all settings in [configuration](./resources/configuration.yaml) file.

#### Express, NodeJs

- Handle special process events like []
- Advanced setup of Express server.

#### MongoDb

- Find solution to load _producer_ doc into Product.producer field witout data duplication. The _polulate_ and _aggregate_ functions have been tried out without success.
- Prepare replicaset of mongodb instances (to be able to use session and transactions for more secure operations)
- Create new db user with password (envoveld configuration file and env variable modifications)

#### Logging

- Set global logger object
- Costumize logger output format
- Set midleware logging

#### GraphQl

- Make filter type and implement related changes for Product filtering (could replace 'product', 'productByProducerId' and any new filter oriented query)
- Solve 'productsByProducerId' query to return only with product items without producer field (currently solved by created new type (_ProductWithoutProducer_) in schema, but this is not nice)

### General

- Create custom Error interfaces and extend to be used at different places.
