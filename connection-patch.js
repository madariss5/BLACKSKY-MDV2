/**
 * Enhanced Connection Handler Patch
 * This code adds a connection success handler that sends a premium notification
 * with the BLACKSKY-MD logo when the bot successfully connects.
 * 
 * It also sets up a health check HTTP server for Heroku deployments
 * to prevent auto-restarts from failing due to health check failures.
 * 
 * Additional Heroku-specific optimizations and fixes are included.
 */

// Import required modules
const express = require('express');
const app = express();
const os = require('os');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const sharp = require('sharp');

// Initialize health check server and Heroku compatibility layer
function setupHealthCheckServer() {
    const PORT = process.env.PORT || 5000;

    // Basic info route
    app.get('/', (req, res) => {
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>BLACKSKY-MD Bot</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: #121212;
                    color: #eee;
                    margin: 0;
                    padding: 20px;
                    line-height: 1.6;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #1e1e1e;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                }
                h1 {
                    color: #0df;
                    text-align: center;
                    margin-top: 0;
                    padding-top: 20px;
                    text-shadow: 0 0 5px rgba(0,221,255,0.5);
                }
                .status {
                    background: #333;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .online {
                    color: #0f6;
                    font-weight: bold;
                }
                .stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .stat-card {
                    background: #2a2a2a;
                    padding: 15px;
                    border-radius: 5px;
                }
                footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 0.8em;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>BLACKSKY-MD Bot Server</h1>
                <div class="status">
                    Status: <span class="online">ONLINE</span><br>
                    WhatsApp Connection: ${global.conn?.user ? "Connected" : "Waiting for connection"}
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <h3>System Info</h3>
                        <p>Platform: ${os.platform()} ${os.arch()}</p>
                        <p>Node.js: ${process.version}</p>
                        <p>Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB</p>
                    </div>
                    <div class="stat-card">
                        <h3>Bot Info</h3>
                        <p>Bot Name: ${process.env.BOT_NAME || global.wm || "BLACKSKY-MD"}</p>
                        <p>Uptime: ${formatUptime(process.uptime())}</p>
                        <p>Environment: ${process.env.NODE_ENV || "development"}</p>
                    </div>
                </div>

                <footer>
                    BLACKSKY-MD Bot &copy; 2025
                </footer>
            </div>
        </body>
        </html>
        `);
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            connection: {
                connected: !!global.conn?.user,
                user: global.conn?.user?.name || null
            }
        });
    });

    // Logo endpoint for fetching the BLACKSKY-MD logo
    app.get('/logo', async (req, res) => {
        try {
            // Prioritize logo files in order
            const logoFiles = [
                'blacksky-premium-gradient.svg',
                'blacksky-premium-logo.svg', 
                'blacksky-logo-cosmic.svg',
                'blacksky-logo.svg',
                'blacksky-logo-simple.svg'
            ];

            let logoFile = null;
            for (const file of logoFiles) {
                const filePath = path.join(process.cwd(), file);
                if (fs.existsSync(filePath)) {
                    logoFile = filePath;
                    break;
                }
            }

            if (!logoFile) {
                res.status(404).send('Logo not found');
                return;
            }

            // Convert SVG to PNG for better compatibility
            try {
                console.log('[CONNECTION] Using logo:', path.basename(logoFile));
                console.log('Converting SVG file:', logoFile);

                const pngBuffer = await sharp(logoFile)
                    .resize(300)
                    .png()
                    .toBuffer();

                res.setHeader('Content-Type', 'image/png');
                res.send(pngBuffer);
                console.log('[CONNECTION] Successfully converted logo SVG to PNG');
            } catch (err) {
                console.error('Error converting SVG to PNG:', err);

                // Fallback to sending the raw SVG
                res.setHeader('Content-Type', 'image/svg+xml');
                res.send(fs.readFileSync(logoFile));
            }
        } catch (error) {
            console.error('Error serving logo:', error);
            res.status(500).send('Error loading logo');
        }
    });

    // Session status endpoint
    app.get('/status', (req, res) => {
        const sessionStatus = {
            connected: !!global.conn?.user,
            user: global.conn?.user ? {
                name: global.conn.user.name,
                phone: global.conn.user.id.split('@')[0]
            } : null,
            uptime: formatUptime(process.uptime()),
            memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '2.5.0 Premium'
        };

        res.json(sessionStatus);
    });

    // Metric monitoring endpoint for external monitoring tools
    app.get('/metrics', (req, res) => {
        const metrics = {
            'bot_uptime_seconds': process.uptime(),
            'bot_memory_usage_bytes': process.memoryUsage().rss,
            'bot_heap_total_bytes': process.memoryUsage().heapTotal,
            'bot_heap_used_bytes': process.memoryUsage().heapUsed,
            'bot_external_bytes': process.memoryUsage().external,
            'bot_connection_status': global.conn?.user ? 1 : 0,
            'system_total_memory_bytes': os.totalmem(),
            'system_free_memory_bytes': os.freemem(),
            'system_load_average': os.loadavg()[0]
        };

        // Format as Prometheus metrics
        let output = '';
        for (const [key, value] of Object.entries(metrics)) {
            output += `# HELP ${key} Metric for BLACKSKY-MD bot\n`;
            output += `# TYPE ${key} gauge\n`;
            output += `${key} ${value}\n`;
        }

        res.setHeader('Content-Type', 'text/plain');
        res.send(output);
    });

    // Session info endpoint
    app.get('/session', (req, res) => {
        const sessionDir = path.join(process.cwd(), 'sessions');

        try {
            if (!fs.existsSync(sessionDir)) {
                return res.json({
                    status: 'error',
                    message: 'No sessions directory found'
                });
            }

            const sessionId = process.env.SESSION_ID || 'BLACKSKY-MD';
            const sessionFiles = fs.readdirSync(sessionDir)
                .filter(file => file.startsWith(sessionId))
                .map(file => ({
                    name: file,
                    path: path.join(sessionDir, file),
                    size: fs.statSync(path.join(sessionDir, file)).size,
                    modified: fs.statSync(path.join(sessionDir, file)).mtime,
                }));

            res.json({
                status: 'success',
                sessionId,
                connected: !!global.conn?.user,
                files: sessionFiles
            });
        } catch (error) {
            res.json({
                status: 'error',
                message: error.message
            });
        }
    });

    // Heroku-specific information endpoint
    app.get('/heroku', (req, res) => {
        const herokuInfo = {
            dyno: process.env.DYNO || 'Not running on Heroku',
            appName: process.env.HEROKU_APP_NAME || 'Unknown',
            region: process.env.HEROKU_REGION || 'Unknown',
            releaseVersion: process.env.HEROKU_RELEASE_VERSION || 'Unknown',
            slugId: process.env.HEROKU_SLUG_ID || 'Unknown',
            dynoSize: process.env.HEROKU_DYNO_SIZE || 'eco'
        };

        res.json(herokuInfo);
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`⚡ Health check server running on port ${PORT}`);
    });
}

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Initialize health check server if running on Heroku or production environment
if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
    setupHealthCheckServer();
    console.log('🔍 Health check server initialized for production environment');
}

