// Professional Chat Application with modern features and enhanced UX

// jQuery Document Ready Function - runs when HTML is fully loaded
$(document).ready(function() {
    
    // Object Literal Declaration - creates a JavaScript object to organize all app functionality
    const ChatApp = {
        
        // Object Property - stores all application state/data
        state: {
            // String properties with default values
            username: 'Jakia',           // User's display name
            userStatus: 'online',       // User's current status
            theme: 'dark',             // UI theme preference
            fontSize: 'medium',        // Text size preference
            
            // Boolean properties (true/false values)
            soundEnabled: true,         // Whether to play sounds
            notificationsEnabled: false, // Whether to show notifications
            
            // Array properties to store data collections
            messageHistory: [],         // Array to store all messages
            
            // Number properties for tracking
            messageCount: 0,           // Total number of messages sent
            sessionStartTime: Date.now(), // Timestamp when session started
            
            // Boolean and null for typing features
            isTyping: false,           // Whether user is currently typing
            typingTimeout: null        // Stores timeout reference for typing indicator
        },
        
        // Object Property containing nested objects - organized response categories
        botResponses: {
            // Each property contains an array of possible responses
            casual: [
                "That's really interesting! 🤔",
                "I see what you mean there.",
                "Tell me more about that topic!",
                "How do you feel about that?",
                "That reminds me of something similar I heard.",
                "Great perspective! 👍",
                "I hadn't thought of it that way before.",
                "What would you do in that situation?",
                "That's a really good question to ask.",
                "I totally agree with your point!"
            ],
            supportive: [
                "That sounds challenging, but you've got this! 💪",
                "I believe in your ability to handle this.",
                "You're making great progress!",
                "That's a smart approach to the problem.",
                "Keep up the excellent work!",
                "Your perspective is really valuable."
            ],
            curious: [
                "Can you elaborate on that idea?",
                "What inspired you to think about this?",
                "That's fascinating! What happened next?",
                "How did you come to that conclusion?",
                "What are your thoughts on the bigger picture?",
                "I'm curious about your experience with this."
            ]
        },

        // Emoji sets for quick access
        emojis: ['😊', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '😎', '🙌'],

        // Object Method Definition - function that belongs to this object
        init() {
            // Method calls - executes other methods in this object
            this.setupEventHandlers();    // 'this' refers to the ChatApp object
            this.initializeDialogs();
            this.loadSettings();
            this.startSessionTimer();
            this.addWelcomeMessage();
            this.requestNotificationPermission();
            this.initializeTheme();
            this.setupKeyboardShortcuts();
        },

        // Method Definition with no parameters
        setupEventHandlers() {
            // jQuery Event Binding - attaches click event to element with ID 'send-btn'
            $('#send-btn').click(() => this.sendMessage());
            
            // jQuery Chaining - multiple event handlers on same element
            $('#message-input')
                // .on() method binds event handlers
                .on('input', (e) => this.handleInput(e))     // Arrow function syntax
                .on('keydown', (e) => this.handleKeyDown(e)) // 'e' is event parameter
                .on('paste', (e) => this.handlePaste(e));
            
            // More jQuery event bindings using CSS ID selectors
            $('#settings-btn').click(() => this.openSettings());
            $('#theme-toggle').click(() => this.toggleTheme());
            $('#clear-chat').click(() => this.clearChat());
            $('#search-btn').click(() => this.openSearch());
            $('#emoji-btn').click(() => this.showEmojiPicker());
            
            // Window-level events using jQuery
            $(window).on('beforeunload', () => this.saveSession());
            
            // setInterval() - executes function repeatedly every 30 seconds (30000ms)
            setInterval(() => this.saveSettings(), 30000);
        },

        // Method that configures jQuery UI dialog boxes
        initializeDialogs() {
            // jQuery UI Dialog initialization with configuration object
            $('#settings-dialog').dialog({
                autoOpen: false,        // Boolean - don't show immediately
                width: 500,            // Number - dialog width in pixels
                height: 600,           // Number - dialog height in pixels
                modal: true,           // Boolean - blocks interaction with page
                resizable: false,      // Boolean - prevents resizing
                draggable: true,       // Boolean - allows dragging
                
                // buttons property - object defining dialog buttons
                buttons: {
                    // Button name as key, function as value
                    "Save Settings": () => {
                        this.saveSettings();                    // Method call
                        $('#settings-dialog').dialog("close");  // jQuery UI method call
                        // Method call with two parameters (message, type)
                        this.showNotification('Settings saved successfully!', 'success');
                    },
                    "Cancel": () => {
                        $('#settings-dialog').dialog("close");
                    }
                }
            });

            // Second dialog configuration
            $('#search-dialog').dialog({
                autoOpen: false,
                width: 400,
                height: 500,
                modal: true,
                resizable: false,
                buttons: {
                    "Close": () => {
                        $('#search-dialog').dialog("close");
                    }
                }
            });

            // Event binding with property access chain
            $('#search-input').on('input', (e) => this.performSearch(e.target.value));
        },

        // Method with parameter - 'e' is the event object
        handleInput(e) {
            // Destructuring assignment - extracts 'target' property from event
            const input = e.target;
            // Property access - gets the 'value' property
            const value = input.value;
            
            // Template literal (backticks) with expression interpolation
            $('#chat-input-container .char-count').text(`${value.length}/500`);
            
            // jQuery prop() method to set element properties
            // Ternary operator: condition ? trueValue : falseValue
            $('#send-btn').prop('disabled', value.trim().length === 0);
            
            // Direct DOM manipulation through jQuery element
            input.style.height = 'auto';
            // Math.min() returns smaller of two values
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            
            // Method call
            this.showTypingIndicator();
        },

        // Method handling keyboard events
        handleKeyDown(e) {
            // Conditional statement with logical AND operator
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();  // Prevents default browser behavior
                this.sendMessage();
            }
            
            // Conditional with logical OR operator
            if (e.ctrlKey || e.metaKey) {
                // Switch statement for multiple conditions
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.openSearch();
                        break;          // Exits switch statement
                    case ',':
                        e.preventDefault();
                        this.openSettings();
                        break;
                }
            }
        },

        // Method with event parameter
        handlePaste(e) {
            // setTimeout() delays function execution
            setTimeout(() => {
                this.handleInput(e);  // Call method after timeout
            }, 0);  // 0ms delay - runs after current execution completes
        },

        // Method with no parameters
        sendMessage() {
            // jQuery val() method gets input value, trim() removes whitespace
            const messageText = $('#message-input').val().trim();
            
            // Early return pattern - exits function if condition is true
            if (messageText === '') return;

            // Conditional method call with return
            if (this.handleCommand(messageText)) {
                $('#message-input').val(''); // Clear input
                return;
            }

            // Method call with object parameter
            this.addMessage({
                user: this.state.username,    // Property access
                text: messageText,
                type: 'own',
                timestamp: new Date()          // Date constructor creates new date
            });
            
            // DOM manipulation through jQuery
            const input = $('#message-input')[0];  // [0] gets native DOM element
            input.value = '';                      // Direct property assignment
            input.style.height = 'auto';
            
            // jQuery chaining with prop() method
            $('#send-btn').prop('disabled', true);
            $('#chat-input-container .char-count').text('0/500');
            
            // Array push() method adds element to end
            this.state.messageHistory.push({
                user: this.state.username,
                text: messageText,
                timestamp: new Date(),
                type: 'own'
            });

            // Increment operator increases value by 1
            this.state.messageCount++;
            this.updateStats();
            
            // Conditional execution
            if (this.state.soundEnabled) {
                this.playSound('send');  // Method call with string parameter
            }
        },

        // Method with object parameter using destructuring
        addMessage(messageData) {
            // Destructuring assignment extracts properties from object
            const { user, text, type, timestamp } = messageData;
            
            // Method chaining on Date object
            const time = timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // String method charAt() gets character at index, toUpperCase() converts to capital
            const userInitial = user.charAt(0).toUpperCase();
            
            // Template literal with embedded expressions and HTML
            const messageHtml = `
                <div class="message ${type}" data-timestamp="${timestamp.getTime()}">
                    <div class="message-avatar">${userInitial}</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">${this.escapeHtml(user)}</span>
                            <span class="message-time">${time}</span>
                        </div>
                        <div class="message-bubble">
                            ${this.formatMessage(text)}
                        </div>
                    </div>
                </div>
            `;
            
            // jQuery append() adds HTML to end of element
            $('#chat-messages').append(messageHtml);
            this.scrollToBottom();
            
            // jQuery chaining: last() gets last element, hide() hides it, fadeIn() animates appearance
            $('.message').last().hide().fadeIn(300);
            
            // Complex conditional with logical AND operators
            if (type === 'other' && this.state.notificationsEnabled && document.hidden) {
                this.showDesktopNotification(user, text);
            }
        },

        // Method that processes and formats message text
        formatMessage(text) {
            // Variable assignment with method call
            let formatted = this.escapeHtml(text);
            
            // String replace() method with regular expression
            formatted = formatted.replace(
                /(https?:\/\/[^\s]+)/g,  // Regular expression pattern with global flag
                '<a href="$1" target="_blank" rel="noopener">$1</a>'  // Replacement string
            );
            
            // Replace newlines with HTML break tags
            formatted = formatted.replace(/\n/g, '<br>');
            
            // Multiple replace() calls for emoji conversion
            formatted = formatted.replace(/:\)/g, '😊');
            formatted = formatted.replace(/:\(/g, '😞');
            formatted = formatted.replace(/:D/g, '😃');
            formatted = formatted.replace(/;-?\)/g, '😉');
            
            return formatted;  // Return processed string
        },

        // Method that simulates automated responses
        simulateBotResponse(userMessage) {
            // jQuery addClass() adds CSS class
            $('#typing-indicator').addClass('active');
            
            // setTimeout() executes function after delay
            setTimeout(() => {
                // jQuery removeClass() removes CSS class
                $('#typing-indicator').removeClass('active');
                
                // Method calls with variable assignment
                const responseType = this.getBotResponseType(userMessage);
                const responses = this.botResponses[responseType];  // Property access
                
                // Math.random() generates random number, Math.floor() rounds down
                const response = responses[Math.floor(Math.random() * responses.length)];
                
                // Method call with object parameter
                this.addMessage({
                    user: 'AI Assistant',
                    text: response,
                    type: 'other',
                    timestamp: new Date()
                });
                
                // Array push() method
                this.state.messageHistory.push({
                    user: 'AI Assistant',
                    text: response,
                    timestamp: new Date(),
                    type: 'other'
                });

                // Increment and method call
                this.state.messageCount++;
                this.updateStats();
                
                // Conditional execution
                if (this.state.soundEnabled) {
                    this.playSound('receive');
                }
                
            }, 1500 + Math.random() * 2000);  // Random delay between 1.5-3.5 seconds
        },

        // Method that analyzes message content
        getBotResponseType(message) {
            // String toLowerCase() method for case-insensitive comparison
            const lowerMessage = message.toLowerCase();
            
            // Conditional statements with string includes() method
            if (lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('difficult')) {
                return 'supportive';
            } else if (lowerMessage.includes('?') || lowerMessage.includes('think') || lowerMessage.includes('what')) {
                return 'curious';
            } else {
                return 'casual';
            }
        },

        // Method that processes special commands
        handleCommand(text) {
            // String method chaining: toLowerCase() then trim()
            const command = text.toLowerCase().trim();
            
            // Switch statement for command routing
            switch(command) {
                case '/help':
                    this.showHelpMessage();
                    return true;  // Boolean return value
                case '/time':
                    this.addMessage({
                        user: 'System',
                        // Template literal with Date method call
                        text: `Current time: ${new Date().toLocaleString()}`,
                        type: 'other',
                        timestamp: new Date()
                    });
                    return true;
                case '/clear':
                    this.clearChat();
                    return true;
                case '/stats':
                    this.showStats();
                    return true;
                case '/theme':
                    this.toggleTheme();
                    return true;
                default:
                    // String startsWith() method check
                    if (command.startsWith('/emoji ')) {
                        // String substring() method extracts part of string
                        const emoji = command.substring(7);
                        // jQuery val() with string concatenation
                        $('#message-input').val($('#message-input').val() + emoji);
                        return true;
                    }
                    return false;  // Default return value
            }
        },

        // Method that displays help information
        showHelpMessage() {
            // Multi-line string using template literal
            const helpText = `
Available Commands:
• /help - Show this help message
• /time - Display current time
• /clear - Clear chat history
• /stats - Show session statistics
• /theme - Toggle dark/light theme
• /emoji [emoji] - Add emoji to input

Keyboard Shortcuts:
• Ctrl+K - Open search
• Ctrl+, - Open settings
• Enter - Send message
• Shift+Enter - New line
            `;
            
            // Method call with object parameter, trim() removes whitespace
            this.addMessage({
                user: 'System',
                text: helpText.trim(),
                type: 'other',
                timestamp: new Date()
            });
        },

        // Method that displays session statistics
        showStats() {
            // Method call and variable assignment
            const sessionTime = this.formatSessionTime();
            
            // Template literal with multiple variable interpolations
            const statsText = `
Session Statistics:
• Messages sent: ${this.state.messageCount}
• Session time: ${sessionTime}
• Username: ${this.state.username}
• Theme: ${this.state.theme}
• Status: ${this.state.userStatus}
            `;
            
            this.addMessage({
                user: 'System',
                text: statsText.trim(),
                type: 'other',
                timestamp: new Date()
            });
        },

        // Method that clears chat interface
        clearChat() {
            // jQuery empty() removes all child elements
            $('#chat-messages').empty();
            
            // Array assignment to empty array
            this.state.messageHistory = [];
            this.state.messageCount = 0;
            
            // Method calls
            this.updateStats();
            this.addWelcomeMessage();
            this.showNotification('Chat cleared successfully!', 'info');
        },

        // Method that adds initial welcome message
        addWelcomeMessage() {
            this.addMessage({
                user: 'System',
                // Template literal with property access and emoji
                text: `Welcome to Jakia Chat Room, ${this.state.username}! 🎉\n\nType /help for available commands.`,
                type: 'other',
                timestamp: new Date()
            });
        },

        // Method that opens settings dialog
        openSettings() {
            // jQuery val() method sets input values to current state
            $('#username').val(this.state.username);
            $('#user-status').val(this.state.userStatus);
            $('#theme').val(this.state.theme);
            $('#font-size').val(this.state.fontSize);
            
            // jQuery prop() method sets checkbox states
            $('#sound-notifications').prop('checked', this.state.soundEnabled);
            $('#desktop-notifications').prop('checked', this.state.notificationsEnabled);
            
            // jQuery UI dialog method
            $('#settings-dialog').dialog('open');
        },

        // Method that saves user settings
        saveSettings() {
            // Assignment with jQuery val() method and logical OR for defaults
            this.state.username = $('#username').val() || 'User';
            this.state.userStatus = $('#user-status').val() || 'online';
            this.state.theme = $('#theme').val() || 'dark';
            this.state.fontSize = $('#font-size').val() || 'medium';
            
            // Assignment with jQuery is() method (returns boolean)
            this.state.soundEnabled = $('#sound-notifications').is(':checked');
            this.state.notificationsEnabled = $('#desktop-notifications').is(':checked');
            
            // Method calls to apply changes
            this.applyTheme();
            this.applyFontSize();
            this.updateUserDisplay();
            
            // localStorage setItem() saves data to browser storage
            // JSON.stringify() converts object to string
            localStorage.setItem('chatAppSettings', JSON.stringify(this.state));
        },

        // Method that loads saved settings
        loadSettings() {
            // localStorage getItem() retrieves saved data
            const saved = localStorage.getItem('chatAppSettings');
            
            // Conditional check if data exists
            if (saved) {
                // JSON.parse() converts string back to object
                const settings = JSON.parse(saved);
                
                // Object.assign() merges properties from settings into this.state
                Object.assign(this.state, settings);
                
                // Apply loaded settings
                this.applyTheme();
                this.applyFontSize();
                this.updateUserDisplay();
            }
        },

        // Method that applies theme settings
        applyTheme() {
            // jQuery toggleClass() adds/removes class based on boolean condition
            $('body').toggleClass('dark-theme', this.state.theme === 'dark');
            
            // Ternary operators for conditional assignment
            const themeIcon = this.state.theme === 'dark' ? 'fa-sun' : 'fa-moon';
            const themeText = this.state.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
            
            // jQuery html() method sets element content with template literal
            $('#theme-toggle').html(`<i class="fas ${themeIcon}"></i><span>${themeText}</span>`);
        },

        // Method that applies font size settings
        applyFontSize() {
            // jQuery method chaining: removeClass() then addClass()
            $('body').removeClass('font-small font-medium font-large')
                    .addClass(`font-${this.state.fontSize}`);
        },

        // Method that updates user interface display
        updateUserDisplay() {
            // jQuery text() method sets text content
            $('#display-username').text(this.state.username);
            
            // Object literal with nested objects for mapping
            const statusMap = {
                online: { class: 'online', text: 'Online' },
                away: { class: 'away', text: 'Away' },
                busy: { class: 'busy', text: 'Busy' }
            };
            
            // Property access with bracket notation
            const status = statusMap[this.state.userStatus];
            
            // jQuery method chaining with find() method
            $('#status-indicator')
                .removeClass('online away busy')  // Remove all status classes
                .addClass(status.class)           // Add current status class
                .find('.status-text')             // Find child element
                .text(status.text);               // Set its text
        },

        // Method that toggles between light and dark themes
        toggleTheme() {
            // Ternary operator for conditional assignment
            this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
            this.applyTheme();
            this.saveSettings();
        },

        // Method that sets up automatic theme detection
        initializeTheme() {
            // Conditional check for auto theme
            if (this.state.theme === 'auto') {
                // window.matchMedia() checks CSS media query
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.state.theme = prefersDark ? 'dark' : 'light';
            }
            this.applyTheme();
        },

        // Method that starts session timer
        startSessionTimer() {
            // setInterval() executes function repeatedly every 1000ms (1 second)
            setInterval(() => {
                // jQuery text() method with method call
                $('#session-time').text(this.formatSessionTime());
            }, 1000);
        },

        // Method that formats elapsed time
        formatSessionTime() {
            // Date.now() gets current timestamp, subtraction calculates elapsed time
            const elapsed = Date.now() - this.state.sessionStartTime;
            
            // Math.floor() rounds down division results
            const minutes = Math.floor(elapsed / 60000);   // 60000ms = 1 minute
            const seconds = Math.floor((elapsed % 60000) / 1000);  // Modulo gets remainder
            
            // toString() converts number to string, padStart() adds leading zeros
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },

        // Method that updates statistics display
        updateStats() {
            // jQuery text() method with property access
            $('#message-count').text(this.state.messageCount);
        },

        // Method that opens search dialog
        openSearch() {
            $('#search-dialog').dialog('open');   // jQuery UI method
            $('#search-input').focus();           // Set focus to input
        },

        // Method that performs search functionality
        performSearch(query) {
            // jQuery selector and empty() method
            const results = $('#search-results');
            results.empty();
            
            // Early return if query too short
            if (query.length < 2) return;
            
            // Array filter() method with arrow function
            const matches = this.state.messageHistory.filter(msg => 
                // String includes() with toLowerCase() for case-insensitive search
                msg.text.toLowerCase().includes(query.toLowerCase())
            );
            
            // Conditional check for no results
            if (matches.length === 0) {
                // jQuery html() method sets HTML content
                results.html('<div class="search-result">No messages found</div>');
                return;
            }
            
            // Array slice() method limits results, forEach() iterates over array
            matches.slice(0, 10).forEach(msg => {
                // Template literal with method call
                const resultHtml = `
                    <div class="search-result" data-timestamp="${msg.timestamp.getTime()}">
                        <div class="search-result-text">${this.highlightSearchTerm(msg.text, query)}</div>
                        <div class="search-result-meta">${msg.user} - ${msg.timestamp.toLocaleString()}</div>
                    </div>
                `;
                // jQuery append() adds HTML content
                results.append(resultHtml);
            });
        },

        // Method that highlights search terms in results
        highlightSearchTerm(text, term) {
            // RegExp constructor creates regular expression with flags
            const regex = new RegExp(`(${term})`, 'gi');  // 'gi' = global, case-insensitive
            
            // String replace() with regex and HTML replacement
            return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
        },

        // Method that manages typing indicator
        showTypingIndicator() {
            // Conditional check and clearTimeout() cancels previous timeout
            if (this.state.typingTimeout) {
                clearTimeout(this.state.typingTimeout);
            }
            
            // setTimeout() creates new timeout
            this.state.typingTimeout = setTimeout(() => {
                // Comment indicates future functionality
                // Could implement actual typing indicator for multi-user chat
            }, 1000);
        },

        // Method that sets up application keyboard shortcuts
        setupKeyboardShortcuts() {
            // jQuery event binding on document level
            $(document).on('keydown', (e) => {
                // Conditional with logical OR for modifier keys
                if (e.ctrlKey || e.metaKey) {
                    // Switch statement for different key combinations
                    switch(e.key) {
                        case '/':
                            e.preventDefault();
                            $('#message-input').focus();
                            break;
                        case 'Escape':
                            // Complex jQuery selector for visible dialogs
                            $('.ui-dialog:visible .ui-dialog-titlebar-close').click();
                            break;
                    }
                }
            });
        },

        // Method that requests browser notification permission
        requestNotificationPermission() {
            // Conditional checks for Notification API support and permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();  // Browser API call
            }
        },

        // Method that shows desktop notifications
        showDesktopNotification(user, message) {
            // Conditional check for notification support and permission
            if ('Notification' in window && Notification.permission === 'granted') {
                // Notification constructor creates new notification
                new Notification(`${user} sent a message`, {
                    // Configuration object
                    body: message.substring(0, 100),  // String substring() method
                    icon: '/favicon.ico',
                    tag: 'chat-message'
                });
            }
        },

        // Method that shows in-app notifications
        showNotification(message, type = 'info') {  // Default parameter
            // jQuery element creation with template literal
            const notification = $(`
                <div class="toast-notification ${type}">
                    <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
                    ${message}
                </div>
            `);
            
            // jQuery append() adds element to body
            $('body').append(notification);
            
            // setTimeout() with addClass() for animation
            setTimeout(() => {
                notification.addClass('show');
            }, 100);
            
            // Nested setTimeout() for auto-removal
            setTimeout(() => {
                notification.removeClass('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },

        // Method that plays sound effects
        playSound(type) {
            // Conditional check for sound setting
            if (this.state.soundEnabled) {
                // Audio constructor creates new audio object
                const audio = new Audio();
                audio.volume = 0.1;  // Property assignment
                
                // Comments show where actual sound files would be used
                // audio.src = `/sounds/${type}.mp3`;
                // audio.play().catch(() => {}); // Ignore autoplay policy errors
            }
        },

        // Method that scrolls chat to bottom
        scrollToBottom() {
            // jQuery selector and property access
            const chatMessages = $('#chat-messages');
            
            // jQuery animate() method with object parameter
            chatMessages.animate({
                scrollTop: chatMessages[0].scrollHeight  // Access native DOM property
            }, 300);  // Animation duration in milliseconds
        },

        // Method that escapes HTML to prevent XSS attacks
        escapeHtml(text) {
            // DOM createElement() creates new element
            const div = document.createElement('div');
            
            // textContent property safely sets text (no HTML parsing)
            div.textContent = text;
            
            // innerHTML property returns HTML-escaped string
            return div.innerHTML;
        },

        // Method that saves session data
        saveSession() {
            // localStorage setItem() with JSON.stringify()
            localStorage.setItem('chatAppSession', JSON.stringify({
                // Object literal with current state values
                messageHistory: this.state.messageHistory,
                messageCount: this.state.messageCount,
                sessionStartTime: this.state.sessionStartTime
            }));
        }
    };

    // Method call to start the application
    ChatApp.init();
    
    // jQuery focus() method sets focus to input element
    $('#message-input').focus();
    
    // Global variable assignment for debugging access
    window.ChatApp = ChatApp;
});