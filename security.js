/**
 * Security measures to prevent code inspection
 * This file implements various techniques to block developer tools access
 */

(function() {
    // Store the original console methods
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };

    // Function to detect if DevTools is open
    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        // Check if DevTools is open based on window dimensions
        if (widthThreshold || heightThreshold) {
            handleDevToolsOpen();
            return true;
        }
        
        return false;
    }

    // Function to handle when DevTools is detected
    function handleDevToolsOpen() {
        // Redirect or show warning
        document.documentElement.innerHTML = `
            <html>
            <head>
                <title>Access Denied</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #000;
                        color: #fff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .message {
                        background-color: #B00020;
                        padding: 20px;
                        border-radius: 5px;
                        max-width: 80%;
                    }
                    h1 {
                        margin-top: 0;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <h1>Access Denied</h1>
                    <p>Developer tools are not allowed on this website.</p>
                    <p>Please close developer tools and <a href="javascript:location.reload()" style="color: #fff;">refresh the page</a>.</p>
                </div>
            </body>
            </html>
        `;
    }

    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    }, false);

    // Disable keyboard shortcuts for developer tools
    document.addEventListener('keydown', function(e) {
        // F12 key
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+I (Chrome, Firefox, Edge)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+J (Chrome)
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
            e.preventDefault();
            return false;
        }

        // Ctrl+Shift+C (Chrome)
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }

        // Ctrl+U (View source)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    }, false);

    // Detect DevTools using console.clear trick
    const devtools = {
        isOpen: false,
        orientation: undefined
    };

    // Override console methods to detect DevTools
    console.log = function() {
        if (arguments[0] === '%c') {
            devtools.isOpen = true;
            handleDevToolsOpen();
        }
        return originalConsole.log.apply(console, arguments);
    };

    // Check for DevTools periodically
    setInterval(function() {
        // Check using window dimensions
        if (detectDevTools()) {
            return;
        }

        // Check using debugger trick
        const startTime = new Date();
        debugger;
        const endTime = new Date();
        
        // If debugger takes too long, DevTools might be open
        if (endTime - startTime > 100) {
            handleDevToolsOpen();
        }

        // Check using console.log trick
        console.log('%c', 'font-size:0;');
    }, 1000);

    // Mobile-specific protections
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Disable pinch zoom (which can sometimes open inspection tools on mobile)
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // Disable various inspection APIs
    Object.defineProperty(window, 'console', {
        get: function() {
            if (detectDevTools()) {
                return {
                    log: function() {},
                    warn: function() {},
                    error: function() {},
                    info: function() {},
                    debug: function() {}
                };
            } else {
                return {
                    log: originalConsole.log,
                    warn: originalConsole.warn,
                    error: originalConsole.error,
                    info: originalConsole.info,
                    debug: originalConsole.debug
                };
            }
        }
    });

    // Disable source viewing
    document.addEventListener('DOMContentLoaded', function() {
        // Add CSS to prevent selection
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            
            /* Allow selection in specific elements like input fields */
            input, textarea {
                -webkit-user-select: text;
                -moz-user-select: text;
                -ms-user-select: text;
                user-select: text;
            }
        `;
        document.head.appendChild(style);
    });
})();