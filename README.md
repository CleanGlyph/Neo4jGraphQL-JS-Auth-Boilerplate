# Boilerplate Neo4jGraphQL-JS-Auth 
Simple Neo4j GraphQL Server with basic auth in Node.js to get started and hopefully not spend most your time on configuration 

## Installing

### 1. Get node packages downloaded
```bash
npm install
```
### 2. Set up your .env

Use the ._env as an example inside the folder, where you just need to add the Neo4j connection info.

### 2.1 Finding your Neo4j Connection info

Go to the settings file following [neo4j docs](https://neo4j.com/docs/operations-manual/current/configuration/connectors/), you can find your `bolt` connection settings to `ctrl + f`.

- dbms.connector.bolt.enabled => should be true
- dbms.connector.bolt.listen_address => copy this address 
- dbms.connector.bolt.advertised_address => **OR** copy this address


Once found & enabled then copy paste the address into your .env

## Running 

### Dev mode with hotreloads
```bash
npm run dev
```

### 'Production'

```bash
npm run start
```
