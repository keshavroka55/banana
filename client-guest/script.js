const API_URL = "http://localhost:5000/api/banana/question";


const questionImage =
    document.getElementById("questionImage");

const result =
    document.getElementById("result");

const scoreElement =
    document.getElementById("score");

const loading =
    document.getElementById("loading");

const answerButtons =
    document.querySelectorAll(".answer-button");

let correctAnswer = null;

let score = 0;


// ----------------------------------------
// Generate random wrong answers
// ----------------------------------------

function generateOptions(correctAnswer) {

    const options = new Set();

    // Always include the correct answer
    options.add(correctAnswer);


    // Generate 3 wrong answers
    while (options.size < 4) {

        // Generate a number close to the answer
        const variation =
            Math.floor(Math.random() * 11) + 1;

        const direction =
            Math.random() < 0.5 ? -1 : 1;

        const wrongAnswer =
            correctAnswer + (variation * direction);


        // Don't allow negative answers
        if (wrongAnswer < 0) {
            continue;
        }


        // Don't add the correct answer again
        if (wrongAnswer !== correctAnswer) {
            options.add(wrongAnswer);
        }
    }


    // Convert Set to Array
    const shuffledOptions =
        Array.from(options);


    // Shuffle options
    shuffledOptions.sort(
        () => Math.random() - 0.5
    );


    return shuffledOptions;
}


// ----------------------------------------
// Display answer options
// ----------------------------------------

function displayOptions(options) {

    answerButtons.forEach(
        (button, index) => {

            button.textContent =
                options[index];

            button.dataset.answer =
                options[index];

            button.disabled = false;

        }
    );
}


// ----------------------------------------
// Load question
// ----------------------------------------
async function loadQuestion() {

    try {

        console.log("Fetching question...");

        loading.style.display = "block";
        result.textContent = "";
        result.className = "result";

        const response = await fetch(API_URL);

        console.log("HTTP status:", response.status);

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const responseData = await response.json();

        console.log("Full API response:", responseData);

        if (!responseData.success) {
            throw new Error("API returned success:false");
        }

        const data = responseData.data;

        console.log("Question data:", data);

        correctAnswer = Number(data.solution);

        console.log(
            "Correct answer:",
            correctAnswer
        );

        questionImage.src = data.imageUrl;

        const options =
            generateOptions(correctAnswer);

        console.log(
            "Generated options:",
            options
        );

        displayOptions(options);

        console.log("Question loaded successfully.");

    } catch (error) {

        console.error(
            "Error loading question:",
            error
        );

        result.textContent =
            "Failed to load question.";

        result.className =
            "result wrong";

    } finally {

        loading.style.display = "none";

    }
}


// ----------------------------------------
// Check answer
// ----------------------------------------

function checkAnswer(userAnswer) {

    userAnswer =
        Number(userAnswer);


    console.log(
        "User answer:",
        userAnswer
    );

    console.log(
        "Correct answer:",
        correctAnswer
    );


    if (userAnswer === correctAnswer) {

        result.textContent =
            "Correct! 🎉";

        result.className =
            "result correct";


        score++;

        scoreElement.textContent =
            score;


        // Load next question
        setTimeout(() => {

            loadQuestion();

        }, 700);


    } else {

        result.textContent =
            "Wrong answer. Try again! ❌";

        result.className =
            "result wrong";

    }
}


// ----------------------------------------
// Button events
// ----------------------------------------

answerButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const userAnswer =
                button.dataset.answer;


            checkAnswer(userAnswer);

        }
    );

});


// ----------------------------------------
// Start game
// ----------------------------------------

loadQuestion();