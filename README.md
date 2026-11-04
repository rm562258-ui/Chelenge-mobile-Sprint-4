# CLYVO VET — ClyvoCare Pet

Aplicativo mobile desenvolvido em **React Native + Expo** para o **Challenge FIAP 2026 — Sprint 4 (entrega final), consolidando as Sprints 1 a 3**, na disciplina de **Mobile Application Development**.

O **ClyvoCare Pet** é uma solução da CLYVO VET voltada para tutores de animais de estimação. O aplicativo centraliza informações importantes da rotina de cuidados do pet, como cadastro do animal, consultas veterinárias, vacinas, medicamentos, notificações e informações de apoio.

> **Escopo deste repositório:** este projeto corresponde à **Sprint 4 (entrega final), consolidando as Sprints 1 a 3**, de Mobile Application Development. Ele não representa as entregas de outras disciplinas.

## Problema escolhido

Tutores podem ter dificuldade para manter organizadas as informações e datas relacionadas à saúde dos seus pets, como consultas, vacinas e medicamentos. A falta de acompanhamento pode fazer com que consultas sejam perdidas, reforços de vacina passem do prazo e tratamentos sejam esquecidos.

Ao longo das sprints, o projeto transformou a ideia inicial em uma aplicação mobile funcional, com navegação real, autenticação, comunicação HTTP com uma API e operações de cadastro, consulta, alteração e exclusão. Na Sprint 4, o aplicativo recebeu notificações locais, tema claro/escuro e publicação.

## Solução proposta

O ClyvoCare Pet reúne em um único aplicativo recursos para organizar os cuidados do animal, permitindo ao tutor:

- criar uma conta e realizar login;
- recuperar a senha;
- manter a sessão autenticada;
- cadastrar, consultar, editar e excluir pets;
- cadastrar, consultar, editar e excluir consultas;
- registrar, consultar, editar e excluir vacinas;
- registrar, consultar, editar e excluir medicamentos;
- receber confirmações e lembretes de consultas e vacinas;
- visualizar alertas e o histórico de notificações;
- consultar informações frequentes sobre o uso do aplicativo e cuidados com o pet;
- acessar perfil, configurações, informações da equipe e dados da versão instalada.

## Funcionalidades

### Autenticação

- Cadastro de usuário.
- Login com e-mail e senha.
- Recuperação de senha.
- Persistência da sessão.
- Logout.
- Bloqueio das telas internas para usuários não autenticados.
- Validação dos formulários e mensagens de erro.

A autenticação utiliza **Firebase Authentication**.

### Início

- Resumo com a quantidade de pets, a próxima consulta, o próximo reforço de vacina e os medicamentos em andamento.
- Atalhos para as demais áreas do aplicativo.

### Pets

- Listagem de pets.
- Busca por nome.
- Cadastro de pet.
- Visualização dos detalhes.
- Edição.
- Exclusão, que remove junto as vacinas e os medicamentos do pet.
- Persistência local de apoio quando a conexão não está disponível, com os avisos "Salvo offline" e "Sincronizado".

### Consultas veterinárias

- Listagem de consultas na Agenda de Cuidados.
- Busca e filtro de consultas pendentes.
- Cadastro com seleção do pet, data, horário, tipo (Consulta ou Retorno), situação, lembrete, clínica, veterinário e notas.
- A consulta pode ser registrada no passado, no presente ou no futuro.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Marcação da consulta como concluída.
- Atualização do status conforme a data: uma consulta não concluída passa a "Atrasada" depois que o dia termina.
- Persistência local de apoio quando a conexão não está disponível.

### Vacinas

- Listagem da carteira vacinal.
- Busca e filtro das vacinas com reforço.
- Cadastro de vacina com seleção do pet.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Registro de dose e próximo reforço.

### Medicamentos

