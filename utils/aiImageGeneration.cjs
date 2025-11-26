const ai = require('../config/geminiAi')
const { Modality } = require('@google/genai')
const fs = require('fs')
const path = require('path')

async function generateImagePrompt(title, content) {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${title}, ${content}`,
        config: {
            systemInstruction: "You are a prompt engineer for an AI image generation system. Your task is to read a user's post — which includes a title and a description or body — and generate a single, detailed image description that could be used to create a relevant, high-quality illustration or photo using an image generation model like DALL·E or Gemini Image API. Your output must be a prompt for an AI image generator. Do not refer to the post title or content directly (e.g., don't say 'an image about the post' or 'as described above'). Describe the image visually and vividly, capturing key themes, people, settings, moods, actions, and aesthetics present in the post. Use neutral or artistic camera angles, color tones, and emotional cues where appropriate (e.g., 'a serene sunset in a mountain valley'). Keep the prompt between 30 to 60 words. Avoid abstract or symbolic interpretations; make the image literal, visual, and usable for social media preview. Do not include text in the image. Do not generate NSFW or violent content. Output Format: Return only the final image prompt, nothing else.",
        },
    });
    console.log(response.text);
    return response.text
}

//     let imagePrompt = await generateImagePrompt('First Post on Write It', "Welcome to Write It — a space built for writers, thinkers, and creators who believe that words matter more than noise. This is our first post, and we wanted to use it not just to mark the beginning, but to also tell you who we are, what we do, and why we exist. In a world crowded with flashy designs, algorithmic feeds, and distractions, Write It stands for something different — simplicity. We are not trying to impress you with animations or overwhelm you with features. Instead, our goal is to give you a clean, focused space where content comes first, where thoughts have room to breathe, and where functionality is always prioritized over flair. We believe that writing is powerful. Whether it's a blog post, a journal entry, or a story you've held onto for years — your words deserve a home. And Write It is built to be exactly that: a minimal, fast, and distraction-free writing platform. We don’t rely on trends. We don’t bombard users with pop-ups or track every click. We’ve stripped away everything that doesn’t serve the act of writing and sharing. No clutter. No chaos. Just you and your words. One of the core ideas behind Write It is minimal design with all the core values around functionality. That means when you post something, it’s easy to do. When you read something, it’s easy to focus. You don’t have to worry about formatting tools you don’t need. You don’t have to wonder where your words go. Every element of Write It has a reason to exist — and if it doesn’t, we remove it. You may have already noticed this philosophy in our interface. Posts are clean, with just the essentials: a title, a body, an author, and a date. That’s it. No like counters screaming for attention. No hidden settings. Just honest content. We know some platforms try to do everything. We don’t. Instead of throwing a hundred features at you, we focus on doing a few things well: writing, reading, and sharing. That’s our foundation. And every improvement we make in the future will respect that foundation. What differentiates Write It is not just how minimal it looks, but how intentional it is. Every part of it is designed for a reason — to support clarity, expression, and flow. We don’t want your creativity to be slowed down by too many buttons or options. We want the tool to fade into the background, so the writing can shine. As we grow, we’ll keep listening to our community. We’re open to ideas, to feedback, to stories about how people are using Write It in their lives. But we’ll always stay rooted in our core principles: minimalism, speed, usability, and above all — respect for your content. So here’s to beginnings. This is the first post on Write It, but not the last. We hope it marks the start of something valuable — for you, and for anyone who chooses to express themselves through words. Thank you for being here. Welcome to Write It." )

async function generateImage(imagePrompt) {
    // Set responseModalities to include "Image" so the model can generate an image
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: imagePrompt,
        config: {
            responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        // Based on the part type, either show the text or save the image
        if (part.text) {
            console.log(part.text);
        } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, "base64");
            const fileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png'
            console.log(fileName);
            const filePath = path.join(__dirname, '../public/images/uploads', fileName)
            console.log(filePath);
            fs.writeFileSync(filePath, buffer);
            console.log(`Gemini image saved as ${fileName}`);
            return {filePath, fileName}
        }
    }
}

async function generate(title, content) {
    const imagePrompt = await generateImagePrompt(title, content)
    const imagePath = await generateImage(imagePrompt)
    return imagePath
}

module.exports = generate