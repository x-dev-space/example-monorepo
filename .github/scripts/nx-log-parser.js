#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let configuration = null;
const validTasks = ['lint', 'typecheck', 'test', 'e2e', 'build'];
const tasks = [];
let isStageDeployment = true;

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
NX Affected Log Parser

Usage: node nx-log-parser.js [tasks...] [options]

Tasks:
  lint        Run linting tasks
  typecheck   Run TypeScript type checking
  test        Run unit tests
  e2e         Run end-to-end tests
  build       Run build tasks

Options:
  -c, --configuration <config>  Specify nx configuration (e.g., production, staging)
  -h, --help                    Show this help message

Examples:
  node nx-log-parser.js                           # Run default tasks (all except build)
  node nx-log-parser.js lint test                 # Run only lint and test
  node nx-log-parser.js build -c production       # Run build with production config
  node nx-log-parser.js lint test build -c staging # Multiple tasks with config

Default tasks if none specified: lint, typecheck, test, e2e
`);
  process.exit(0);
}

// Process arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  // Check for configuration flag
  if (arg === '--configuration' || arg === '-c') {
    if (i + 1 < args.length) {
      configuration = args[++i];
    } else {
      console.error(`❌ Error: --configuration flag requires a value`);
      console.error('Usage: node nx-log-parser.js [tasks...] [--configuration|-c <config>]');
      console.error('Run with --help for more information');
      process.exit(1);
    }
  } 
  // Check if it's a valid task
  else if (validTasks.includes(arg)) {
    tasks.push(arg);
  }
  else if(arg === '--prod') {
    isStageDeployment = false
  }
  // Unknown argument
  else {
    console.error(`❌ Error: Unknown argument '${arg}'`);
    console.error(`Valid tasks: ${validTasks.join(', ')}`);
    console.error('Usage: node nx-log-parser.js [tasks...] [--configuration|-c <config>]');
    console.error('Example: node nx-log-parser.js lint test build -c production');
    console.error('Run with --help for more information');
    process.exit(1);
  }
}

// Default to all tasks if none specified
const selectedTasks = tasks.length > 0 ? tasks : validTasks.filter(t => t !== 'build');

// Configuration
const timestamp = Date.now();
const LOG_FILE = `nx-build-${timestamp}.log`;
const REPORT_FILE = 'nx-report.md';
const SUMMARY_FILE = 'nx-summary.json';
const DEPLOYMENT_ENV = isStageDeployment ? 'stage' : 'prod';

// Task tracking
const taskList = [];
const taskDetails = {};
const buildUrls = {};
let currentTask = null;
let captureBuffer = [];
let totalTasks = 0;
let passedTasks = 0;
let failedTasks = 0;
const startTime = Date.now();

// Parse state
let currentProject = '';
let currentTaskType = '';
let currentFullTask = '';
let lintErrors = 0;
let lintWarnings = 0;
let testOutput = [];
let e2eOutput = [];
let captureTestStats = 0;
let captureE2eStats = false;
let allTasksSuccessful = false;

// Create write streams
const logStream = fs.createWriteStream(LOG_FILE);

console.log('🚀 Starting NX Affected Tasks...');
console.log(`📋 Tasks: ${selectedTasks.join(', ')}`);
if (configuration) {
  console.log(`⚙️  Configuration: ${configuration}`);
}
console.log(`📝 Log file: ${LOG_FILE}`);
console.log(`📊 Report file: ${REPORT_FILE}`);



// Build nx command
const nxArgs = [
  'nx',
  'affected',
  '-t',
  ...selectedTasks,
  '--parallel',
  '10',
  '--nxBail',
  'true',
  '--outputStyle',
  'static'
];

// Show the nx command being run (for debugging)
console.log(`\n🔧 Running: pnpm ${nxArgs.join(' ')}`);
console.log('');

// Add configuration if provided
if (configuration) {
  nxArgs.push('--configuration', configuration);
}

// Spawn nx command
const nxProcess = spawn('pnpm', nxArgs, {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe']
});

// Process output line by line
function processLine(line) {
  // Write to log file
  logStream.write(line + '\n');
  
  // Also output to console
  console.log(line);
  
  // Check for successful completion
  if (line.includes('Successfully ran targets')) {
    allTasksSuccessful = true;
  }

  // Simple check for nx run command
  if (line.includes('nx run ') && line.includes('>')) {
    // Save previous task if exists
    if (currentTask) {
      saveTaskDetails();
    }
    
    // Find the position of "nx run "
    const nxRunIndex = line.indexOf('nx run ');
    if (nxRunIndex === -1) return;
    
    // Extract everything after "nx run "
    const afterNxRun = line.substring(nxRunIndex + 7); // 7 = length of "nx run "
    
    // Find the task string (everything up to the next space or end of line)
    let taskString = '';
    const spaceIndex = afterNxRun.indexOf(' ');
    if (spaceIndex === -1) {
      taskString = afterNxRun.trim();
    } else {
      taskString = afterNxRun.substring(0, spaceIndex).trim();
    }
    
    // Parse project and task
    const colonIndex = taskString.indexOf(':');
    if (colonIndex > -1) {
      currentProject = taskString.substring(0, colonIndex).trim();
      currentFullTask = taskString.substring(colonIndex + 1).trim();
      
      // Get task type (last part after colon)
      const taskParts = currentFullTask.split(':');
      currentTaskType = taskParts[taskParts.length - 1];
      
      // Create task object - default to PASSED, will update if we find errors
      currentTask = {
        project: currentProject,
        fullTask: currentFullTask,
        taskType: currentTaskType,
        status: 'PASSED',
        key: `${currentProject}:${currentFullTask}`
      };
      
      taskList.push(currentTask);
      totalTasks++;
      passedTasks++; // Assume passed by default
      
      // Reset capture state - IMPORTANT: reset e2e capture state here
      captureBuffer = [];
      lintErrors = 0;
      lintWarnings = 0;
      testOutput = [];
      e2eOutput = [];
      captureTestStats = 0;
      captureE2eStats = false;
    }
    return;
  }
  
  // Check for old format with status indicators (for compatibility)
  // Instead of regex, use simple string checks
  if ((line.includes('✅') || line.includes('❌')) && line.includes('nx run ')) {
    // Save previous task if exists
    if (currentTask) {
      saveTaskDetails();
    }
    
    const status = line.includes('✅') ? 'PASSED' : 'FAILED';
    
    // Find "nx run " and extract task string
    const nxRunIndex = line.indexOf('nx run ');
    if (nxRunIndex === -1) return;
    
    const afterNxRun = line.substring(nxRunIndex + 7);
    let taskString = '';
    const spaceIndex = afterNxRun.indexOf(' ');
    if (spaceIndex === -1) {
      taskString = afterNxRun.trim();
    } else {
      taskString = afterNxRun.substring(0, spaceIndex).trim();
    }
    
    // Parse project and task
    const colonIndex = taskString.indexOf(':');
    if (colonIndex > -1) {
      currentProject = taskString.substring(0, colonIndex).trim();
      currentFullTask = taskString.substring(colonIndex + 1).trim();
      
      // Get task type (last part after colon)
      const taskParts = currentFullTask.split(':');
      currentTaskType = taskParts[taskParts.length - 1];
      
      // Create task object
      currentTask = {
        project: currentProject,
        fullTask: currentFullTask,
        taskType: currentTaskType,
        status: status,
        key: `${currentProject}:${currentFullTask}`
      };
      
      taskList.push(currentTask);
      totalTasks++;
      if (status === 'PASSED') passedTasks++;
      else failedTasks++;
      
      // Reset capture state - IMPORTANT: reset e2e capture state here
      captureBuffer = [];
      lintErrors = 0;
      lintWarnings = 0;
      testOutput = [];
      e2eOutput = [];
      captureTestStats = 0;
      captureE2eStats = false;
    }
    return;
  }
  
  // Capture output for current task
  if (currentTask) {
    captureBuffer.push(line);
    
    // Parse based on task type
    switch (currentTaskType) {
      case 'lint':
        parseLintOutput(line);
        break;
      case 'typecheck':
        parseTypecheckOutput(line);
        break;
      case 'test':
        parseTestOutput(line);
        break;
      case 'e2e':
        parseE2eOutput(line);
        break;
      default:
        // Check if this is a build task (anywhere in the full task name)
        if (currentFullTask && currentFullTask.includes('build')) {
          parseBuildOutput(line);
        }
    }
  }
}

function parseLintOutput(line) {
  // Look for error/warning counts
  if (line.includes('problems')) {
    const errorMatch = line.match(/(\d+)\s+errors?/);
    const warningMatch = line.match(/(\d+)\s+warnings?/);
    
    if (errorMatch) lintErrors = parseInt(errorMatch[1]);
    if (warningMatch) lintWarnings = parseInt(warningMatch[1]);
  }
}

function parseTypecheckOutput(line) {
  // TypeScript errors will be detected in saveTaskDetails
}

function parseTestOutput(line) {
  // Capture test pass/fail
  if (line.includes('PASS') && line.includes('appContainer')) {
    // Test passed
  } else if (line.includes('FAIL') && line.includes('appContainer')) {
    // Test failed - update status
    if (currentTask && currentTask.status === 'PASSED') {
      currentTask.status = 'FAILED';
      passedTasks--;
      failedTasks++;
    }
  }
  
  if (line.includes('Test Suites:')) {
    testOutput = [line];
    captureTestStats = 3;
  } else if (captureTestStats > 0) {
    testOutput.push(line);
    captureTestStats--;
  }
}

function parseE2eOutput(line) {
  // Check for error ANYWHERE in e2e output, not just when capturing stats
  if (line.includes('Error:')) {
    // Debug log
    console.log(`[E2E Parser] Found error line: ${line.substring(0, 50)}...`);
    
    // Mark as failed immediately
    if (currentTask && currentTask.status === 'PASSED') {
      currentTask.status = 'FAILED';
      passedTasks--;
      failedTasks++;
      console.log(`[E2E Parser] Marked ${currentTask.project}:${currentTask.fullTask} as FAILED`);
    }
  }
  
  // Start capturing when we see "Running X tests"
  if (line.match(/Running \d+ tests?/)) {
    e2eOutput = [line];
    captureE2eStats = true;
  } else if (captureE2eStats) {
    // Always add lines while capturing
    e2eOutput.push(line);
    
    // Also check for explicit pass/fail counts in summary
    if (line.match(/\d+\s+(passed|failed|flaky|skipped)/)) {
      // Check for failures
      const failMatch = line.match(/(\d+)\s+failed/);
      if (failMatch && parseInt(failMatch[1]) > 0) {
        if (currentTask && currentTask.status === 'PASSED') {
          currentTask.status = 'FAILED';
          passedTasks--;
          failedTasks++;
        }
      }
    }
    
    // Stop capturing after we see attachment paths or trace information
    if (line.includes('pnpm exec playwright show-trace') || 
        line.includes('────────────────────────────')) {
      captureE2eStats = false;
    }
    
    // Also stop if we've captured too many lines (safety limit)
    if (e2eOutput.length > 50) {
      captureE2eStats = false;
    }
  }
}

function parseBuildOutput(line) {
  const urlMatch = line.match(/https:\/\/[^\s]+ze\.zephyrcloud\.app/);
  if (urlMatch) {
    buildUrls[currentProject] = urlMatch[0];
  }
}

function saveTaskDetails() {
  if (!currentTask) return;
  
  const key = currentTask.key;
  
  // Helper to strip ANSI codes
  const stripAnsi = (str) => str.replace(/\x1B\[[0-9;]*m/g, '');
  
  switch (currentTaskType) {
    case 'lint':
      if (lintErrors > 0) {
        taskDetails[key] = `❌ ${lintErrors} errors, ${lintWarnings} warnings`;
        // Override success status if errors found
        if (currentTask.status === 'PASSED') {
          currentTask.status = 'FAILED';
          passedTasks--;
          failedTasks++;
        }
      } else if (lintWarnings > 0) {
        taskDetails[key] = `✅ No errors (${lintWarnings} warnings ignored)`;
      } else {
        taskDetails[key] = '✅ Clean';
      }
      break;
      
    case 'typecheck':
      const hasTypeErrors = captureBuffer.some(line => /error TS\d+:/.test(line));
      if (hasTypeErrors) {
        taskDetails[key] = '❌ Type errors found';
        if (currentTask.status === 'PASSED') {
          currentTask.status = 'FAILED';
          passedTasks--;
          failedTasks++;
        }
      } else {
        taskDetails[key] = '✅ No type errors';
      }
      break;
      
    case 'test':
      if (testOutput.length > 0) {
        const cleanOutput = testOutput.map(line => stripAnsi(line)).join('\n');
        taskDetails[key] = '```\n' + cleanOutput + '\n```';
      }
      break;
      
    case 'e2e':
      if (e2eOutput.length > 0) {
        // Limit output to just the test summary, not error details
        let summaryLines = [];
        for (let line of e2eOutput) {
          const cleaned = stripAnsi(line);
          summaryLines.push(cleaned);
          // Stop at error details or after we have the summary
          if (line.trim().startsWith('Error:') || 
              line.includes('Error Context:') ||
              (line.match(/[×F·]+/) && summaryLines.length > 2)) {
            break;
          }
        }
        taskDetails[key] = '```\n' + summaryLines.join('\n') + '\n```';
      }
      break;
      
    default:
      // Check if this is a build task
      if (currentFullTask && currentFullTask.includes('build') && buildUrls[currentProject]) {
        const previewUrl = buildUrls[currentProject];
        const buildUrl = `https://${DEPLOYMENT_ENV}-env-${currentProject.toLowerCase()}-example-monorepo-x-dev-space-ze.zephyrcloud.app/`;
        taskDetails[key] = `**Preview:** ${previewUrl}<br>**${DEPLOYMENT_ENV.toUpperCase()}:** ${buildUrl}`;
      }
  }
}

