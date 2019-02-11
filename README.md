# Build a Private Blockchain Notary Service

In this project, I built a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.

## Project Rubric 

I implemented the project according to the Project Rubric [https://review.udacity.com/#!/rubrics/2098/view].

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Steps to test the project

1. Clone the repository to your local computer.
2. Open the terminal and install the packages: `npm install`.
3. Run your application and test your endpoints refer to the "Running the tests" section.



## Running the tests

The tests can be run with Postman or Curl. First open a command prompt or shell terminal, start the application:
```
node app.js
```

The following steps are to test code with Curl:

### Submits a validation request

1. Open a command prompt or shell terminal.
2. Enter the following request command by submitting a validation request to an API endpoint:
```
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"1L9cFhEwr1RWcfsGGFtZfwN5ExmBhRQpYi"
}'
```

### Send a message signature validation request 

1. Get the “message” returned in the previous step and use your electrum wallet to sign that message.
2. Open a command prompt or shell terminal.
3. Enter the following request command by submitting a validation request to an API endpoint, with the signature returned from step 1:
```
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"1L9cFhEwr1RWcfsGGFtZfwN5ExmBhRQpYi",
    "signature":"HwBYnzCLLSrYyBZh1JoPFrntVvIBzWxhY9Xea4rmDvK6RWEElaKZnJj6Dj9jlhevdOy91nbWdwUBYZbbFSxtOVA="
}'
```

### Send star data to be stored 

1. Open a command prompt or shell terminal.
2. Enter the following request command to submit the Star information to be saved in the Blockchain(escape "68° 52' 56.9"  to "68° 52'\'' 56.9"):
```
curl -X POST \
  http://localhost:8000/block \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"1L9cFhEwr1RWcfsGGFtZfwN5ExmBhRQpYi",
    "star": {"dec": "68° 52'\'' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
    }
}'
```

### Get star block by hash request 

1. Open a command prompt or shell terminal.
2. Enter the following request command with a block hash:
```
curl http://localhost:8000/stars/hash:28ef23df27f34a8e42ab0b43f653b669bae72a0046126e9346892bfe7423d09d
```

### GET Get star blocks by wallet address 

1. Open a command prompt or shell terminal.
2. Enter the following request command with a wallet address:
```
curl http://localhost:8000/stars/address:1L9cFhEwr1RWcfsGGFtZfwN5ExmBhRQpYi
```


### GET star block by height request 

1. Open a command prompt or shell terminal.
2. Enter the following request command with a block height, such as 0,1,2...
```
curl http://localhost:8000/block/1
```

