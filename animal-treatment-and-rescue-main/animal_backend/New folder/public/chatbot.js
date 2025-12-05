document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const chatbotCloseBtn = document.getElementById("chatbot-close-btn");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSendBtn = document.getElementById("chatbot-send-btn");
    const chatbotMessages = document.getElementById("chatbot-messages");

    // Toggle Chatbot Visibility
    chatbotToggle.addEventListener("click", () => {
        chatbotContainer.style.display = "flex";
        chatbotToggle.style.display = "none";
    });

    chatbotCloseBtn.addEventListener("click", () => {
        chatbotContainer.style.display = "none";
        chatbotToggle.style.display = "block";
    });

    // Send a message to the chatbot
    const sendMessage = async () => {
        const userMessage = chatbotInput.value.trim();
        if (!userMessage) return;

        // Display user message
        chatbotMessages.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;
        chatbotInput.value = "";

        // Fetch chatbot response from the server
        try {
            const response = await fetch("/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                chatbotMessages.innerHTML += `<div><strong>Chatbot:</strong> ${data.reply}</div>`;
            } else {
                chatbotMessages.innerHTML += `<div><strong>Chatbot:</strong> Sorry, I couldn't process your request.</div>`;
            }
        } catch (error) {
            chatbotMessages.innerHTML += `<div><strong>Chatbot:</strong> An error occurred. Please try again later.</div>`;
            console.error("Chatbot error:", error);
        }

        // Scroll to the bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    // Event Listeners
    chatbotSendBtn.addEventListener("click", sendMessage);
    chatbotInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
