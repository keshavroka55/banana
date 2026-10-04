# 🍌 Banana Math Game

The game uses the **Banana API** to generate random image-based math questions. The player selects an answer from four options and receives immediate feedback while their score is tracked.

**Live Demo:** https://banana-game-rouge.vercel.app/

---

## Features

* Random math questions from the Banana API
* Four multiple-choice answers
* Automatically generated incorrect answers
* Correct and incorrect answer feedback
* Score tracking
* Responsive design for mobile and desktop
---

## Technologies

* HTML5
* CSS3
* JavaScript
* Node.js
* Banana API
* Git & GitHub
* Vercel

---

## How It Works

1. The game requests a new question from the Banana API.
2. The API returns a question image and its correct solution.
3. JavaScript generates three incorrect answers.
4. The four answers are displayed as buttons.
5. The player selects an answer.
6. The answer is checked against the API solution.
7. The score increases when the answer is correct.
8. A new question is loaded automatically.

---

## Assignment Themes

This project was developed for **CIS046-3 Software For Enterprise** and is designed around the four themes required by the assignment.

### 1. Version Control

Git and GitHub are used to manage the development of the project.

Version control allows changes to the HTML, CSS and JavaScript files to be tracked and provides a history of the development process.

It also helps keep the project organised into separate components.

### 2. Event-Driven Programming

The game uses JavaScript events to respond to user actions.

For example, when a player clicks an answer button, an event listener calls the answer-checking function.

```javascript
button.addEventListener("click", () => {
    checkAnswer(button.dataset.answer);
});
```

The game also uses asynchronous events when communicating with the external API.

### 3. Interoperability

The game communicates with an external service through the **Banana API**.

JavaScript sends an HTTP request to the API and receives data in JSON format.

```text
JavaScript Game
       ↓
    HTTP Request
       ↓
   Banana API
       ↓
   JSON Response
       ↓
Question + Solution
```

This demonstrates how software components developed independently can communicate through a common interface.

### 4. Virtual Identity

Virtual identity is an important theme of the assignment.

The current version of the game does not use user accounts, passwords or cookies. The player's score is currently maintained only during the active browser session.

Authentication and persistent user identity can therefore be considered as a possible extension of the application.

---

## Banana API

The game uses the Banana API provided by the University of Bedfordshire example resources.

API:

https://marcconrad.com/uob/banana/api.php

Documentation:

https://marcconrad.com/uob/banana/doc.php

The API provides a question image and its corresponding solution.

---


## Assignment

**Unit:** CIS046-3 Software For Enterprise

**Assignment:** 1

**Assessment:** Individual artifact submission and video

**Video:** Maximum 10 minutes

The video should demonstrate the working system and discuss:

* Version Control
* Event-Driven Programming
* Interoperability
* Virtual Identity

The assignment also requires the full working source code to be submitted as supporting material.

---

## Author

**Keshav Roka**

BSc Software Engineering
