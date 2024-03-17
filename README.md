{
"log-driver": "json-file",
"log-opts": {
"max-size": "10m",
"max-file": "3",
"labels": "production_status",
"env": "os,customer"
}
}

{
"log-driver": "local",
"log-opts": {
"max-size": "10m"
}
}

{
"log-driver": "json-file",
"log-opts": {
"max-size": "10m",
"max-file": "3"
}
}

docker run \
 --log-driver local --log-opt max-size=10m \
 alpine echo hello world

docker volume prune

Check the disk space on your Docker host.
docker system df

## MongoDb configuration

- replicaset (to be able to use session and transactions for more secure operations)
- create user with password (envoveld configuration file and env variable modifications)

## Logging

- set global logger object
- costumize logger format
- set midleware logging

## GraphQl

- make filter type and implement related changes for Product filtering (could replace 'product', 'productByProducerId' and any new filter oriented query)
- solve 'products' query to return only with product items without producer field (currently solved by created new type, but this is not nice)
