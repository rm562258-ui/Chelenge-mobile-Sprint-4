# CLYVO VET — ClyvoCare Pet

Aplicativo mobile desenvolvido em **React Native + Expo** para o **Challenge FIAP 2026 — Sprint 3**, na disciplina de **Mobile Application Development**.

O **ClyvoCare Pet** é uma solução da CLYVO VET voltada para tutores de animais de estimação. O aplicativo centraliza informações importantes da rotina de cuidados do pet, como cadastro do animal, consultas veterinárias, vacinas, medicamentos, notificações e informações de apoio.

> **Escopo deste repositório:** este projeto corresponde à **Sprint 3 de Mobile Application Development**. Ele não representa as entregas de outras disciplinas ou das Sprints posteriores.

## Problema escolhido

Tutores podem ter dificuldade para manter organizadas as informações e datas relacionadas à saúde dos seus pets, como consultas, vacinas e medicamentos. A falta de acompanhamento pode fazer com que cuidados importantes sejam esquecidos.

Na Sprint 3, o projeto transforma a ideia inicial em uma aplicação mobile funcional, com navegação real, autenticação, comunicação HTTP com uma API e operações de cadastro, consulta, alteração e exclusão.

A especificação da Sprint 3 exige que o aplicativo tenha fluxos funcionais, integração com API, autenticação real, organização do código e documentação de execução. fileciteturn1file1L62-L80

## Solução proposta

O ClyvoCare Pet reúne em um único aplicativo recursos para organizar os cuidados do animal, permitindo ao tutor:

- criar uma conta e realizar login;
- recuperar a senha;
- manter a sessão autenticada;
- cadastrar, consultar, editar e excluir pets;
- cadastrar, consultar, editar e excluir consultas;
- registrar e consultar vacinas;
- registrar e consultar medicamentos;
- visualizar alertas e notificações;
- consultar informações frequentes sobre o uso do aplicativo e cuidados com o pet;
- acessar perfil, configurações e informações da equipe.

A Sprint 3 determina que o aplicativo não seja apenas uma navegação de telas, mas execute ações reais e tenha integração de ponta a ponta com a API. fileciteturn1file9L529-L543

## Funcionalidades da Sprint 3

### Autenticação

- Cadastro de usuário.
- Login com e-mail e senha.
- Recuperação de senha.
- Persistência da sessão.
- Logout.
- Bloqueio das telas internas para usuários não autenticados.
- Validação dos formulários e mensagens de erro.

A autenticação utiliza **Firebase Authentication**, permitido expressamente no enunciado da Sprint 3. A especificação também exige persistência da sessão, proteção das telas e logout funcional. fileciteturn1file8L478-L497

### Pets

- Listagem de pets.
- Cadastro de pet.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Persistência local de apoio quando a conexão não está disponível.

### Consultas veterinárias

- Listagem de consultas.
- Cadastro.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Organização por data e status.
- Atualização do status da consulta conforme a data.

### Vacinas

- Listagem da carteira vacinal.
- Cadastro de vacina.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Registro de dose e próximo reforço.

### Medicamentos

- Listagem de medicamentos.
- Cadastro de tratamento.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Registro de dosagem, frequência e período do tratamento.

### Alertas e notificações

- Consulta de notificações.
- Exibição de alertas relacionados às consultas próximas.
- Histórico de notificações.

### Área de apoio veterinário

A tela identificada no aplicativo como **Perguntas frequentes (FAQ)** apresenta respostas para dúvidas comuns sobre cadastro de pets, consultas, vacinas e medicamentos.

> Nesta versão da Sprint 3, essa tela é uma área de FAQ. Ela **não deve ser descrita como uma IA generativa já integrada**, pois o código entregue atualmente apresenta perguntas e respostas previamente definidas.

### Perfil e configurações

- Visualização do perfil.
- Configurações do aplicativo.
- Tela com os integrantes do projeto.

## Tecnologias utilizadas

### Mobile

- React Native
- Expo
- TypeScript
- JavaScript

### Navegação

- React Navigation
- `@react-navigation/native`
- `@react-navigation/stack`

A navegação principal do aplicativo é feita pelo **React Navigation**, com rotas declaradas no `src/navigation/AppNavigator.js`.

O enunciado da Sprint 3 exige pelo menos 6 telas distintas e o uso de uma biblioteca de navegação com rotas explicitamente configuradas. fileciteturn1file0L10-L22

### Comunicação e dados

- Axios
- TanStack Query
- JSON Server
- AsyncStorage
- Expo Secure Store

