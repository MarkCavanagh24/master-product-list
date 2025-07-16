const { exec } = require('child_process');

async function quickStart() {
    console.log('🚀 Quick Start - Killing port 8080 and starting server...\n');
    
    try {
        // Kill process on port 8080
        console.log('1. Killing any process on port 8080...');
        await new Promise((resolve, reject) => {
            exec('netstat -ano | findstr :8080', (error, stdout, stderr) => {
                if (stdout) {
                    const lines = stdout.trim().split('\n');
                    const pids = new Set();
                    
                    lines.forEach(line => {
                        const match = line.match(/\s+(\d+)$/);
                        if (match) {
                            pids.add(match[1]);
                        }
                    });
                    
                    if (pids.size > 0) {
                        console.log(`   Found ${pids.size} process(es) to kill`);
                        let killed = 0;
                        
                        pids.forEach(pid => {
                            exec(`taskkill /PID ${pid} /F`, (killError) => {
                                if (!killError) {
                                    console.log(`   ✅ Killed process ${pid}`);
                                }
                                killed++;
                                if (killed === pids.size) {
                                    resolve();
                                }
                            });
                        });
                    } else {
                        resolve();
                    }
                } else {
                    console.log('   ✅ No processes found on port 8080');
                    resolve();
                }
            });
        });
        
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Start server
        console.log('\n2. Starting server...');
        exec('npm start', (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Failed to start server:', error.message);
                return;
            }
            
            console.log(stdout);
            if (stderr) {
                console.error(stderr);
            }
        });
        
    } catch (error) {
        console.error('❌ Quick start failed:', error.message);
    }
}

quickStart();