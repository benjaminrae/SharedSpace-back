# SharedSpace

## Links

### Front

- [repo](https://github.com/isdi-coders-2022/Benjamin-Rae_Front-Final-Project-202209-BCN)
- [prod](https://benjamin-rae-front-final-project-2022.netlify.app/)

### Back

- [repo](https://github.com/isdi-coders-2022/Benjamin-Rae_Back-Final-Project-202209-BCN)
- [prod](https://benjamin-rae-back-final-project-202209.onrender.com/)

## Endpoints

### User

#### POST /user/register

- create an account in the application
- response 201
- no response body

#### POST /user/login

- fetch user token
- response 200
- token in response body

### Locations

#### GET /locations

- fetch a list of locations
- response 200
- locations list in response body

#### GET /locations/location/:locationId

- fetch a single location
- response 200
- location in response body

#### GET /locations/filter/:filter

- fetch a list of locations that match filter
- response 200
- locations list in response body

## Protected endpoints

### Locations

#### POST /locations/add-location

- submit a new location to the database
- response 201
- send new location in multipart/form-data
- new location in response body

#### DELETE /locations/location/:locationId

- delete a location from the database
- response 200
- deleted location in response body

#### PUT /locations/edit-location/:locationId

- update a location’s information
- response 201
- send changes in multipart/form-data
- updated location in response body

#### GET /locations/my-locations

- fetch a list of your own locations
- response 200
- locations list in response body
