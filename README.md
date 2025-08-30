```
npm install
npm run dev
```

```
open http://localhost:3000
```

```
1. Stop all containers: `docker-compose -f docker/docker-compose.yml down`
2. Export data from the old volume: `docker run --rm -v postgres_data:/data -v $(pwd):/backup postgres:15-alpine tar czf /backup/postgres_backup.tar.gz /data`
3. Start with new configuration: `docker-compose -f docker/docker-compose.yml up -d`
```
