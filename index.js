const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Make sure to replace 'Your_OpenAI_API_Key' with your actual OpenAI API key
const OPENAI_API_KEY = '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';

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' })); // Increase limit to accommodate large Base64 strings

app.post('/generate-flashcards', async (req, res) => {
    const { image } = req.body;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "I'm compiling a set of digital flashcards from my notes on [subject/topic], concentrating on the most critical concepts, terms, and theories necessary for a thorough understanding and examination preparation in this area. The intention is to distill the essence of the subject matter into concise, significant points for an efficient study process. Unlike traditional question-and-answer flashcards, each flashcard should simply introduce a term or concept on the front, with a detailed explanation or definition on the back. This method aligns with how flashcards on platforms like Quizlet facilitate focused learning but is tailored to ensure content relevance and depth. Consider the following structure as a guide for what I’m aiming for: * Example Flashcard 1:     * Front: Mitosis     * Back: A cell division process resulting in two genetically identical daughter cells, essential for growth and repair in organisms. * Example Flashcard 2:     * Front: Magna Carta     * Back: A charter of liberties signed in 1215 that limited the king's power in England, marking the beginning of constitutional governance. * Example Flashcard 3:     * Front: Supply and Demand     * Back: A fundamental economic model that explains how prices are determined in a competitive market, highlighting the importance of market dynamics. Please create a set of flashcards from the provided summarized notes, focusing on presenting a key term or concept on the front and a comprehensive explanation or definition on the back. Organize the flashcards in JSON format with a 'front and back' structure for each card, aiming for clarity and conciseness: {   'flashcards': [     {       'front': '[Term/Concept]',       'back': '[Explanation/Definition], emphasizing its significance in [Subject/Context].'     },     // Additional flashcards based on essential content   ] } The content should exclusively cover the most impactful and study-worthy material, avoiding trivial or non-essential information, to facilitate targeted learning and retention."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300
            })
        });
        const data = await response.json();
        res.json(data);
        console.log(data);

        console.log(data.choices[0].message);
    } catch (error) {
        console.error('OpenAI API request failed:', error);
        res.status(500).send('Error generating flashcards');
    }
    

});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));