### Autenticação

- Firebase Authentication

### Formulários e validação

- React Hook Form
- Zod

### Interface

- NativeWind
- Lucide React Native
- Componentes reutilizáveis próprios

## Arquitetura do projeto

A aplicação está organizada separando telas, componentes, hooks, contexto, serviços, API e tipos.

```text
Chelenge-mobile-Sprint-3/
├── assets/                 # Imagens e recursos visuais
├── src/
│   ├── api/                # Axios, endpoints e aquecimento da API
│   ├── components/         # Componentes reutilizáveis
│   ├── config/             # Configuração de ambiente e dados da build
│   ├── constants/          # Constantes da aplicação
│   ├── context/            # Contextos da aplicação e autenticação
│   ├── hooks/              # Hooks de API e lógica reutilizável
│   ├── navigation/         # Configuração do React Navigation
│   ├── providers/          # Providers, incluindo TanStack Query
│   ├── screens/            # Telas do aplicativo
│   ├── services/           # Serviços de autenticação, CRUD e notificações
│   ├── theme/              # Tema e paletas de cores
│   └── utils/              # Funções utilitárias
├── backend/
│   ├── db.json             # Seed e armazenamento do JSON Server
│   └── package.json        # Serviço da API para hospedagem no Render
├── App.js                  # Ponto de entrada da aplicação
├── app.json                # Configuração do Expo
├── package.json            # Dependências e scripts
└── README.md
```

A separação entre interface, lógica reutilizável e acesso à API está de acordo com o objetivo de organização arquitetural da Sprint 3. O enunciado determina que chamadas HTTP e regras de negócio não fiquem diretamente concentradas nos componentes de tela. fileciteturn1file3L182-L190

## Requisitos para executar

Antes de iniciar o projeto, instale:

- **Node.js LTS**
- **Git**
- **Android Studio**, caso utilize o emulador Android
- Um dispositivo Android físico ou emulador Android
- Conta/projeto configurado no **Firebase Console**

O Expo é executado pelo projeto usando `npx expo`, portanto não é necessário instalar o Expo CLI globalmente.

## 1. Clonar o repositório

O repositório utilizado pelo projeto é:

```text
https://github.com/rm562258-ui/Chelenge-mobile-Sprint-3.git
```

Clone:

```bash
git clone https://github.com/rm562258-ui/Chelenge-mobile-Sprint-3.git
```

Entre na pasta:

```bash
cd Chelenge-mobile-Sprint-3
```

## 2. Instalar as dependências

Execute:

```bash
npm install
```

O diretório `node_modules` não precisa estar no repositório. Ele será criado pelo `npm install`.

## 3. Configurar o Firebase

O aplicativo utiliza o Firebase Authentication para cadastro, login, recuperação de senha e persistência da sessão.

Crie um arquivo chamado `.env` na raiz do projeto.

Use as seguintes variáveis:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=SEU_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=SEU_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=SEU_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=SEU_APP_ID

# Desenvolvimento: emulador Android
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
```

Substitua os valores do Firebase pelas credenciais do projeto configurado no Firebase Console.

### Configurar o Firebase Authentication

No Firebase Console:

1. Acesse o projeto utilizado pelo aplicativo.
2. Abra **Authentication**.
3. Acesse **Sign-in method**.
4. Habilite **E-mail/Password**.
5. Salve a configuração.

Sem o provedor de e-mail/senha habilitado, o cadastro e o login não funcionarão.

> **Importante:** não publique o arquivo `.env` com credenciais reais no GitHub.

## 4. Configurar a API HTTP local

A API REST usa **JSON Server** e o arquivo `backend/db.json`. O mesmo serviço pode ser executado localmente ou hospedado no Render.

A aplicação possui endpoints para:

| Método | Endpoint |
|---|---|
| GET | `/pets` |
| POST | `/pets` |
| GET | `/pets/:id` |
| PUT | `/pets/:id` |
| DELETE | `/pets/:id` |
| GET | `/appointments` |
| POST | `/appointments` |
| GET | `/appointments/:id` |
| PUT | `/appointments/:id` |
| DELETE | `/appointments/:id` |
| GET | `/vaccines` |
| POST | `/vaccines` |
| GET | `/vaccines/:id` |
| PUT | `/vaccines/:id` |
| DELETE | `/vaccines/:id` |
| GET | `/medications` |
| POST | `/medications` |
| GET | `/medications/:id` |
| PUT | `/medications/:id` |
| DELETE | `/medications/:id` |
| GET | `/notifications` |
| GET | `/aiHistory` |

O código centraliza as URLs em `src/api/endpoints.ts` e as requisições são realizadas pelo cliente Axios em `src/api/client.ts`. O TanStack Query é utilizado nos hooks para consultas e mutações.

A especificação da Sprint 3 exige integração HTTP real, uso de TanStack Query, pelo menos duas funcionalidades dependentes da API e CRUD completo nas funcionalidades avaliadas. fileciteturn1file0L25-L42

## 5. Executar a API local

Abra um terminal na pasta do projeto e execute:

```bash
npm run api
```

A API ficará disponível na porta `3333`. O seed contém registros iniciais; o disco do plano gratuito do Render é efêmero, portanto os dados gravados na nuvem podem ser redefinidos quando a instância reiniciar.

Por padrão, para o **emulador Android do Android Studio**, utilize no `.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3333
```

### Se estiver usando um celular físico

O celular e o computador precisam estar conectados à mesma rede.

Descubra o endereço IP local do computador e altere:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3333
```

Exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3333
```

O endereço deve ser o IP real do computador na rede utilizada durante o teste.

### Se estiver usando outro ambiente

- **Android Emulator:** `http://10.0.2.2:3333`
- **iOS Simulator:** normalmente `http://localhost:3333`
- **Celular físico:** `http://IP_DO_COMPUTADOR:3333`

Depois de alterar o `.env`, reinicie o Expo para que a variável seja carregada.

### Publicar a API no Render

Crie um serviço **Web Service** apontando para este repositório e configure:

- **Root Directory:** `backend`
- **Build Command:** deixe vazio (ou `npm install`)
- **Start Command:** `npm start`

O serviço lê a porta atribuída pelo Render através de `PORT` e escuta em `0.0.0.0`. Após publicar, use a URL HTTPS fornecida pelo Render no `.env` usado para gerar a build do aplicativo:

```env
EXPO_PUBLIC_API_URL=https://SEU_SERVICO.onrender.com
```

Essa variável é incorporada à build; não use `localhost`, IP privado ou `10.0.2.2` numa versão publicada.

> **Limitação de segurança:** a API JSON Server não implementa autenticação nem valida o token Bearer do Firebase enviado pelo aplicativo. Os dados servidos por essa API não têm controle de acesso por usuário.

## 6. Executar o aplicativo

Com o JSON Server rodando, abra um segundo terminal na pasta do projeto.

Execute:

```bash
npx expo start --clear
```

O Expo iniciará o Metro Bundler.

### Android Studio — emulador Pixel 6

Para executar pelo Android Studio:

1. Abra o **Android Studio**.
2. Abra o **Device Manager / Virtual Device Manager**.
3. Crie ou selecione um dispositivo virtual.
4. Para reproduzir o ambiente utilizado no projeto, recomenda-se um **Pixel 6**.
5. Utilize uma imagem Android disponível no seu Android Studio, preferencialmente Android 14 ou superior.
6. Inicie o emulador.
7. Com o Metro Bundler aberto, pressione:

```text
a
```

O Expo deverá abrir o aplicativo no emulador Android.

### Alternativa pelo comando

Também é possível iniciar o projeto diretamente com:

```bash
npm run android
```

Esse comando executa `expo start --android`.

> O comando `npx expo run:android` não é o fluxo principal documentado neste projeto. Para esta entrega, utilize o Expo com o emulador ou dispositivo conectado.

## 7. Ordem recomendada dos terminais

### Terminal 1 — API

```bash
npm run api
```

### Terminal 2 — Aplicativo

```bash
npx expo start --clear
```

Depois, pressione `a` para abrir no emulador Android.

## 8. Fluxo recomendado para testar

Para validar a aplicação, siga esta sequência:

1. Abrir o aplicativo.
2. Criar uma conta.
3. Realizar login.
4. Confirmar que o usuário entra na área protegida.
5. Cadastrar um pet.
6. Visualizar os pets cadastrados.
7. Abrir os detalhes do pet.
8. Editar o pet.
9. Excluir o pet.
10. Cadastrar uma consulta.
11. Consultar a consulta criada.
12. Editar a consulta.
13. Excluir a consulta.
14. Cadastrar uma vacina.
15. Consultar a carteira vacinal.
16. Editar ou excluir uma vacina.
17. Cadastrar um medicamento.
18. Consultar os medicamentos.
19. Editar ou excluir um medicamento.
20. Consultar alertas e notificações.
21. Acessar a área de perguntas frequentes.
22. Acessar perfil e configurações.
23. Abrir a tela de integrantes.
24. Realizar logout.
25. Confirmar que as telas protegidas deixam de estar acessíveis.