- Listagem de medicamentos.
- Busca e filtro dos tratamentos ativos.
- Cadastro de tratamento com seleção do pet.
- Visualização dos detalhes.
- Edição.
- Exclusão.
- Registro de dosagem, frequência e período do tratamento.

### Alertas e notificações

- Tela de alertas com as consultas não concluídas dos próximos 7 dias e os avisos gerados pelos cuidados.
- Histórico de notificações, da mais recente para a mais antiga, com a situação "Agendada" ou "Enviada".
- Exclusão de registros do histórico.

### Área de apoio veterinário

A tela identificada no aplicativo como **Perguntas frequentes (FAQ)** apresenta respostas para dúvidas comuns sobre cadastro de pets, consultas, vacinas e medicamentos.

> Essa tela é uma área de FAQ com **conteúdo estático**: as perguntas e respostas são previamente definidas no seed da API e carregadas por `GET /faq`. Ela **não deve ser descrita como uma IA generativa**.

### Perfil e configurações

- Perfil do pet, com os pets cadastrados, a clínica de referência e o próximo cuidado.
- Configurações do aplicativo: lembretes, aparência e atalhos.
- Tela com os integrantes do projeto.
- Tela Sobre o App, com os dados da versão instalada.

## Novidades da Sprint 4

### Tema claro e escuro

Em **Configurações > Aparência**, o usuário escolhe entre **Sistema**, **Claro** e **Escuro**. A escolha fica salva no aparelho e é mantida ao reabrir o aplicativo.

### Notificações locais

O aplicativo usa notificações locais em cenários reais de cuidado:

| Notificação | Evento que gera | Quando aparece |
|---|---|---|
| Consulta agendada | Cadastrar uma consulta futura que não esteja concluída | Na hora do cadastro |
| Lembrete de consulta | Cadastrar ou editar uma consulta com lembrete | No horário, 30 minutos, 1 hora ou 1 dia antes da consulta |
| Vacina registrada | Registrar uma vacina com próximo reforço | Na hora do cadastro |
| Lembrete de reforço de vacina | Registrar ou editar uma vacina com próximo reforço | Às 9h do dia anterior ao reforço |

- **Permissão:** é solicitada no primeiro agendamento ou ao ligar os lembretes em Configurações. Se for negada, o aplicativo continua funcionando e orienta o usuário a ativar as notificações nas configurações do sistema.
- **Toque na notificação:** abre a tela de detalhes da consulta ou da vacina correspondente.
- **Lembretes de cuidado:** o switch em Configurações desliga todos os lembretes. Ao ligar novamente, o aplicativo reagenda os lembretes de consultas e vacinas.
- **Edição:** o lembrete é reagendado com os novos dados.
- **Exclusão e conclusão:** excluir uma consulta ou vacina cancela o lembrete dela, assim como marcar a consulta como concluída.
- **Saída da conta:** o logout cancela os lembretes do aparelho. Ao entrar novamente, os lembretes que faltam são restaurados, desde que a permissão já tenha sido concedida e o switch esteja ligado.
- **Histórico:** cada notificação é registrada em `/notifications` e aparece na tela de histórico.

### Tela Sobre o App

Exibe o nome do aplicativo, a versão, o repositório, o host da API, a data do build, o hash do commit (completo e curto) e os integrantes.

### API hospedada na nuvem

A API está hospedada no **Render**, em plano gratuito: https://chelenge-mobile-sprint-4.onrender.com

A pasta `backend/` é um serviço próprio do JSON Server, que lê a porta da variável `PORT` e escuta em `0.0.0.0`. O aplicativo recebe o endereço da API por `EXPO_PUBLIC_API_URL` no momento do build e mostra o host em uso na tela Sobre o App.

### Publicação no Firebase App Distribution

