let backgroundImage = null;  // This will store the loaded background image

window.onload = function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let currentTool = null;
    let isDrawing = false;
    let startX, startY, textValue;

    // Setup initial context properties
    ctx.lineWidth = 5;
    ctx.font = '16px Arial';
    ctx.textBaseline = 'top';

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'loadImage') {
            const img = new Image();
            img.src = request.dataUrl;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                backgroundImage = img;  // Store the loaded image
            };
        }
    });

    // Text styling configuration
    document.getElementById('font-size').addEventListener('change', function() {
        ctx.font = ctx.font.replace(/\d+px/, this.value + 'px');
    });

    document.getElementById('font-bold').addEventListener('click', function() {
        toggleFontStyle(ctx, 'bold');
    });

    document.getElementById('font-italic').addEventListener('click', function() {
        toggleFontStyle(ctx, 'italic');
    });

    document.getElementById('font-underline').addEventListener('click', function() {
        toggleFontStyle(ctx, 'underline');
    });

    document.getElementById('color-picker').addEventListener('change', function() {
        ctx.strokeStyle = this.value;
        ctx.fillStyle = this.value;
    });

    // Tool selection
    document.getElementById('tool-Text').addEventListener('click', () => { currentTool = 'text'; });
    document.getElementById('tool-Arrow').addEventListener('click', () => { currentTool = 'arrow'; });
    document.getElementById('tool-Line').addEventListener('click', () => { currentTool = 'line'; });
    document.getElementById('tool-Square').addEventListener('click', () => { currentTool = 'rectangle'; });
    document.getElementById('tool-Circle').addEventListener('click', () => { currentTool = 'circle'; });

    // Save image logic
    document.getElementById('save-image').addEventListener('click', function() {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'annotated-image.png';
        link.click();
    });

    // Drawing logic
    canvas.addEventListener('mousedown', (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        isDrawing = true;

        if (currentTool === 'text') {
            textValue = prompt('Enter text:');
            if (textValue) {
                ctx.fillText(textValue, startX, startY);
            }
            isDrawing = false; // No dragging required for text
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;

        // Clear the canvas and redraw the background image
        if (backgroundImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }

        const mouseX = e.offsetX;
        const mouseY = e.offsetY;
        drawShape(ctx, currentTool, startX, startY, mouseX, mouseY);
    });

    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    // Additional shape functions
};

function drawShape(ctx, tool, startX, startY, mouseX, mouseY) {
    switch (tool) {
        case 'arrow':
            drawArrow(ctx, startX, startY, mouseX, mouseY);
            break;
        case 'line':
            drawLine(ctx, startX, startY, mouseX, mouseY);
            break;
        case 'rectangle':
            drawRectangle(ctx, startX, startY, mouseX - startX, mouseY - startY);
            break;
        case 'circle':
            drawCircle(ctx, startX, startY, Math.abs(mouseX - startX));
            break;
        case 'cloud':
            drawCloud(ctx, startX, startY, mouseX, mouseY);
            break;
    }
}

function toggleFontStyle(ctx, style) {
    let currentFont = ctx.font.split(' ');
    switch (style) {
        case 'bold':
            ctx.font = (currentFont.includes('bold') ? '' : 'bold ') + ctx.font.replace('bold', '');
            break;
        case 'italic':
            ctx.font = (currentFont.includes('italic') ? '' : 'italic ') + ctx.font.replace('italic', '');
            break;
        case 'underline':
            // Handle underline separately, perhaps by drawing a line beneath text
            break;
    }
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headlen = 10; // length of head in pixels
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawLine(ctx, fromX, fromY, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
}

function drawRectangle(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
}

function drawCircle(ctx, centerX, centerY, radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawCloud(ctx, startX, startY, mouseX, mouseY) {
    // Custom function to draw a cloud shape
    // Implement the cloud drawing logic here
}
