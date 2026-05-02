export const environment = {
  production: true,
  apiUrl: 'https://clinica-veterinaria-api-sgvl.onrender.com/',
  apiTimeout: 30000,
  
  // 🔒 Configuración de Seguridad - PRODUCCIÓN
  security: {
    enableTokenEncryption: true,      // ✅ AES-256 encryption OBLIGATORIO
    enableRootDetection: true,         // ✅ Detectar jailbreak/root
    enableCertificatePinning: true,    // ✅ Certificate pinning habilitado
    enableAntiTampering: true,         // ✅ Verificación de integridad
    enableDebugProtection: true,       // ✅ Deshabilitar DevTools/Console
    enableDevToolsDetection: true      // ✅ Detectar si DevTools está abierto
  }
};

