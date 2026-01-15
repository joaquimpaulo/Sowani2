# Guia de Conversão para Android APK com Capacitor

## Configuração Completada ✓

Seu projeto web foi convertido com sucesso para Android usando Capacitor. Aqui está o que foi instalado e configurado:

### Pacotes Instalados
- `@capacitor/core` - Framework Capacitor
- `@capacitor/cli` - CLI do Capacitor
- `@capacitor/android` - Plataforma Android

### Arquivos Criados
- `capacitor.config.json` - Configuração do Capacitor
- Pasta `android/` - Projeto Android nativo (Gradle)

---

## Pré-requisitos para Gerar APK

### 1. Instalar Java Development Kit (JDK)
```bash
# Recomendado: Java 17 LTS
# Download: https://www.oracle.com/java/technologies/downloads/
# Ou use OpenJDK: https://adoptopenjdk.net/
```

### 2. Instalar Android SDK
```bash
# Opção A: Instalar Android Studio (recomendado)
https://developer.android.com/studio

# Opção B: Apenas Android SDK (sem IDE)
https://developer.android.com/studio#downloads
```

### 3. Definir Variáveis de Ambiente
Após instalar Android Studio, adicione as variáveis de ambiente:

**Windows (PowerShell)**:
```powershell
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\cmdline-tools\latest\bin"
$env:Path += ";$env:ANDROID_HOME\platform-tools"
```

**Ou edite as variáveis permanentemente**:
1. Pressione `Win + X` e abra "Configurações do Sistema Avançadas"
2. Clique em "Variáveis de Ambiente"
3. Adicione/Edite `ANDROID_HOME` apontando para o SDK
4. Adicione ao `PATH`: `%ANDROID_HOME%\cmdline-tools\latest\bin` e `%ANDROID_HOME%\platform-tools`

---

## Scripts npm Disponíveis

### Desenvolvimento
```bash
# Abrir Android Studio com o projeto
npm run android:build

# Apenas sincronizar arquivos
npm run cap:sync

# Build web
npm run build
```

### Gerar APK Release

```bash
# 1. Sincronizar código
npm run android:release

# 2. Abrir Android Studio
cd android
# Ou no PowerShell:
explorer android

# 3. No Android Studio:
#    - Build > Build Bundle(s) / APK(s) > Build APK(s)
#    - Ou: Build > Generate Signed Bundle / APK
```

---

## Processo Passo a Passo para Gerar APK

### Opção 1: Debug APK (Testes)

```bash
# No Windows PowerShell
cd c:\Users\administerator\Desktop\Sowani2\android

# Gerar Debug APK
gradlew.bat assembleDebug

# O APK estará em: android/app/build/outputs/apk/debug/
```

### Opção 2: Release APK (Produção)

```bash
# No Windows PowerShell
cd c:\Users\administerator\Desktop\Sowani2\android

# Gerar Release APK (requer keystore)
gradlew.bat assembleRelease

# Ou através do Android Studio:
# 1. Build > Generate Signed Bundle / APK
# 2. Selecionar "APK"
# 3. Criar/selecionar keystore
# 4. Seguir o wizard
```

---

## Permissões Necessárias

Verifique e configure as permissões em `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Conexão de rede -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Se usar câmera/galeria -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Se usar geolocalização -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## Configurações Importantes

### `capacitor.config.json`

Verifique e ajuste conforme necessário:

```json
{
  "appId": "com.sowani2.app",
  "appName": "Sowani2",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {}
}
```

---

## Troubleshooting

### ❌ Erro: `ANDROID_HOME não definido`
**Solução**: Defina as variáveis de ambiente (veja seção 3 acima)

### ❌ Erro: `Gradle não encontrado`
**Solução**: 
```bash
cd android
./gradlew --version
```

### ❌ Erro: `Java não encontrado`
**Solução**: Instale JDK 17 LTS e adicione ao PATH

### ❌ Firebase não funciona no Android
**Solução**: 
1. Configure `google-services.json` no `android/app/`
2. Sincronize Gradle: `npx cap sync android`

### ❌ Câmera/Permissões não funcionam
**Solução**: Use plugins Capacitor:
```bash
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/device
npx cap sync android
```

---

## Próximos Passos

1. ✅ Instale JDK e Android SDK
2. ✅ Configure variáveis de ambiente
3. ✅ Execute: `npm run android:build`
4. ✅ Abra o projeto em Android Studio
5. ✅ Execute no emulador ou dispositivo conectado
6. ✅ Gere o APK em modo Release

---

## Documentação Oficial

- [Capacitor Docs](https://capacitorjs.com/)
- [Android Docs](https://developer.android.com/)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Firebase para Android](https://firebase.google.com/docs/android/setup)

---

## Suporte

Para mais informações, consulte:
- `/android` - Projeto Android nativo (Gradle)
- `capacitor.config.json` - Configuração
- `package.json` - Scripts npm
