# Unit Testing in Angular

## Concetti Fondamentali

### 1. **TestBed** - L'ambiente di testing
```typescript
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
  providers: [
    { provide: AuthService, useValue: authServiceSpy }
  ]
}).compileComponents();
```
- Configura l'ambiente di test
- Simula il modulo Angular per i test
- Permette di iniettare servizi mock

### 2. **Spy Objects** - Mock dei servizi
```typescript
const authServiceSpy = jasmine.createSpyObj('AuthService', [
  'login', 'signup', 'saveAuthData'
]);
```
- Crea oggetti finti che simulano i servizi reali
- Permette di controllare cosa restituiscono i metodi
- Verifica se e come vengono chiamati i metodi

### 3. **HttpTestingController** - Mock delle chiamate HTTP
```typescript
const req = httpMock.expectOne('http://localhost:3001/api/auth/login');
req.flush(mockAuthResponse);
```
- Intercetta le chiamate HTTP
- Simula le risposte del server
- Verifica che le richieste siano corrette

### 4. **ComponentFixture** - Test dei componenti
```typescript
let fixture: ComponentFixture<AuthComponent>;
fixture.detectChanges(); // Trigger change detection
```
- Crea un'istanza del componente per i test
- Gestisce il ciclo di vita del componente
- Permette di testare template e logica

## Struttura dei Test

### **describe()** - Raggruppa i test correlati
```typescript
describe('AuthService', () => {
  describe('Login', () => {
    // Test specifici per il login
  });
});
```

### **beforeEach()** - Setup prima di ogni test
```typescript
beforeEach(() => {
  // Configurazione comune per tutti i test
});
```

### **afterEach()** - Pulizia dopo ogni test
```typescript
afterEach(() => {
  httpMock.verify(); // Verifica che non ci siano richieste pendenti
});
```

### **it()** - Singolo test case
```typescript
it('dovrebbe effettuare il login con successo', () => {
  // Logica del test
});
```

## Tipi di Test

### 1. **Test di Servizi**
- Verificano la logica di business
- Mock delle dipendenze esterne
- Test delle chiamate HTTP

### 2. **Test di Componenti**
- Verificano la logica del componente
- Test dei form e validazioni
- Test delle interazioni utente

### 3. **Test di Integrazione**
- Verificano l'interazione tra componenti
- Test del routing
- Test dei guard

## Comandi per Eseguire i Test

```bash
# Esegui tutti i test
ng test

# Esegui test in modalità watch
ng test --watch

# Esegui test specifici
ng test --include="**/auth.service.spec.ts"

# Genera report di coverage
ng test --code-coverage
```

## Best Practices

1. **Test Isolati**: Ogni test deve essere indipendente
2. **Setup Pulito**: Usa beforeEach/afterEach per pulizia
3. **Mock Appropriati**: Mock solo le dipendenze esterne
4. **Nomi Descritivi**: I nomi dei test devono essere chiari
5. **Assertion Specifici**: Verifica comportamenti specifici, non implementazioni

## Esempi di Assertion

```typescript
// Verifica uguaglianza
expect(response).toEqual(mockAuthResponse);

// Verifica chiamata di metodo
expect(authService.login).toHaveBeenCalledWith('user', 'pass');

// Verifica proprietà
expect(component.isLoading).toBe(true);

// Verifica errori
expect(() => service.method()).toThrowError('Errore atteso');
```