// Setup reconnection system
let reconnectInterval = null;
let reconnectAttempts = 0;

function setupReconnectionSystem() {
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
    }

    reconnectInterval = setInterval(() => {
        // Check if connection is closed or disconnected
        if (global.conn && (!global.conn.user || global.conn.ws.readyState !== 1)) {
            reconnectAttempts++;
            console.log(`⚠️ Connection appears to be closed. Attempt #${reconnectAttempts} to reconnect...`);

            try {
                // Try to trigger built-in reconnection
                if (global.conn.ev) {
                    global.conn.ev.emit('connection.update', { connection: 'close' });
                }

                // If more than 5 reconnection attempts, do a full reload
                if (reconnectAttempts > 5 && typeof global.reloadHandler === 'function') {
                    console.log('🔄 Multiple reconnection attempts failed. Forcing full reload...');
                    reconnectAttempts = 0;
                    global.reloadHandler(true);
                }
            } catch (e) {
                console.error('Error during reconnection attempt:', e);
            }
        } else {
            // Reset counter when connected
            if (reconnectAttempts > 0) {
                console.log('✅ Connection is stable again. Resetting reconnection counter.');
                reconnectAttempts = 0;
            }
        }
    }, 30000); // Check every 30 seconds
}

// Start the reconnection system
setupReconnectionSystem();

