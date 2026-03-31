#!/usr/bin/env node

const { spawnSync } = require('child_process');

const rawArgs = process.argv.slice(2);
const mode = ['free', 'premium'].includes(rawArgs[0]) ? rawArgs[0] : 'free';
const full = rawArgs.includes('--full');
const listOnly = rawArgs.includes('--list');

const FREE_STEPS = [
    { label: 'Type check', command: ['npm', 'run', 'typecheck'] },
    { label: 'Build artifacts check', command: ['node', 'scripts/build_artifacts.js', '--check'] },
    { label: 'Build outputs', command: ['node', '_test_build_outputs.js'] },
    { label: 'Free static bundle', command: ['node', '_test_free_static_bundle.js'] },
    { label: 'Deployment templates', command: ['node', '_test_deployment_templates.js'] },
    { label: 'Syntax', command: ['node', '_test_syntax.js'] },
    { label: 'Global regression', command: ['node', '_test_v3_global.js'] },
    { label: 'UI flow regression', command: ['node', '_test_ui_flow.js'] }
];

const FREE_FULL_EXTRA_STEPS = [
    { label: 'Commercial UI regression', command: ['node', '_test_commercial_ui.js'] },
    { label: 'Plant scoping regression', command: ['node', '_test_plant_scoping.js'] },
    { label: 'Project workspace regression', command: ['node', '_test_project_workspace.js'] },
    { label: 'Business context regression', command: ['node', '_test_business_context.js'] }
];

const PREMIUM_STEPS = [
    { label: 'Backend posture check', command: ['node', 'backend/server.js', '--check'] },
    { label: 'Backend admin regression', command: ['node', '_test_backend_admin_console.js'] },
    { label: 'Backend security regression', command: ['node', '_test_backend_security.js'] },
    { label: 'Backend sqlite regression', command: ['node', '--experimental-sqlite', '_test_backend_sqlite.js'] },
    { label: 'Backend backup/restore regression', command: ['node', '--experimental-sqlite', '_test_backend_backup_restore.js'] },
    { label: 'Backend backup retention regression', command: ['node', '_test_backend_backup_prune.js'] },
    { label: 'Premium operations readiness regression', command: ['node', '_test_premium_ops_readiness.js'] }
];

function buildSteps(selectedMode, includeFull) {
    const steps = [...FREE_STEPS];
    if (selectedMode === 'premium') {
        steps.push(...PREMIUM_STEPS);
    }
    if (includeFull) {
        steps.push(...FREE_FULL_EXTRA_STEPS);
    }
    return steps;
}

function printHeader(selectedMode, includeFull, steps) {
    console.log(`PV Release Gate`);
    console.log(`- mode: ${selectedMode}`);
    console.log(`- profile: ${includeFull ? 'full' : 'standard'}`);
    console.log(`- steps: ${steps.length}`);
}

function runStep(step, index, total) {
    console.log(`\n[${index + 1}/${total}] ${step.label}`);
    console.log(`> ${step.command.join(' ')}`);
    const result = spawnSync(step.command[0], step.command.slice(1), {
        stdio: 'inherit',
        shell: false
    });
    if (typeof result.status === 'number' && result.status !== 0) {
        return result.status;
    }
    if (result.error) {
        console.error(result.error.message || result.error);
        return 1;
    }
    return 0;
}

const steps = buildSteps(mode, full);

printHeader(mode, full, steps);

if (listOnly) {
    steps.forEach((step, index) => {
        console.log(`${index + 1}. ${step.label} :: ${step.command.join(' ')}`);
    });
    process.exit(0);
}

for (let index = 0; index < steps.length; index += 1) {
    const exitCode = runStep(steps[index], index, steps.length);
    if (exitCode !== 0) {
        console.error(`\nRelease gate failed at: ${steps[index].label}`);
        process.exit(exitCode);
    }
}

console.log(`\nRelease gate passed for mode=${mode}${full ? ' profile=full' : ''}.`);
