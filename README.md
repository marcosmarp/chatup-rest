# ChatUp React client

## What's this?
This is the REST API for a chatrooms application. It's designed for the [ChatUp React client](https://github.com/marcosmarp/chatup-react/) but you can implement it with your own client.
You can find the stable release in the [ChatUp repo](https://github.com/marcosmarp/chatup/) (this one containes both the client and the API)

## License
This project is MIT licensed so use it freely without holding me accountable for his correct functionality.

## Contributions
Just open an issue or a PR, I'm open to anything that improves or adds new features to the project

# Available routes
All routes return and receive a JSON type data

## Users
### `POST` ../api/users/auth/register/
- Creates a new user
- Requires a `username` and `password` on body

### `POST` /api/users/auth/log-in/
- Authenticates an user
- Requires a 'username' and 'password' on body

### `POST` /api/users/auth/log-out/
- Ends an usser session

## Chatrooms
### `GET` /api/chatrooms/
- Returns all chatrooms in the db

### `POST` /api/chatrooms/
- Creates a new chatroom
- Requires an authenticad user in the session
- Requires a name and keywords on the body

### `GET` /api/chatrooms/`id`/
- Returns a chatroom by id

### `DELETE` /api/chatrooms/`id`/
- Deletes a chatroom by id

### `GET` /api/chatrooms/own/
- Returns all chatrooms in wich the authenticated user is active
- Requires an authenticated user in the session (logged in)

### `GET` /api/chatrooms/own/`selectCode`/
- Returns the selected chatroom between the user owned chatrooms
- Requires an authenticated user in the session (logged in)

### `DELETE` /api/chatrooms/own/`selectCode`/
- Delete the selected chatroom between the user owned chatrooms
- Requires an authenticated user in the session (logged in)


### `PUT` /api/chatrooms/own/`selectCode`/
- Removes the selected chatroom between the user owned chatrooms from the user (if the user is the creator of the chatroom, the chatroom will be deleted)
- Requires an authenticated user in the session (logged in)

### `GET` /api/chatrooms/`keyword`/`selectCode`/
- Returns the chatroom that match the keyword and the select code

### ´POST´ /api/chatrooms/`id`/chats/
- Creates a chat in a chatroom
- Requires an authenticated user in the session
- Requires a "content" in the body
