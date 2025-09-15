# Docker Images Database


> **Note:** This setup is intended for local deployment and testing only. Do not use these configurations for production environments.

This repository contains Docker Compose configurations for popular databases. Each database is organized in its own folder with a ready-to-use `docker-compose.yml` file.

## Structure

```
database/
  mongodb/
    docker-compose.yml
  mysql/
    docker-compose.yml
  postgres/
    docker-compose.yml
  redis/
    docker-compose.yml
  scripts/
    run-compose.sh
    run-compose.bat
  test-db/
    package.json
    test-connections.js
```

## Usage

### Running a Database with Docker Compose

#### On Linux/macOS
```sh
sh scripts/run-compose.sh <service-folder>
```
#### On Windows
```bat
call scripts\run-compose.bat <service-folder>
```
Replace `<service-folder>` with one of: `mongodb`, `mysql`, `postgres`, `redis`.

### Accessing pgAdmin (PostgreSQL GUI)

If you start the `postgres` service, pgAdmin will also be available for managing your PostgreSQL database.

#### How to Access pgAdmin:

1. Start the PostgreSQL service (see above).
2. Open your browser and go to: [http://localhost:5050](http://localhost:5050)
3. Login with:
  - **Email:** `admin@admin.com`
  - **Password:** `admin123`
4. Add a new server in pgAdmin:
  - **Host:** `postgres` (if inside Docker network) or `localhost` (if connecting from your host)
  - **Port:** `5432`
  - **Username:** `admin`
  - **Password:** `password`

#### Example Server Configuration in pgAdmin:

  | Field     | Value           |
  |-----------|-----------------|
  | Name      | postgres        |
  | Host      | localhost       |
  | Port      | 5432            |
  | Username  | admin           |
  | Password  | password        |

You can now manage your PostgreSQL database using the pgAdmin web interface.

### Accessing RedisInsight (Redis GUI)

If you start the `redis` service, RedisInsight will also be available for managing your Redis database.

#### How to Access RedisInsight

1. Start the Redis service (see above).
2. Open your browser and go to: [http://localhost:5540](http://localhost:5540)
3. In RedisInsight, click **Add Redis Database**.
4. Enter the following connection details:
    - **Host:** `redis`
    - **Port:** `6379`
    - **Username:** `default`
    - **Password:** `password`
5. Click **Test Connection** to connect.
6. Click **Add Redis Database** to connect.

#### Example Connection Configuration in RedisInsight

| Field     | Value     |
|-----------|-----------|
| Host      | redis     |
| Port      | 6379      |
| Username  | default   |
| Password  | password  |

You can now manage your Redis database using the RedisInsight web interface.

### Accessing Compass Web (MongoDB GUI)

If you start the `mongodb` service, Compass Web will be available for managing your MongoDB database.

#### How to Access Compass Web

1. Start the MongoDB service (see above).
2. Open your browser and go to: [http://localhost:8080](http://localhost:8080)

You can now manage your MongoDB database using the Compass Web interface.

### Accessing phpMyAdmin (MySQL GUI)

If you start the `mysql` service, phpMyAdmin will be available for managing your MySQL database.

#### How to Access phpMyAdmin

1. Start the MySQL service (see above).
2. Open your browser and go to: [http://localhost:8081](http://localhost:8081)

You can now manage your MySQL database using the phpMyAdmin web interface.

### Example
To start MySQL:
- Linux/macOS: `sh scripts/run-compose.sh mysql`
- Windows: `call scripts\run-compose.bat mysql`

## Testing Connections

You can use the Node.js script `test-db/test-connections.js` to test connections to the running databases.

### Usage

1. Make sure the target database container is running (see instructions above).

2. Install dependencies:

   ```sh
   cd test-db
   npm install
   ```


3. Run the test script:

  ```sh
  node test-connections.js
  ```


Or use the npm scripts defined in `test-db/package.json`:

#### Test All Databases
```sh
npm run test
npm run test:all
```

#### Test Individual Databases

**MongoDB**
```sh
npm run test:mongodb
```

**MySQL**
```sh
npm run test:mysql
```

**PostgreSQL**
```sh
npm run test:postgresql
npm run test:postgres   # Alias for PostgreSQL
```

**Redis**
```sh
npm run test:redis
```

The script will attempt to connect to each database and print the result to the console.


### Connection Strings

- **MongoDB**
  - URI: `mongodb://root:password@localhost:27017`
  - **Sample URI:**
    ```
    mongodb://root:password@localhost:27017/test
    ```
- **MySQL**
  - Host: `127.0.0.1`
  - Port: `3306`
  - User: `root`
  - Password: `password`
  - **Sample URI:**
    ```
    mysql://root:password@127.0.0.1:3306/<database-name>
    ```
- **PostgreSQL**
  - Host: `localhost`
  - Port: `5432`
  - User: `admin`
  - Password: `password`
  - **Sample URI:**
    ```
    postgres://admin:password@localhost:5432/<database-name>
    ```
- **Redis**
  - Host: `localhost`
  - Port: `6379`
  - Password: `password`
  - **Sample URI:**
    ```
    redis://:password@localhost:6379
    ```

### Requirements

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

See the script for details and configuration options.


## Requirements
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

For instructions on how to install Docker, see the official guide:
- [Install Docker (Official Documentation)](https://docs.docker.com/get-docker/)

## Author
- [riomar0001](https://github.com/riomar0001)