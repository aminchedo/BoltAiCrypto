#!/usr/bin/env node

// HTS Trading System - Cross-platform Startup Script
// This script starts both frontend and backend services using Node.js

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
    return new Promise((resolve) => {
        exec(`${command} --version`, (error) => {
            resolve(!error);
        });
    });
}

function killPort(port) {
    return new Promise((resolve) => {
        const isWindows = os.platform() === 'win32';
        
        if (isWindows) {
            exec(`for /f "tokens=5" %a in ('netstat -aon ^| find ":${port}" ^| find "LISTENING"') do taskkill /F /PID %a`, 
                () => resolve());
        } else {
            exec(`lsof -ti :${port} | xargs kill -9`, () => resolve());
        }
    });
}

function installDependencies() {
    return new Promise((resolve, reject) => {
        log('📦 Installing dependencies...', 'blue');
        
        // Install frontend dependencies
        const npmInstall = spawn('npm', ['install'], { stdio: 'inherit' });
        
        npmInstall.on('close', (code) => {
            if (code !== 0) {
                reject(new Error('Failed to install frontend dependencies'));
                return;
            }
            
            // Install backend dependencies
            const isWindows = os.platform() === 'win32';
            const pythonCmd = isWindows ? 'python' : 'python3';
            const pipInstall = spawn(pythonCmd, ['-m', 'pip', 'install', '-r', 'requirements.txt'], {
                cwd: path.join(__dirname, 'backend'),
                stdio: 'inherit'
            });
            
            pipInstall.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error('Failed to install backend dependencies'));
                } else {
                    resolve();
                }
            });
        });
    });
}

function startBackend() {
    return new Promise((resolve, reject) => {
        log('🔧 Starting Backend Server (Port 8000)...', 'blue');
        
        const isWindows = os.platform() === 'win32';
        const pythonCmd = isWindows ? 'python' : 'python3';
        
        const backend = spawn(pythonCmd, ['main.py'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        backend.stdout.on('data', (data) => {
            console.log(`${colors.magenta}[Backend]${colors.reset} ${data.toString().trim()}`);
        });
        
        backend.stderr.on('data', (data) => {
            console.error(`${colors.red}[Backend Error]${colors.reset} ${data.toString().trim()}`);
        });
        
        // Wait for backend to be ready
        let attempts = 0;
        const checkBackend = setInterval(() => {
            exec('curl -s http://localhost:8000/health', (error) => {
                if (!error) {
                    clearInterval(checkBackend);
                    log('✅ Backend started successfully on http://localhost:8000', 'green');
                    resolve(backend);
                } else {
                    attempts++;
                    if (attempts > 30) {
                        clearInterval(checkBackend);
                        reject(new Error('Backend failed to start'));
                    }
                }
            });
        }, 1000);
        
        backend.on('close', (code) => {
            if (code !== 0) {
                clearInterval(checkBackend);
                reject(new Error(`Backend exited with code ${code}`));
            }
        });
    });
}

function startFrontend() {
    return new Promise((resolve, reject) => {
        log('🎨 Starting Frontend Server (Port 5173)...', 'blue');
        
        const frontend = spawn('npm', ['run', 'dev'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        frontend.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`${colors.cyan}[Frontend]${colors.reset} ${output.trim()}`);
            
            // Check if frontend is ready
            if (output.includes('Local:') || output.includes('localhost:5173')) {
                log('✅ Frontend started successfully on http://localhost:5173', 'green');
                resolve(frontend);
            }
        });
        
        frontend.stderr.on('data', (data) => {
            console.error(`${colors.red}[Frontend Error]${colors.reset} ${data.toString().trim()}`);
        });
        
        frontend.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Frontend exited with code ${code}`));
            }
        });
        
        // Timeout fallback
        setTimeout(() => {
            resolve(frontend);
        }, 10000);
    });
}

async function main() {
    try {
        log('🚀 Starting HTS Trading System...', 'yellow');
        log('==================================', 'yellow');
        
        // Check system requirements
        log('Checking system requirements...', 'blue');
        
        const hasNode = await checkCommand('node');
        const hasPython = await checkCommand('python3') || await checkCommand('python');
        
        if (!hasNode) {
            throw new Error('Node.js not found. Please install Node.js 16+');
        }
        if (!hasPython) {
            throw new Error('Python not found. Please install Python 3.8+');
        }
        
        log('✅ System requirements met', 'green');
        
        // Cleanup existing processes
        log('Cleaning up existing processes...', 'yellow');
        await killPort(8000);
        await killPort(5173);
        
        // Install dependencies
        try {
            await installDependencies();
            log('✅ Dependencies installed', 'green');
        } catch (error) {
            log(`Warning: ${error.message}`, 'yellow');
        }
        
        // Start services
        const backend = await startBackend();
        const frontend = await startFrontend();
        
        // Display running services
        console.log('');
        log('🎉 HTS Trading System is running!', 'green');
        log('==================================', 'green');
        log('Frontend: http://localhost:5173', 'blue');
        log('Backend:  http://localhost:8000', 'blue');
        log('API Docs: http://localhost:8000/docs', 'blue');
        log('Health:   http://localhost:8000/health', 'blue');
        console.log('');
        log('Press Ctrl+C to stop all services', 'yellow');
        console.log('');
        
        // Handle cleanup on exit
        const cleanup = () => {
            log('\n🛑 Shutting down services...', 'yellow');
            backend.kill();
            frontend.kill();
            process.exit(0);
        };
        
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run the main function
main();