// Load our connection message function
let connectionMessageSender = null;

// For safety, try to find and load the connection message function
try {
    // When running as a module, try to require the connection message module
    const { sendConnectionMessage } = require('./plugins/info-connection');
    connectionMessageSender = sendConnectionMessage;
    console.log('✅ Connection patch loaded successfully');
} catch (e) {
    // If we can't load it directly, we'll look for it in globals
    console.log('Loading connection message from globals as fallback');
    connectionMessageSender = global.sendConnectionMessage;
}

// For backwards compatibility
if (!connectionMessageSender && typeof global.sendConnectionSuccess === 'function') {
    console.log('Using legacy connection message function');
    connectionMessageSender = global.sendConnectionSuccess;
}

// For safety, wrap in a check
if (typeof connectionMessageSender === 'function') {
    // Wait for bot to finish loading plugins
    setTimeout(() => {
        try {
            // Send connection success message
            connectionMessageSender(global.conn);

            // Also send to owner if owner is configured
            if (global.owner && global.owner.length > 0) {
                let ownerJid = global.owner[0][0] + '@s.whatsapp.net';

                // Send to owner's chat directly
                if (ownerJid && ownerJid !== 'undefined@s.whatsapp.net') {
                    connectionMessageSender(global.conn, ownerJid);
                    console.log('📱 Connection success message sent to owner');
                }
            }
        } catch (error) {
            console.error('❌ Error sending connection message:', error);
        }
    }, 5000); // Wait 5 seconds for everything to load
} else {
    console.log('⚠️ Connection message function not found');
}

/**
 * Perform graceful shutdown, saving data and closing connections
 */
async function performGracefulShutdown() {
    console.log('🔄 Received shutdown signal, performing graceful shutdown...');

    try {
        // Save session if it exists
        if (global.conn?.user) {
            console.log('💾 Saving WhatsApp session before shutdown...');

            // Try to log out properly
            try {
                await global.conn.logout();
                console.log('👋 Successfully logged out from WhatsApp');
            } catch (logoutError) {
                console.error('Error during logout:', logoutError.message);
            }
        }

        // Save database if it exists
        if (global.db) {
            console.log('💾 Saving database before shutdown...');
            try {
                await global.db.write();
                console.log('✅ Database saved successfully');
            } catch (dbError) {
                console.error('Error saving database:', dbError.message);
            }
        }

        // Perform any other cleanup tasks here
        // ...

        console.log('👍 Graceful shutdown completed');
    } catch (e) {
        console.error('❌ Error during graceful shutdown:', e);
    } finally {
        // Force exit after some time if hanging
        setTimeout(() => {
            console.log('⚠️ Forcing exit after grace period');
            process.exit(0);
        }, 3000);
    }
}

// Register the shutdown handler for different signals
process.on('SIGTERM', performGracefulShutdown);
process.on('SIGINT', performGracefulShutdown);

// Also handle uncaught exceptions to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    console.error('Stack trace:', err.stack);
    // Don't exit, let the process continue
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);

    // Handle decryption errors by forcing session refresh
    if (reason?.message?.includes('Unsupported state') || 
        reason?.message?.includes('unable to authenticate')) {
        console.log('Detected authentication error, attempting session refresh...');

        try {
            // Clear problematic session files
            if (global.conn?.authState) {
                await global.conn.authState.saveCreds();
            }

            // Force reconnection
            if (typeof global.reloadHandler === 'function') {
                global.reloadHandler(true);
            }
        } catch (err) {
            console.error(`Session refresh failed: ${err.message}`);
        }
    }
});

// Log the patch loading
console.log('🔧 Connection success patch and health check loaded');