// Process stdout
let stdoutBuffer = '';
nxProcess.stdout.on('data', (data) => {
  stdoutBuffer += data.toString();
  const lines = stdoutBuffer.split('\n');
  stdoutBuffer = lines.pop(); // Keep incomplete line in buffer
  
  lines.forEach(line => processLine(line));
});

// Process stderr
let stderrBuffer = '';
nxProcess.stderr.on('data', (data) => {
  stderrBuffer += data.toString();
  const lines = stderrBuffer.split('\n');
  stderrBuffer = lines.pop();
  
  lines.forEach(line => processLine(line));
});

// Handle process completion
nxProcess.on('close', (code) => {
  // Process any remaining lines
  if (stdoutBuffer) processLine(stdoutBuffer);
  if (stderrBuffer) processLine(stderrBuffer);
  
  // Save last task
  if (currentTask) {
    saveTaskDetails();
  }
  
  // Close log stream
  logStream.end();
  
  // Generate report
  generateReport();
  
  // Generate summary
  generateSummary();
  
  // Display summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 NX Affected Summary:');
  console.log(`   Total:  ${totalTasks}`);
  console.log(`   Passed: ${passedTasks} ✅`);
  console.log(`   Failed: ${failedTasks} ❌`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log(`📄 Report: ${REPORT_FILE}`);
  console.log(`📋 Log: ${LOG_FILE}`);
  console.log('');
  
  // Exit with nx exit code
  process.exit(code || (failedTasks > 0 ? 1 : 0));
});

// Handle errors
nxProcess.on('error', (error) => {
  console.error('Failed to start nx process:', error);
  
  // Generate error report
  const errorReport = `# NX Affected Tasks Report

**Run Date:** ${new Date().toISOString()}

## ⚠️ Error

Failed to execute NX command: ${error.message}

_Full log: [${LOG_FILE}](${LOG_FILE})_
`;
  
  fs.writeFileSync(REPORT_FILE, errorReport);
  fs.writeFileSync(SUMMARY_FILE, JSON.stringify({
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    success: false,
    error: true,
    errorMessage: error.message
  }, null, 2));
  
  process.exit(1);
});

function generateReport() {
  const duration = Math.round((Date.now() - startTime) / 1000);
  const reportDate = new Date().toISOString().replace('T', ' ').split('.')[0] + ' UTC';
  
  let report = `# NX Affected Tasks Report

**Run Date:** ${reportDate}
**Duration:** ${duration} seconds

## 📊 Summary

| Metric | Count |
|--------|-------|
| ✅ Passed | **${passedTasks}** |
| ❌ Failed | **${failedTasks}** |
| 📦 Total | **${totalTasks}** |

`;

  // Add status message
  if (failedTasks === 0 && totalTasks > 0) {
    report += '### 🎉 All tasks passed!\n\n';
  } else if (failedTasks > 0) {
    report += `### ⚠️ ${failedTasks} task(s) failed\n\n`;
  } else if (totalTasks === 0) {
    report += '### ℹ️ No tasks were executed\n\n';
  }
  
  // Group tasks by project
  const projectMap = {};
  taskList.forEach(task => {
    if (!projectMap[task.project]) {
      projectMap[task.project] = [];
    }
    projectMap[task.project].push(task);
  });
  
  // Generate report by project
  report += '## 📦 Projects\n\n';
  
  Object.keys(projectMap).sort().forEach(project => {
    const projectTasks = projectMap[project];
    const projectPassed = projectTasks.filter(t => t.status === 'PASSED').length;
    const projectFailed = projectTasks.filter(t => t.status === 'FAILED').length;
    const projectStatus = projectFailed === 0 ? '✅' : '❌';
    
    report += `### ${projectStatus} ${project}\n\n`;
    report += `**Status:** ${projectPassed}/${projectTasks.length} tasks passed\n\n`;
    
    // Task table
    report += '| Task | Status | Details |\n';
    report += '|------|--------|---------|\n';
    
    projectTasks.forEach(task => {
      const status = task.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED';
      const details = taskDetails[task.key] || '-';
      
      // For test and e2e tasks with code blocks, show them separately
      if ((task.taskType === 'test' || task.taskType === 'e2e') && details.includes('```')) {
        report += `| ${task.taskType} | ${status} | See below |\n`;
      } else {
        report += `| ${task.taskType} | ${status} | ${details} |\n`;
      }
    });
    
    report += '\n';
    
    // Add test/e2e details below table if they exist
    projectTasks.forEach(task => {
      if ((task.taskType === 'test' || task.taskType === 'e2e') && taskDetails[task.key] && taskDetails[task.key].includes('```')) {
        report += `#### ${task.taskType} output:\n`;
        report += taskDetails[task.key] + '\n\n';
      }
    });
    
    // Add build URLs if any
    const hasBuildTask = projectTasks.some(task => task.fullTask.includes('build'));
    if (hasBuildTask && buildUrls[project]) {
      report += `#### 🔗 Build URLs:\n`;
      const previewUrl = buildUrls[project];
      const buildUrl = `https://${DEPLOYMENT_ENV}-env-${project.toLowerCase()}-example-monorepo-x-dev-space-ze.zephyrcloud.app/`;
      report += `- **Preview:** ${previewUrl}\n`;
      report += `- **${DEPLOYMENT_ENV.toUpperCase()}:** ${buildUrl}\n\n`;
    }
  });
  
  // Failed tasks list
  const failedTasksList = taskList.filter(t => t.status === 'FAILED');
  if (failedTasksList.length > 0) {
    report += '## ❌ Failed Tasks Summary\n\n';
    failedTasksList.forEach(task => {
      report += `- **${task.project}**:${task.taskType}\n`;
    });
    report += '\n';
  }
  
  report += `---\n_Full log: [${LOG_FILE}](${LOG_FILE})_\n`;
  
  fs.writeFileSync(REPORT_FILE, report);
  
  // Also write to GitHub Step Summary if available
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);
  }
}

function generateSummary() {
  const duration = Math.round((Date.now() - startTime) / 1000);
  const summary = {
    total: totalTasks,
    passed: passedTasks,
    failed: failedTasks,
    duration: duration,
    success: failedTasks === 0,
    error: false
  };
  
  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
  
  // Set GitHub Actions outputs if in CI
  if (process.env.GITHUB_ACTIONS) {
    const fs = require('fs');
    const outputFile = process.env.GITHUB_OUTPUT;
    
    fs.appendFileSync(outputFile, `total=${totalTasks}\n`);
    fs.appendFileSync(outputFile, `passed=${passedTasks}\n`);
    fs.appendFileSync(outputFile, `failed=${failedTasks}\n`);
    fs.appendFileSync(outputFile, `success=${failedTasks === 0}\n`);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Process interrupted');
  nxProcess.kill();
  process.exit(130);
});