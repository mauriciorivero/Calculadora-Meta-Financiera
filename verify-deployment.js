/**
 * ============================================
 * SCRIPT DE VERIFICACIÓN PRE-DESPLIEGUE
 * Verifica que todo esté listo para Vercel
 * ============================================
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para despliegue en Vercel...\n');

let errors = 0;
let warnings = 0;

// Verificar archivos requeridos
console.log('📁 Verificando archivos requeridos...');
const requiredFiles = [
    'package.json',
    'vercel.json',
    '.env.example',
    '.gitignore',
    'index.html',
    'styles.css',
    'script.js',
    'api/lib/db.js',
    'api/lib/auth.js',
    'api/lib/response.js',
    'api/auth/login.js',
    'api/auth/register.js',
    'api/auth/me.js',
    'api/users/index.js',
    'api/users/[id].js',
    'api/goals/index.js',
    'api/goals/[id].js',
    'api/user-goals/index.js',
    'api/user-goals/[id].js',
    'database/schema.sql'
];

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - NO ENCONTRADO`);
        errors++;
    }
});

// Verificar package.json
console.log('\n📦 Verificando package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = ['mysql2', 'bcryptjs', 'jsonwebtoken', 'dotenv'];
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`  ❌ ${dep} - NO ENCONTRADO en dependencies`);
            errors++;
        }
    });
    
    if (packageJson.engines && packageJson.engines.node) {
        console.log(`  ✅ Node version: ${packageJson.engines.node}`);
    } else {
        console.log(`  ⚠️  Node version no especificada`);
        warnings++;
    }
} catch (error) {
    console.log(`  ❌ Error leyendo package.json: ${error.message}`);
    errors++;
}

// Verificar vercel.json
console.log('\n⚙️  Verificando vercel.json...');
try {
    const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelJson.version === 2) {
        console.log('  ✅ Version: 2');
    } else {
        console.log('  ❌ Version debe ser 2');
        errors++;
    }
    
    const requiredEnvVars = [
        'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 
        'DB_NAME', 'JWT_SECRET', 'JWT_EXPIRES_IN'
    ];
    
    if (vercelJson.env) {
        requiredEnvVars.forEach(envVar => {
            if (vercelJson.env[envVar]) {
                console.log(`  ✅ ${envVar} configurado`);
            } else {
                console.log(`  ❌ ${envVar} - NO CONFIGURADO`);
                errors++;
            }
        });
    } else {
        console.log('  ❌ No hay variables de entorno configuradas');
        errors++;
    }
} catch (error) {
    console.log(`  ❌ Error leyendo vercel.json: ${error.message}`);
    errors++;
}

// Verificar .env.example
console.log('\n🔐 Verificando .env.example...');
try {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    const requiredEnvVars = [
        'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 
        'DB_NAME', 'JWT_SECRET', 'JWT_EXPIRES_IN'
    ];
    
    requiredEnvVars.forEach(envVar => {
        if (envExample.includes(envVar)) {
            console.log(`  ✅ ${envVar}`);
        } else {
            console.log(`  ❌ ${envVar} - NO ENCONTRADO`);
            errors++;
        }
    });
} catch (error) {
    console.log(`  ❌ Error leyendo .env.example: ${error.message}`);
    errors++;
}

// Verificar .gitignore
console.log('\n🚫 Verificando .gitignore...');
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    const shouldIgnore = ['.env', 'node_modules'];
    
    shouldIgnore.forEach(item => {
        if (gitignore.includes(item)) {
            console.log(`  ✅ ${item} está ignorado`);
        } else {
            console.log(`  ⚠️  ${item} debería estar en .gitignore`);
            warnings++;
        }
    });
} catch (error) {
    console.log(`  ❌ Error leyendo .gitignore: ${error.message}`);
    errors++;
}

// Verificar que no haya .env en el proyecto
console.log('\n🔒 Verificando seguridad...');
if (fs.existsSync('.env')) {
    console.log('  ⚠️  Archivo .env encontrado - asegúrate de que esté en .gitignore');
    warnings++;
} else {
    console.log('  ✅ No hay archivo .env (correcto para despliegue)');
}

// Verificar estructura de API
console.log('\n🌐 Verificando estructura de API...');
const apiDirs = ['api/auth', 'api/users', 'api/goals', 'api/user-goals', 'api/lib'];
apiDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`  ✅ ${dir}/`);
    } else {
        console.log(`  ❌ ${dir}/ - NO ENCONTRADO`);
        errors++;
    }
});

// Resumen final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
    console.log('✅ ¡Todo listo para desplegar en Vercel!');
    console.log('\nPróximos pasos:');
    console.log('1. Configura las variables de entorno en Vercel Dashboard');
    console.log('2. Habilita Remote MySQL en SiteGround');
    console.log('3. Ejecuta: vercel --prod');
    console.log('\n📖 Lee DEPLOY.md para instrucciones detalladas');
    process.exit(0);
} else {
    console.log(`❌ Errores encontrados: ${errors}`);
    console.log(`⚠️  Advertencias: ${warnings}`);
    console.log('\nPor favor, corrige los errores antes de desplegar.');
    console.log('📖 Consulta DEPLOY.md y CHECKLIST.md para más información');
    process.exit(1);
}
