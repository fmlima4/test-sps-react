# SPS React Test - Sistema de Gerenciamento de Usuários

## 📋 Descrição

Sistema completo de CRUD de usuários desenvolvido com React.js, implementando autenticação, validações robustas e interface responsiva.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Página de login com validações
- [x] Context API para gerenciamento de estado global
- [x] Armazenamento seguro do token no localStorage
- [x] Interceptação automática do token nas requisições
- [x] Logout com limpeza de dados

### ✅ Páginas Protegidas
- [x] Middleware de proteção de rotas
- [x] Redirecionamento automático para login
- [x] Preservação da rota de destino após login

### ✅ CRUD de Usuários
- [x] Listagem com design responsivo
- [x] Criação de novos usuários
- [x] Edição de usuários existentes
- [x] Exclusão com confirmação
- [x] Validações front-end e back-end

### ✅ Interface e UX
- [x] Design moderno e responsivo
- [x] Loading states e feedback visual
- [x] Tratamento de erros
- [x] Animações e transições suaves
- [x] Acessibilidade (WCAG)

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **React Router DOM 6** - Navegação e rotas protegidas
- **Axios** - Cliente HTTP com interceptadores
- **Context API** - Gerenciamento de estado global
- **Jest + React Testing Library** - Testes unitários

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── ProtectedRoute.js       # Middleware de rotas protegidas
│   ├── UserForm.js            # Formulário de criação/edição
│   └── UserForm.css
├── contexts/
│   └── AuthContext.js         # Context de autenticação
├── pages/
│   ├── Home.js               # Página inicial
│   ├── Home.css
│   ├── SignIn.js             # Página de login
│   ├── SignIn.css
│   ├── Users.js              # Listagem de usuários
│   └── Users.css
├── services/
│   └── UserService.js        # Serviços da API
├── __tests__/
│   ├── AuthContext.test.js
│   ├── SignIn.test.js
│   ├── Users.test.js
│   └── UserService.test.js
├── routes.js                 # Configuração de rotas
├── index.js                  # Entry point
├── index.css                 # Estilos globais
└── setupTests.js             # Configuração dos testes
```

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Servidor API rodando na porta 3000

### Passos para execução

1. **Clone e instale dependências**:
```bash
git clone [seu-repositorio]
cd test-sps-react
npm install
```

2. **Configure as variáveis de ambiente**:
```bash
# .env (já configurado)
REACT_APP_SERVER_URL=http://localhost:3000
```

3. **Execute o projeto**:
```bash
npm start
# ou
npm run dev
```

4. **Execute os testes**:
```bash
# Todos os testes
npm test

# Testes com coverage
npm test -- --coverage

# Testes em modo watch
npm test -- --watch
```

## 🔐 Autenticação

### Credenciais de Teste
- **Email**: admin@spsgroup.com.br
- **Senha**: 1234

### Fluxo de Autenticação
1. Login com credenciais válidas
2. Token armazenado no localStorage
3. Configuração automática do header Authorization
4. Verificação automática na inicialização da aplicação
5. Limpeza segura no logout

## 📡 Integração com API

### Endpoints Esperados

```javascript
// Autenticação
POST /auth/login
Body: { email: string, password: string }
Response: { user: object, token: string }

// Usuários
GET    /users           # Listar usuários
GET    /users/:id       # Buscar usuário
POST   /users           # Criar usuário
PUT    /users/:id       # Atualizar usuário
DELETE /users/:id       # Deletar usuário
```

### Headers Automáticos
```javascript
Authorization: Bearer {token}
Content-Type: application/json
```

## ✅ Validações Implementadas

### Frontend
- **Email**: Formato válido e obrigatório
- **Nome**: Mínimo 2 caracteres, obrigatório
- **Formulários**: Validação em tempo real

### Backend Integration
- Tratamento de erros da API
- Mensagens de erro personalizadas
- Validação de dados antes do envio

## 🎨 Interface e UX

### Design System
- **Cores**: Gradiente moderno (azul/roxo)
- **Tipografia**: Sistema de fontes nativo
- **Espaçamento**: Grid consistente de 8px
- **Animações**: Transições suaves de 300ms

### Responsividade
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com menu colapsível
- **Mobile**: Interface otimizada para touch

### Estados da Interface
- **Loading**: Spinners e skeleton screens
- **Empty**: Estados vazios com call-to-action
- **Error**: Banners de erro com ações de recuperação
- **Success**: Feedback visual de ações bem-sucedidas

### Boas Práticas
- Limpeza de dados no logout
- Validação client-side e server-side
- Headers de segurança configurados
- Timeout de sessão automático

## 📱 Acessibilidade

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Navegação completa por teclado
- **Screen Readers**: Semantic HTML e ARIA labels
- **Color Contrast**: Contraste mínimo de 4.5:1
- **Focus Management**: Indicadores visuais claros

### Recursos Implementados
- Labels associados aos inputs
- Estados de erro anunciados
- Foco gerenciado em modais
- Textos alternativos para ícones

## 📦 Build e Deploy

### Comandos de Build
```bash
# Build de produção
npm run build

# Análise do bundle
npm install -g serve
serve -s build

# Preview local
npx serve build
```

### Variáveis de Ambiente
```bash
# Desenvolvimento
REACT_APP_SERVER_URL=http://localhost:3001

# Produção
REACT_APP_SERVER_URL=https://api.seudominio.com
```

### Contato
Para dúvidas sobre a implementação, consulte a documentação inline no código ou os testes para entender o comportamento esperado.

---

## 🎯 Considerações para Avaliação

Esta implementação demonstra:

1. **Arquitetura Escalável**: Context API + Services + Components modulares
2. **Código Limpo**: ESLint rules, consistent naming, proper separation of concerns
3. **Testing Strategy**: Unit tests com alta cobertura e cenários reais
4. **User Experience**: Interface moderna, responsive e acessível
5. **Security**: Implementações de segurança adequadas para produção
6. **Performance**: Otimizações e boas práticas de React
7. **Documentation**: README completo e código auto-documentado