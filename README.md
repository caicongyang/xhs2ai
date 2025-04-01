# XHS2AI - AI Content Generation Platform

A platform for generating images, videos, covers, and content using AI models.

## Docker Setup

This project uses Docker and docker-compose for easy deployment and development.

### Prerequisites

- Docker Engine (20.10+)
- Docker Compose (3.8+)
- Git

### Environment Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/xhs2ai.git
   cd xhs2ai
   ```

2. Create an environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your LLM API credentials:
   ```
   LLM_API_KEY=your_actual_api_key
   LLM_BASE_URL=your_actual_api_base_url
   ```

### Building and Running

1. Build and start all services:
   ```bash
   docker-compose up -d
   ```

2. Access the application:
   - Web interface: http://localhost
   - API docs: http://localhost/api/docs

### Docker Services

- **web**: Next.js frontend application
- **server**: Python FastAPI backend service
- **nginx**: Nginx web server for routing and serving static files

### Volumes

- **server_outputs**: Persistent storage for generated output files
- **server_templates**: Persistent storage for generated template files

### Development Mode

For development with hot-reloading:

```bash
# Run frontend in development mode
docker-compose -f docker-compose.dev.yml up -d web

# Run backend in development mode
docker-compose -f docker-compose.dev.yml up -d server
```

### Troubleshooting

- **Permission issues**: If you encounter permission issues with the mounted volumes, run:
  ```bash
  sudo chown -R $(id -u):$(id -g) ./server/outputs ./server/templates
  ```

- **Port conflicts**: If port 80 is already in use, modify the port mapping in `docker-compose.yml`:
  ```yaml
  nginx:
    ports:
      - "8080:80"  # Change 80 to another port
  ```

## License

[MIT License](LICENSE)
