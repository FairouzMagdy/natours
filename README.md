<div align="center">
  <img src="/public/img/logo-green-round.png" alt="Description of the image" width="220" height="220">
</div>

<h1 align="center">Natours - Tour Management System</h1>

## Overview

This project is a comprehensive tour management system developed using Node.js, Express, and MongoDB. It provides features such as authentication, user profiles, tour management, booking functionality, reviews, and credit card payment integration.

## Features

- **Authentication and Authorization**: Users can sign up, log in, log out, update their information, reset their password and verify their email. Different user roles are supported: regular user, admin, lead guide, and guide..
- **User Profiles**: Users can update their profile details including username, photo, email, and password.
- **Tour Management**: Admin users or lead guides can create, update, and delete tours. Users can view tour details, book tours, and check reviews and ratings.
- **Booking Functionality**: Only regular users can book tours, and they cannot book the same tour twice. Admin users or lead guides have access to all bookings and can create, edit, or delete bookings.
- **Reviews**: Regular users can write reviews for tours they have booked, which can be edited or deleted. Admins can delete any review. Users cannot review the same tour twice.
- **Credit Card Payment Integration**: The system supports credit card payments for tour bookings.
  
## Technologies Used

- NodeJS - JS runtime environment
- Express - The web framework used
- Mongoose - Object Data Modelling (ODM) library
- MongoDB Atlas - Cloud database service
- JSON Web Token - Security token
- Stripe - Online payment API and Making payments on the app.
- Postman - API testing
- Mailtrap - Email delivery platform

## Installation

1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables.
4. Run the application: `npm start`

## Future Updates

- **Customized Tours**: Allow users to create their customized tours and wait for a tour guide to respond.
- **Chat Room**: Implement a chat room feature for users to communicate with tour guides.
- **Notifications for Chat**: Add notifications for new messages in the chat room.
- **Persistent Login**: Implement refresh tokens to keep users logged in.

## API Documentation

The API documentation can be found [here](https://documenter.getpostman.com/view/21905610/2sA3JM8hMK).
