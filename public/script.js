let currentCardIndex = 0;
let flashcards = [];

function createFlashcardElement(flashcard) {
    const flashcardElement = document.createElement('div');
    flashcardElement.classList.add('flashcard');

    const front = document.createElement('div');
    front.classList.add('flashcard-content', 'front');
    front.textContent = `Q: ${flashcard.question}`;

    const back = document.createElement('div');
    back.classList.add('flashcard-content', 'back');
    back.textContent = `A: ${flashcard.answer}`;

    flashcardElement.appendChild(front);
    flashcardElement.appendChild(back);

    flashcardElement.addEventListener('click', () => {
        flashcardElement.classList.toggle('flipped');
    });

    return flashcardElement;
}

function displayFlashcards() {
    // ... the previous part of script.js ...

    const container = document.getElementById('flashcards-container');
    container.innerHTML = ''; // Clear the container before displaying new content

    if (flashcards.length > 0) {
        const cardElement = createFlashcardElement(flashcards[currentCardIndex]);
        container.appendChild(cardElement);
    } else {
        container.textContent = 'No flashcards available.';
    }
}

function addFlashcard(question, answer) {
    flashcards.push({ question, answer });
    currentCardIndex = flashcards.length - 1; // Set to the latest flashcard
    displayFlashcards();
}

document.getElementById('flashcard-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const question = document.getElementById('question').value.trim();
    const answer = document.getElementById('answer').value.trim();
    if (question && answer) {
        addFlashcard(question, answer);
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
    }
});

document.getElementById('prev').addEventListener('click', function() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayFlashcards();
    }
});

document.getElementById('next').addEventListener('click', function() {
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
        displayFlashcards();
    }
});

// Function to convert image to Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // We only need the Base64 content, not the entire Data URI
        reader.onerror = error => reject(error);
    });
}

// Handle the form submission for note upload
// document.getElementById('note-upload-form').addEventListener('submit', async function(e) {
//     e.preventDefault();
//     const fileInput = document.getElementById('note-image');
//     const statusMessage = document.getElementById('status-message');
//     if (fileInput.files.length > 0) {
//         statusMessage.textContent = "Generating flashcards...";
//         try {
//             const base64Image = await getBase64(fileInput.files[0]);
//             const response = await fetch('/generate-flashcards', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ image: base64Image })
//             });
//             console.log(3)
//             const data = await response.json();
//             console.log(4)

//             // You will need to handle this part according to how the flashcards are formatted in your data
//             flashcards = data.flashcards; // Assume that data.flashcards is an array of flashcards
//             currentCardIndex = 0;
//             displayFlashcards();
//             statusMessage.textContent = "Flashcards generated!";
//         } catch (error) {
//             console.error('Error:', error);
//             statusMessage.textContent = "Failed to generate flashcards.";
//         }
//     } else {
//         statusMessage.textContent = "Please upload an image first.";
//     }
// });
document.getElementById('note-upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('note-image');
    const statusMessage = document.getElementById('status-message');
    if (fileInput.files.length > 0) {
        statusMessage.textContent = "Generating flashcards...";
        try {
            const base64Image = await getBase64(fileInput.files[0]);
            const response = await fetch('/generate-flashcards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64Image })
            });
            const data = await response.json();

            if (data.choices && data.choices.length > 0 && data.choices[0].message && typeof data.choices[0].message.content === 'string') {
                // Find the JSON string within the message content
                const content = data.choices[0].message.content;
                const jsonStartIndex = content.indexOf('```json') + 7; // Locate the start of the JSON string
                const jsonEndIndex = content.lastIndexOf('```'); // Locate the end of the JSON string
                // Ensure we're not including the markdown syntax in our JSON string
                const jsonString = content.substring(jsonStartIndex, jsonEndIndex).trim();
                
                // Safely attempt to parse the JSON string
                try {
                    const parsedData = JSON.parse(jsonString);
                    console.log("hahaha, close");
                    // Use the addFlashcard function for each parsed flashcard
                    parsedData.flashcards.forEach(flashcard => {
                        addFlashcard(flashcard.front, flashcard.back);
                    });
                    statusMessage.textContent = "Flashcards generated!";
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    statusMessage.textContent = "Failed to generate flashcards. JSON parsing error.";
                }
            } else {
                // Handle unexpected content format
                console.error('Unexpected content format:', data);
                statusMessage.textContent = "Failed to generate flashcards. Unexpected content format.";
            }
        } catch (error) {
            // Handle other errors (e.g., network issues, server errors)
            console.error('Error:', error);
            statusMessage.textContent = "Failed to generate flashcards.";
        }
    } else {
        statusMessage.textContent = "Please upload an image first.";
    }
});



// Initialize the app with no flashcards
displayFlashcards();