## 9. CRUD e atualização da interface

As operações de CRUD são implementadas por serviços e hooks específicos.

Exemplo de organização:

```text
Tela
 ↓
Hook (TanStack Query)
 ↓
Service
 ↓
Axios
 ↓
API HTTP / JSON Server
 ↓
backend/db.json
```

As mutações invalidam as queries correspondentes para atualizar os dados apresentados na interface sem exigir reinicialização manual do aplicativo.

O enunciado exige que as alterações feitas pelo usuário sejam refletidas automaticamente na interface e que existam estados de carregamento durante as requisições. fileciteturn1file8L464-L475

## 10. Persistência

O projeto utiliza mecanismos diferentes para finalidades diferentes:

### Firebase Authentication

Responsável pela autenticação real:

- criação da conta;
- login;
- recuperação de senha;
- manutenção da sessão;
- logout.

### AsyncStorage

Utilizado para armazenamento local, incluindo informações de sessão e suporte ao funcionamento offline de determinadas entidades.

### Expo Secure Store

Utilizado para armazenamento seguro de informações relacionadas à sessão/token.

### JSON Server

Utilizado pela API JSON Server para dados de pets, consultas, vacinas, medicamentos e demais recursos definidos em `backend/db.json`.

## 11. Telas e rotas

A navegação principal está configurada em `src/navigation/AppNavigator.js`.

### Autenticação

- `Login`
- `Register`
- `ForgotPassword`

### Aplicação

- `Home`
- `Pets`
- `PetDetails`
- `CadastroPet`
- `PerfilPet`
- `AppointmentForm`
- `AppointmentDetails`
- `Vaccines`
- `VaccineForm`
- `VaccineDetails`
- `Medications`
- `MedicationForm`
- `MedicationDetails`
- `AgendaCuidados`
- `Alertas`
- `HistoricoNotificacoes`
- `IaVeterinaria`
- `Configuracoes`
- `Equipe`

O aplicativo possui mais de 6 telas distintas, atendendo à quantidade mínima prevista no requisito de navegação da Sprint 3. fileciteturn1file0L10-L22

## 12. Scripts disponíveis

Os principais comandos definidos no `package.json` são:

```bash
npm start
```

Inicia o Expo.

```bash
npm run dev
```

Inicia o Expo utilizando a porta `8082`.

```bash
npm run api
```

Inicia o JSON Server na porta `3333`.

```bash
npm run android
```

Inicia o Expo direcionado ao Android.

```bash
npm run ios
```

Inicia o Expo direcionado ao iOS.

```bash
npm run web
```

Inicia a versão web.

```bash
npm run lint
```

Executa a verificação de lint configurada no projeto.

## 13. Estrutura da autenticação

O controle de acesso é realizado pelo `AuthProvider` e pelo `AppNavigator`.

O fluxo é:

```text
Usuário não autenticado
        ↓
Login / Cadastro
        ↓
Firebase Authentication
        ↓
Sessão autenticada
        ↓
AppStack
        ↓
Telas protegidas
```

Ao realizar logout:

```text
Logout
  ↓
Firebase signOut
  ↓
Limpeza da sessão
  ↓
Usuário não autenticado
  ↓
AuthStack
```


## 14. Vídeo de demonstração

Vídeo de demonstração do projeto:

**YouTube:** https://youtu.be/o4Tgl3FewcU

## 15. Integrantes

| Integrante | RM |
|---|---:|
| Carlos Alberto Guedes Neto | RM566022 |
| Eduardo Novaes Mollo | RM561515 |
| Luan Peixoto Marins Rocha | RM562258 |
| Mathaus Victor Souza Marcelino | RM564146 |
| Vinícius Luis Exposito Morassi Garcia | RM563340 |


## Checklist rápido

```text
[ ] Node.js instalado
[ ] Git instalado
[ ] Android Studio/emulador configurado
[ ] npm install executado
[ ] Firebase Authentication configurado
[ ] .env criado e configurado
[ ] EXPO_PUBLIC_API_URL configurado
[ ] npm run api executado
[ ] npx expo start --clear executado
[ ] Aplicativo abriu no Android
[ ] Cadastro/login funcionando
[ ] CRUD de pets funcionando
[ ] CRUD de consultas funcionando
[ ] Vacinas funcionando
[ ] Medicamentos funcionando
[ ] Logout funcionando
[ ] Vídeo corresponde à versão entregue
[ ] Integrantes e RMs conferidos
```
