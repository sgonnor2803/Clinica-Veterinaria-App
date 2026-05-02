# Extract server certificate
$cert = [System.Net.ServicePointManager]::FindServicePoint('https://clinica-veterinaria-api-sgvl.onrender.com').Certificate
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
$base64 = [Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks)

$pemContent = "-----BEGIN CERTIFICATE-----`n" + $base64 + "`n-----END CERTIFICATE-----"
$pemContent | Out-File -Encoding UTF8 -FilePath "server-cert.pem"

Write-Host "Certificate saved to server-cert.pem"
Get-Content server-cert.pem