O APK é distribuído pelo **Firebase App Distribution**. As instruções estão em [Como instalar o app publicado](#como-instalar-o-app-publicado).

## Versão publicada

- **Versão:** 1.0.0 (código de build 2)
- **Hash do commit:** `cdddcca6b409774b7dc878084357ff11fd1f1e23`
- **Hash curto:** `cdddcca`

Para conferir, abra o aplicativo instalado e acesse **Configurações > Sobre o App**. O hash aparece no bloco **Identificação da versão**.

Os commits posteriores ao hash acima alteram apenas o README.md; o código publicado é o do commit cdddcca6b409774b7dc878084357ff11fd1f1e23.

## Como instalar o app publicado

1. Abra o convite recebido por e-mail do **Firebase App Distribution**.
2. Aceite o convite.
3. Instale o aplicativo pelo link do convite ou pelo app **Firebase App Tester**.
4. Se o Android solicitar, permita a instalação do aplicativo.
5. Abra o ClyvoCare Pet e crie uma conta nova na tela de cadastro para testar.

A conta nova começa sem dados, pois cada tutor vê apenas os próprios registros.

## Tecnologias utilizadas

### Mobile

- React Native 0.81
- Expo SDK 54
- React 19.1, com React Compiler habilitado
- TypeScript
- JavaScript

### Navegação

- React Navigation
- `@react-navigation/native`
- `@react-navigation/stack`

A navegação principal do aplicativo é feita pelo **React Navigation**, com rotas declaradas no `src/navigation/AppNavigator.js`.

### Comunicação e dados

- Axios
- TanStack Query
- JSON Server
- AsyncStorage

### Autenticação

- Firebase Authentication

### Formulários e validação

- React Hook Form
- Zod

### Notificações

- Expo Notifications (notificações locais)

### Interface

- `StyleSheet` do React Native com paletas próprias de tema claro e escuro
- Componentes reutilizáveis próprios

### Build e publicação

- Expo Constants, para os dados da versão exibidos em Sobre o App
- EAS Build, com o perfil `preview` em `eas.json`
- Firebase App Distribution

## Arquitetura do projeto

A aplicação está organizada separando telas, componentes, hooks, contexto, serviços e API.

```text
Chelenge-mobile-Sprint-4/
├── assets/                 # Imagens e recursos visuais
├── src/
│   ├── api/                # Cliente Axios, endpoints, CRUD genérico e aquecimento da API
│   ├── components/ui/      # Componentes reutilizáveis
│   ├── config/             # Configuração de ambiente e dados da build
│   ├── constants/          # Constantes da aplicação
│   ├── context/            # Autenticação, tema, perfil e avisos (toast)
│   ├── hooks/              # Hooks do TanStack Query e lógica reutilizável
│   ├── navigation/         # Configuração do React Navigation
│   ├── providers/          # Provider do TanStack Query
│   ├── screens/            # Telas do aplicativo
│   ├── services/           # Serviços de CRUD, Firebase, notificações, lembretes e armazenamento offline
│   ├── theme/              # Paletas de cores
│   └── utils/              # Datas, validação, resumo da Home e funções utilitárias
├── backend/
│   ├── public/             # Pasta exigida pelo JSON Server em produção
│   ├── db.json             # Seed e armazenamento do JSON Server
│   └── package.json        # Serviço da API para hospedagem no Render
├── App.js                  # Ponto de entrada da aplicação
├── app.config.js           # Inclui o hash do commit e a data do build na configuração
├── app.json                # Configuração do Expo
├── eas.json                # Perfis de build do EAS
├── package.json            # Dependências e scripts
└── README.md
```

O fluxo de dados segue a ordem **Tela > Hook (TanStack Query) > Serviço > axios > API**. As telas não fazem chamadas HTTP: as requisições ficam nos serviços e as regras de negócio ficam em hooks, serviços e utilitários.

## Requisitos para executar

As etapas a seguir são para rodar o projeto em desenvolvimento. Antes de iniciar, instale:

- **Node.js LTS**, na versão 22.12 ou superior
- **Git**
- **Android Studio**, caso utilize o emulador Android
- Um dispositivo Android físico ou emulador Android
- Conta/projeto configurado no **Firebase Console**

O Expo é executado pelo projeto usando `npx expo`, portanto não é necessário instalar o Expo CLI globalmente.

## 1. Clonar o repositório

O repositório utilizado pelo projeto é:

```text
https://github.com/rm562258-ui/Chelenge-mobile-Sprint-4
```

Clone:

```bash
git clone https://github.com/rm562258-ui/Chelenge-mobile-Sprint-4
```

Entre na pasta:

```bash
cd Chelenge-mobile-Sprint-4
```

## 2. Instalar as dependências

Execute:

```bash
npm install
```

O diretório `node_modules` não precisa estar no repositório. Ele será criado pelo `npm install`.

## 3. Configurar o Firebase

O aplicativo utiliza o Firebase Authentication para cadastro, login, recuperação de senha e persistência da sessão.

Crie um arquivo chamado `.env` na raiz do projeto a partir do `.env.example`:

```bash
cp .env.example .env
```

No Prompt de Comando do Windows, use `copy .env.example .env`.

Preencha as seguintes variáveis:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_API_URL=
```

Use as credenciais do projeto configurado no Firebase Console. O valor de `EXPO_PUBLIC_API_URL` está descrito na seção 5. O aplicativo não inicia sem as variáveis do Firebase.

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

A API hospedada está disponível em:

```text
https://chelenge-mobile-sprint-4.onrender.com
```

A aplicação utiliza os seguintes endpoints:

| Método | Endpoint |
|---|---|
| GET | `/pets` |
| POST | `/pets` |
| GET | `/pets/:id` |
| PATCH | `/pets/:id` |
| DELETE | `/pets/:id` |
| GET | `/appointments` |
| POST | `/appointments` |
| PATCH | `/appointments/:id` |
| DELETE | `/appointments/:id` |
| GET | `/vaccines` |
| POST | `/vaccines` |
| PATCH | `/vaccines/:id` |
| DELETE | `/vaccines/:id` |
| GET | `/medications` |
| POST | `/medications` |
| PATCH | `/medications/:id` |
| DELETE | `/medications/:id` |
| GET | `/notifications` |
| POST | `/notifications` |
| DELETE | `/notifications/:id` |
| GET | `/faq` |

O código centraliza as URLs em `src/api/endpoints.ts` e as requisições são realizadas pelo cliente Axios em `src/api/client.ts`. O TanStack Query é utilizado nos hooks para consultas e mutações.

As listagens de pets, consultas, vacinas, medicamentos e notificações enviam `?userId=` com o identificador do usuário do Firebase, e os cadastros gravam esse mesmo campo no registro. A FAQ é igual para todos e não usa esse filtro. A alteração usa `PATCH` porque o `PUT` do JSON Server substitui o registro inteiro.

### Seed inicial

O arquivo `backend/db.json` traz registros iniciais de pets, consultas, vacinas e medicamentos, além das perguntas da FAQ. Como o aplicativo filtra os dados por `userId`, os registros do seed sem dono não aparecem para os tutores: eles podem ser vistos consultando a API diretamente.

## 5. Executar a API local

Abra um terminal na pasta do projeto e execute:

```bash
npm run api
```

A API ficará disponível na porta `3333`.

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
- **API hospedada, sem rodar a API local:** `https://chelenge-mobile-sprint-4.onrender.com`

Depois de alterar o `.env`, reinicie o Expo para que a variável seja carregada.

### Publicar a API no Render

Crie um serviço **Web Service** apontando para este repositório e configure:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

O serviço lê a porta atribuída pelo Render através de `PORT` e escuta em `0.0.0.0`. Após publicar, informe a URL HTTPS fornecida pelo Render em `EXPO_PUBLIC_API_URL`, no perfil `preview` do `eas.json`.

Essa variável é incorporada à build; não use `localhost`, IP privado ou `10.0.2.2` numa versão publicada. Em builds no EAS, o `.env` local não é utilizado: as variáveis do Firebase precisam estar cadastradas no ambiente `preview` do EAS.

### Limitação do plano gratuito

O serviço dorme depois de 15 minutos sem uso e leva cerca de 1 minuto para acordar. Se o aplicativo não carregar os dados, abra https://chelenge-mobile-sprint-4.onrender.com/pets no navegador, aguarde a resposta e tente novamente. O host em uso aparece em **Configurações > Sobre o App**.

O disco do plano gratuito é efêmero, portanto os dados criados podem voltar ao seed quando o serviço dorme ou reinicia.

> **Limitação de segurança:** a API JSON Server não implementa autenticação nem valida o token Bearer do Firebase enviado pelo aplicativo. Os dados servidos por essa API não têm controle de acesso por usuário.

## 6. Executar o aplicativo

Com o JSON Server rodando, abra um segundo terminal na pasta do projeto.

Execute:

```bash
npx expo start --clear --go
```

O Expo iniciará o Metro Bundler.

> A opção `--go` é necessária porque o projeto tem o `expo-dev-client` instalado. Sem ela, o Expo procura um build de desenvolvimento e mostra o erro "No development build".

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
npm start
```

Esse comando executa `expo start --go`.

### Testar as notificações

As notificações devem ser testadas em build nativo no emulador ou no APK publicado. Para gerar o build nativo:

```bash
npx expo run:android
```

Esse comando é o mesmo executado por `npm run android` e exige o Android SDK configurado. No Windows, caminhos muito longos podem fazer o build falhar; nesse caso, clone o projeto em uma pasta com caminho curto.

> No Expo Go, as notificações locais são exibidas, mas tocar em uma delas com o app em segundo plano abre o Expo Go, e não a tela de detalhes.

## 7. Ordem recomendada dos terminais

### Terminal 1 — API

```bash
npm run api
```

### Terminal 2 — Aplicativo

```bash
npx expo start --clear --go
```

Depois, pressione `a` para abrir no emulador Android.

## 8. Fluxo recomendado para testar

Para validar a aplicação, siga esta sequência:

1. Abrir o aplicativo.
2. Criar uma conta nova.
3. Confirmar que o usuário entra na área protegida.
4. Cadastrar dois pets.
5. Visualizar e buscar os pets cadastrados.
6. Abrir os detalhes de um pet.
7. Editar o pet.
8. Excluir um dos pets.
9. Cadastrar uma consulta para daqui a 3 minutos, com o lembrete **No horário**.
10. Aceitar a permissão de notificações e confirmar que a notificação "Consulta agendada" chegou.
11. Colocar o aplicativo em segundo plano e observar a notificação "Lembrete de consulta". Ela pode atrasar cerca de 1 a 2 minutos.
12. Tocar na notificação e confirmar que os detalhes da consulta foram abertos.
13. Consultar a consulta criada na Agenda de Cuidados.
14. Editar a consulta.
15. Marcar a consulta como concluída.
16. Excluir a consulta.
17. Cadastrar uma vacina com próximo reforço e confirmar a notificação "Vacina registrada".
18. Consultar a carteira vacinal.
19. Editar e excluir uma vacina.
20. Cadastrar um medicamento.
21. Consultar os medicamentos.
22. Editar e excluir um medicamento.
23. Consultar os alertas e o histórico de notificações.
24. Acessar a área de perguntas frequentes.
25. Acessar o perfil do pet e as configurações.
26. Alternar entre os temas Sistema, Claro e Escuro.
27. Desligar e ligar o switch de lembretes.
28. Abrir a tela de integrantes.
29. Abrir a tela Sobre o App e conferir o hash do commit.
30. Fechar e reabrir o aplicativo e confirmar que a sessão continua ativa.
31. Realizar logout.
32. Confirmar que as telas protegidas deixam de estar acessíveis.
33. Realizar login novamente.

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

As mutações invalidam as queries correspondentes para atualizar os dados apresentados na interface sem exigir reinicialização manual do aplicativo. Durante as requisições, as listas exibem estados de carregamento, erro e lista vazia.

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

Utilizado para armazenamento local, incluindo informações de sessão, escolha de tema, preferências do perfil, controle dos lembretes agendados e suporte ao funcionamento offline de pets e consultas.

### JSON Server

Utilizado pela API JSON Server para dados de pets, consultas, vacinas, medicamentos, histórico de notificações e perguntas da FAQ, definidos em `backend/db.json`.

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
- `Sobre`

O aplicativo possui 23 telas: 3 de autenticação e 20 da área protegida.

## 12. Scripts disponíveis

Os principais comandos definidos no `package.json` são:

```bash
npm start
```

Inicia o Expo no modo Expo Go.

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

Gera e executa o build nativo no Android.

```bash
npm run ios
```

Gera e executa o build nativo no iOS.

```bash
npm run web
```

Inicia a versão web.

```bash
npm run lint
```

Executa a verificação de lint configurada no projeto.

```bash
npm run commit:hash
```

Mostra o hash do commit atual.

```bash
npm run build:preview
```

Gera o APK pelo perfil `preview` do EAS. Exige o EAS CLI instalado.

```bash
npm run doctor
```

Executa o `expo-doctor`.

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
Cancelamento dos lembretes do aparelho
  ↓
Limpeza dos dados offline
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

**YouTube:** https://youtu.be/hEYpFOCBFKc

## 15. Integrantes

| Integrante | RM |
|---|---:|
| Carlos Alberto Guedes Neto | RM566022 |
| Eduardo Novaes Mollo | RM561515 |
| Luan Peixoto Marins Rocha | RM562258 |
| Mathaus Victor Souza Marcelino | RM564146 |
| Vinícius Luis Exposito Morassi Garcia | RM563340 |


## 16. Limitações conhecidas

- **API sem autenticação própria:** o JSON Server não valida o token do Firebase e é compartilhado entre os usuários. A separação por tutor é feita pelo filtro `userId` enviado pelo aplicativo, e não por controle de acesso no servidor.
- **Disco efêmero:** no plano gratuito, os dados criados podem voltar ao seed quando o serviço dorme ou reinicia, e ele dorme depois de 15 minutos sem uso.
- **Notificações locais, não push:** elas são agendadas no próprio aparelho, e o servidor não envia notificações. Apenas consultas e vacinas geram notificações; medicamentos não geram.
- **Entrega dos lembretes:** o Android pode atrasar um lembrete em cerca de 1 a 2 minutos. A opção "Forçar parada" do sistema cancela os lembretes já agendados.
- **Modo offline parcial:** apenas pets e consultas funcionam sem conexão. Vacinas, medicamentos, histórico de notificações e FAQ dependem da API, e um registro já sincronizado não pode ser excluído sem conexão.
- **Consultas e pets:** a consulta guarda o nome do pet. Editar ou excluir um pet não altera as consultas já registradas.
- **FAQ:** o conteúdo é estático e não há IA generativa no aplicativo.
- **Plataforma:** a publicação foi feita apenas para Android.
- **Tela Sobre o App:** o texto do repositório exibe o nome anterior, `Chelenge-mobile-Sprint-3`. O repositório da entrega é o indicado na seção 1.

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
[ ] npx expo start --clear --go executado
[ ] Aplicativo abriu no Android
[ ] Cadastro/login funcionando
[ ] CRUD de pets funcionando
[ ] CRUD de consultas funcionando
[ ] Vacinas funcionando
[ ] Medicamentos funcionando
[ ] Notificações funcionando
[ ] Tema claro/escuro funcionando
[ ] Hash do commit conferido em Sobre o App
[ ] Logout funcionando
[ ] Vídeo corresponde à versão entregue
[ ] Integrantes e RMs conferidos
```
