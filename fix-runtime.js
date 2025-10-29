import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Ruta al archivo de configuración de la función
const configPath = join(process.cwd(), '.vercel', 'output', 'functions', '_render.func', '.vc-config.json');

if (existsSync(configPath)) {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  
  // Cambiar el runtime a nodejs20.x
  if (config.runtime) {
    config.runtime = 'nodejs20.x';
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Runtime actualizado a nodejs20.x');
  }
} else {
  console.log('⚠️ Archivo de configuración no encontrado');
}
