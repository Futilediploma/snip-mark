document.addEventListener('DOMContentLoaded', function () {
    console.log('Popup loaded');

    document.getElementById('capture-fullscreen').addEventListener('click', captureFullscreen);
    document.getElementById('capture-window').addEventListener('click', captureWindow);
    document.getElementById('capture-area').addEventListener('click', captureArea);
});

function captureFullscreen() {
    console.log('Capture Fullscreen button clicked');
    chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, function(response) {
        if (response && response.screenshot) {
            console.log('Screenshot captured');
            openEditor(response.screenshot);
        } else {
            console.error('No screenshot captured');
        }
    });
}

function captureWindow() {
    console.log('Capture Fullscreen button clicked');
    chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, function(response) {
        if (response && response.screenshot) {
            console.log('Screenshot captured');
            openEditor(response.screenshot);
        } else {
            console.error('No screenshot captured');
        }
    });
}

// This function initiates the area selection
function captureArea() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: selectArea
        });
    });
}

// This script will be injected into the active tab
function selectArea() {
    let selectionBox = document.createElement('div');
    document.body.appendChild(selectionBox);
    selectionBox.style.cssText = `
        position: fixed;
        border: 2px dashed red;
        pointer-events: none;
        z-index: 10000;
    `;

    let startX, startY;
    document.addEventListener('mousedown', startDraw);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDraw);

    function startDraw(e) {
        startX = e.clientX;
        startY = e.clientY;
        updateBox();
    }

    function draw(e) {
        updateBox(e.clientX, e.clientY);
    }

    function stopDraw(e) {
        updateBox(e.clientX, e.clientY);
        document.removeEventListener('mousedown', startDraw);
        document.removeEventListener('mousemove', draw);
        document.removeEventListener('mouseup', stopDraw);
        document.body.removeChild(selectionBox);

        // Send a message back to the extension's background or popup script
        chrome.runtime.sendMessage({
            message: 'capture_area',
            area: {
                x: Math.min(startX, e.clientX),
                y: Math.min(startY, e.clientY),
                width: Math.abs(e.clientX - startX),
                height: Math.abs(e.clientY - startY)
            }
        });
    }

    function updateBox(x = startX, y = startY) {
        selectionBox.style.left = `${Math.min(x, startX)}px`;
        selectionBox.style.top = `${Math.min(y, startY)}px`;
        selectionBox.style.width = `${Math.abs(x - startX)}px`;
        selectionBox.style.height = `${Math.abs(y - startY)}px`;
    }
}

// Listener in popup.js to handle the selected area capture
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'capture_area') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = request.area.width;
                canvas.height = request.area.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, request.area.x, request.area.y, request.area.width, request.area.height, 0, 0, request.area.width, request.area.height);
                openEditor(canvas.toDataURL());
            };
            img.src = dataUrl;
        });
    }
});

// Function to open the captured image in a new window
function openEditor(dataUrl) {
    const editorWindow = window.open();
    editorWindow.document.write('<img src="' + dataUrl + '" style="width:100%;"/>');
}


function selectTool(toolName) {
    console.log(`Tool selected: ${toolName}`);
}

function saveImage() {
    console.log('Save image clicked');
}

function copyImage() {
    console.log('Copy to clipboard clicked');
}

function clearCanvas() {
    console.log('Clear canvas clicked');
}
