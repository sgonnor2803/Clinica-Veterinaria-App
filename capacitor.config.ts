import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'veterinariaApp',
  webDir: 'www',
  
  // 🔒 Certificate Pinning Configuration
  plugins: {
    Http: {
      // Use native HTTP implementation for certificate pinning
      useNativeImplementation: true,
      // Server configurations with certificate pinning
      serverConfig: {
        // Onrender API server pinning
        'clinica-veterinaria-api-sgvl.onrender.com': {
          pinning: {
            enabled: true,
            // Public key pins (SHA-256) - extract from server certificate
            // Command: openssl s_client -connect clinica-veterinaria-api-sgvl.onrender.com:443 -showcerts
            // | openssl x509 -noout -pubkey | openssl pkey -pubin -outform der 
            // | openssl dgst -sha256 -binary | base64
            publicKeyPins: [
              // Primary certificate pin (to be extracted in production)
              'PRIMARY_CERT_SHA256_PIN_HERE',
              // Backup certificate pin
              'BACKUP_CERT_SHA256_PIN_HERE'
            ],
            allowBackupPin: true,
            // Disable on localhost for development
            disableOnLocalhost: true
          }
        }
      }
    }
  }
};

export default config;
