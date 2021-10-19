# floss-alternatives-api

## Setup

Instal latest version of nodejs (v16.x.x)

Install podman

> This project uses [podman](https://podman.io/) over docker with the package [podman-compose](https://github.com/containers/podman-compose)

Start services:

```bash
podman-compose up -d
```

Install dependencies with npm:

```bash
npm install
```

Compile the typescript files:

```bash
npm run compile
```

Now you can run the project in development with auto compile and restart.

```bash
npm run dev-api
```

## Testing

Create test db:

```bash
podman exec api_database_1 createdb -U postgres test
```

Compile typescript files:

```bash
npm run compile
```

Run test:

```bash
npm test
```
