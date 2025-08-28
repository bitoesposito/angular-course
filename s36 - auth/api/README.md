# API di Autenticazione

API REST per l'autenticazione degli utenti con Express.js e JWT.

## Installazione

```bash
cd api
npm install
```

## Configurazione

1. Copia `env.example` in `.env`
2. Modifica le variabili d'ambiente secondo le tue esigenze

## Avvio

```bash
# Sviluppo (con nodemon)
npm run dev

# Produzione
npm start
```

Il server sarà disponibile su `http://localhost:3001`

## Endpoints

### Autenticazione

#### POST `/api/auth/register`
Registra un nuovo utente.

**Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Risposta:**
```json
{
  "message": "Utente registrato con successo",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/login`
Effettua il login di un utente.

**Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```

**Risposta:**
```json
{
  "message": "Login effettuato con successo",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/auth/me`
Ottiene i dati dell'utente corrente (richiede token).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Risposta:**
```json
{
  "user": {
    "id": 1,
    "username": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/logout`
Effettua il logout (richiede token).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Risposta:**
```json
{
  "message": "Logout effettuato con successo"
}
```

### Utility

#### GET `/api/health`
Verifica lo stato del server.

**Risposta:**
```json
{
  "message": "API di autenticazione funzionante",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Sicurezza

- Password hashate con bcrypt (12 salt rounds)
- JWT token con scadenza 24h
- Validazione input con express-validator
- CORS configurato per Angular (localhost:4200)

## Note

- Database simulato in memoria (i dati si perdono al riavvio)
- In produzione, integrare un database reale (MongoDB, PostgreSQL, etc.)
- Cambiare la chiave JWT_SECRET in produzione
